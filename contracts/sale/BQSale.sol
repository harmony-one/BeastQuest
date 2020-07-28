pragma solidity 0.6.8;

import "./FixedSupplyLotSale.sol";
import "../token/BeastQuest.sol";

contract BQSale is FixedSupplyLotSale {
    constructor(
        address payable payoutWallet,
        IERC20 payoutTokenAddress,
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
