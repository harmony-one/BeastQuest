pragma solidity 0.6.8;

import "./FixedSupplyLotSale.sol";
import "../token/BeastQuest.sol";

contract BQSale is FixedSupplyLotSale {
    uint256[] public _nonFungibleSupply;
    uint256 public _seed;
    uint256 public _lastUsedSeed;
    uint256 public constant _MIN_SUPPLY = 50;

    event RunningOutOfSupply(uint256 currentSupply);

    IERC20 public constant payoutTokenAddress = IERC20(0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee);

    constructor(
        address payable payoutWallet,
        // IERC20 payoutTokenAddress,
        uint256 fungibleTokenId,
        address inventoryContract
    )
        public
        FixedSupplyLotSale(
            payoutWallet,
            payoutTokenAddress,
            fungibleTokenId,
            inventoryContract
        )
    {}

    /**
     * @dev Sets or updates the nonFungibleSupply for the sale.
     * @param nonFungibleSupply supply to be updated.
     */
    function updateNonFungibleSupply(uint256[] memory nonFungibleSupply)
        public
        onlyOwner
    // whenNotStarted
    {
        require(nonFungibleSupply.length > 0);
        _nonFungibleSupply = nonFungibleSupply;
    }

    function setRandomnessSeed(uint256 seed) public onlyOwner // whenNotStarted
    {
        _seed = seed;
    }

    function _randomlySelectAndUpdate(uint256 quantity)
        internal
        override
        returns 
        (
            uint256[] memory
        )
    {
        uint256 supplySize = _nonFungibleSupply.length;

        require(supplySize >= quantity, "not enough supply");
        require(_lastUsedSeed != _seed, "seed not updated from last purchase");

        _lastUsedSeed = _seed;

        uint256[] memory randomizedSupply = new uint256[](supplySize);

        for (uint256 index = 0; index < supplySize; index++) {
            uint256 tokenId = _nonFungibleSupply[index];
            uint256 newIndex = uint256(
                keccak256(abi.encode(tokenId, now, block.number, _seed))
            ) % supplySize;
            uint256 newNewIndex = newIndex;
            while (randomizedSupply[newNewIndex] != 0) {
                newNewIndex = (newNewIndex + 1) % supplySize;
            }
            newIndex = newNewIndex;
            randomizedSupply[newIndex] = tokenId;
        }

        uint256[] memory selected = new uint256[](quantity);
        for (uint256 index = 0; index < quantity; index++) {
            selected[index] = randomizedSupply[index];
        }

        uint256[] memory newSupply = new uint256[](supplySize - quantity);
        for (uint256 index = quantity; index < supplySize; index++) {
            newSupply[index - quantity] = randomizedSupply[index];
        }

        _nonFungibleSupply = newSupply;

        if (_nonFungibleSupply.length < _MIN_SUPPLY) {
            emit RunningOutOfSupply(_nonFungibleSupply.length);
        }

        return selected;
    }

    function _purchaseForDelivery(PurchaseForVars memory purchaseForVars)
        internal
        override
    {
        require(purchaseForVars.recipient != address(0));
        require(purchaseForVars.recipient != address(uint160(address(this))));

        // populate batch with non-fungible mint information
        for (
            uint256 index = 0;
            index < purchaseForVars.nonFungibleTokens.length;
            index++
        ) {
            BeastQuest(_inventoryContract).mint(
                purchaseForVars.recipient,
                purchaseForVars.nonFungibleTokens[index]
            );
        }
    }
}
