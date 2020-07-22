pragma solidity >=0.4.21 <0.6.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract BeastQuest is ERC721 {

    /*** EVENTS ***/

    /// @dev The Birth event is fired whenever a new player comes into existence.
    event Birth(uint256 tokenId, string name, address owner);
    event Snatch(uint256 tokenId, address oldOwner, address newOwner);

    /// @dev The TokenSold event is fired whenever a token is sold.
    event TokenSold(
        uint256 indexed tokenId,
        uint256 oldPrice,
        uint256 newPrice,
        address prevOwner,
        address indexed winner,
        string name
    );

    /// @dev Transfer event as defined in current draft of ERC721.
    /// ownership is assigned, including births.
    event Transfer(address from, address to, uint256 tokenId);

    /*** CONSTANTS ***/

    /// @notice Name and symbol of the non fungible token, as defined in ERC721.
    string public constant NAME = "BeastQuestUltimateHeroes";
    string public constant SYMBOL = "BQUH";

    uint256 private startingPrice = 100000000000000000000; // 100 ONEs
    uint256 private constant PROMO_CREATION_LIMIT = 5000;

    /*** STORAGE ***/

    /// @dev A mapping from player IDs to the address that owns them. All players have
    ///    some valid owner address.
    mapping (uint256 => address) public playerIndexToOwner;

    // @dev A mapping from owner address to count of tokens that address owns.
    //    Used internally inside balanceOf() to resolve ownership count.
    mapping (address => uint256) private ownershipTokenCount;

    /// @dev A mapping from PlayerIDs to an address that has been approved to call
    ///    transferFrom(). Each Player can only have one approved address for transfer
    ///    at any time. A zero value means no approval is outstanding.
    mapping (uint256 => address) public playerIndexToApproved;

    // @dev A mapping from PlayerIDs to the price of the token.
    mapping (uint256 => uint256) private playerIndexToPrice;

    // @dev A mapping from PlayerIDs to the number of transactions.
    mapping (uint256 => uint256) private playerIndexToTxns;

    // The addresses of the accounts (or contracts) that can execute actions within each roles.
    address public ceoAddress;

    uint256 public promoCreatedCount;

    /*** DATATYPES ***/
    struct Player {
        string name;
        uint256 internalPlayerId;
    }

    Player[] private players;

    /*** ACCESS MODIFIERS ***/
    /// @dev Access modifier for CEO-only functionality
    modifier onlyCEO() {
        require(msg.sender == ceoAddress, "sender must the ceo");
        _;
    }

    /// Access modifier for contract owner only functionality
    modifier onlyCLevel() {
        require(msg.sender == ceoAddress, "sender must be a contract owner");
        _;
    }

    /*** CONSTRUCTOR ***/
    constructor() public {
        ceoAddress = msg.sender;
    }

    /*** PUBLIC FUNCTIONS ***/
    /// @notice Grant another address the right to transfer token via takeOwnership() and transferFrom().
    /// @param _to The address to be granted transfer approval. Pass address(0) to
    ///    clear all approvals.
    /// @param _tokenId The ID of the Token that can be transferred if this call succeeds.
    /// @dev Required for ERC-721 compliance.
    function approve(
        address _to,
        uint256 _tokenId
    ) public {
        // Caller must own token.
        require(_owns(msg.sender, _tokenId), "call must own the token");

        playerIndexToApproved[_tokenId] = _to;

        emit Approval(msg.sender, _to, _tokenId);
    }

    /// For querying balance of a particular account
    /// @param _owner The address for balance query
    /// @dev Required for ERC-721 compliance.
    function balanceOf(address _owner) public view returns (uint256 balance) {
        return ownershipTokenCount[_owner];
    }

    /// @dev Creates a new promo Player with the given name, with given _price and assignes it to an address.
    function createPromoPlayer(address _owner, string memory _name, uint256 _price, uint256 _internalPlayerId) public onlyCEO {
        require(promoCreatedCount < PROMO_CREATION_LIMIT, "promo player creation cannot exceed limit");

        address playerOwner = _owner;
        if (playerOwner == address(0)) {
            playerOwner = ceoAddress;
        }

        if (_price <= 0) {
            _price = startingPrice;
        }

        promoCreatedCount++;
        _createPlayer(_name, playerOwner, _price, _internalPlayerId);
    }

    /// @dev Creates a new Player with the given name.
    function createContractPlayer(string memory _name, uint256 _internalPlayerId) public onlyCEO {
        _createPlayer(_name, address(this), startingPrice, _internalPlayerId);
    }

    /// @notice Returns all the relevant information about a specific player.
    /// @param _tokenId The tokenId of the player of interest.
    function getPlayer(uint256 _tokenId) public view returns (
        string memory playerName,
        uint256 internalPlayerId,
        uint256 sellingPrice,
        address owner,
        uint256 transactionCount
    ) {
        Player storage player = players[_tokenId];
        playerName = player.name;
        internalPlayerId = player.internalPlayerId;
        sellingPrice = playerIndexToPrice[_tokenId];
        owner = playerIndexToOwner[_tokenId];
        transactionCount = playerIndexToTxns[_tokenId];
    }

    function implementsERC721() public pure returns (bool) {
        return true;
    }

    /// @dev Required for ERC-721 compliance.
    function name() public pure returns (string memory) {
        return NAME;
    }

    /// For querying owner of token
    /// @param _tokenId The tokenID for owner inquiry
    /// @dev Required for ERC-721 compliance.
    function ownerOf(uint256 _tokenId)
        public
        view
        returns (address owner)
    {
        owner = playerIndexToOwner[_tokenId];
        require(owner != address(0), "owner should have valid address");
    }

    function payout(address _to) public onlyCLevel {
        _payout(_to);
    }

    // Allows someone to send ether and obtain the token
    function purchase(uint256 _tokenId) public payable {
        address oldOwner = playerIndexToOwner[_tokenId];
        address newOwner = msg.sender;

        uint256 sellingPrice = playerIndexToPrice[_tokenId];

        // Making sure token owner is not sending to self
        require(oldOwner != newOwner, "cannot self purchase");

        // Safety check to prevent against an unexpected 0x0 default.
        require(_addressNotNull(newOwner), "new owner should have a non-nil address");

        // Making sure sent amount is greater than or equal to the sellingPrice
        require(msg.value >= sellingPrice, "purchase value must be greater than selling price");

        uint256 commission = SafeMath.div(SafeMath.mul(sellingPrice, 2), 100);
        uint256 payment = SafeMath.sub(sellingPrice, commission);
        uint256 purchaseExcess = SafeMath.sub(msg.value, sellingPrice);

        // Update prices
        playerIndexToPrice[_tokenId] = SafeMath.add(sellingPrice, SafeMath.div(SafeMath.mul(sellingPrice, 15), 100));

        _transfer(oldOwner, newOwner, _tokenId);
        emit Snatch(_tokenId, oldOwner, newOwner);

        // Pay previous tokenOwner if owner is not contract
        if (oldOwner != address(this)) {
            address(uint160(oldOwner)).transfer(payment);
        }
        // Pay commission to ceo
        if (ceoAddress != address(this)) {
            address(uint160(ceoAddress)).transfer(commission);
        }

        playerIndexToTxns[_tokenId] = playerIndexToTxns[_tokenId] + 1;
        emit TokenSold(_tokenId, sellingPrice, playerIndexToPrice[_tokenId], oldOwner, newOwner, players[_tokenId].name);

        msg.sender.transfer(purchaseExcess);
    }

    function priceOf(uint256 _tokenId) public view returns (uint256 price) {
        return playerIndexToPrice[_tokenId];
    }

    function transactionCountOf(uint256 _tokenId) public view returns (uint256 price) {
        return playerIndexToTxns[_tokenId];
    }

    /// @dev Assigns a new address to act as the CEO. Only available to the current CEO.
    /// @param _newCEO The address of the new CEO
    function setCEO(address _newCEO) public onlyCEO {
        require(_newCEO != address(0), "new CEO address should be valid");

        ceoAddress = _newCEO;
    }

    /// @dev Required for ERC-721 compliance.
    function symbol() public pure returns (string memory) {
        return SYMBOL;
    }

    /// @notice Allow pre-approved user to take ownership of a token
    /// @param _tokenId The ID of the Token that can be transferred if this call succeeds.
    /// @dev Required for ERC-721 compliance.
    function takeOwnership(uint256 _tokenId) public {
        address newOwner = msg.sender;
        address oldOwner = playerIndexToOwner[_tokenId];

        // Safety check to prevent against an unexpected 0x0 default.
        require(_addressNotNull(newOwner), "new owner should have a valid address");

        // Making sure transfer is approved
        require(_approved(newOwner, _tokenId));

        _transfer(oldOwner, newOwner, _tokenId);
    }

    /// @param _owner The owner whose soccer player tokens we are interested in.
    /// @dev This method MUST NEVER be called by smart contract code. First, it's fairly
    ///    expensive (it walks the entire Players array looking for players belonging to owner),
    ///    but it also returns a dynamic array, which is only supported for web3 calls, and
    ///    not contract-to-contract calls.
    function tokensOfOwner(address _owner) public view returns(uint256[] memory ownerTokens) {
        uint256 tokenCount = balanceOf(_owner);
        if (tokenCount == 0) {
                // Return an empty array
            return new uint256[](0);
        } else {
            uint256[] memory result = new uint256[](tokenCount);
            uint256 totalPlayers = totalSupply();
            uint256 resultIndex = 0;

            uint256 playerId;
            for (playerId = 0; playerId <= totalPlayers; playerId++) {
                if (playerIndexToOwner[playerId] == _owner) {
                    result[resultIndex] = playerId;
                    resultIndex++;
                }
            }
            return result;
        }
    }

    /// For querying totalSupply of token
    /// @dev Required for ERC-721 compliance.
    function totalSupply() public view returns (uint256 total) {
        return players.length;
    }

    /// Owner initates the transfer of the token to another account
    /// @param _to The address for the token to be transferred to.
    /// @param _tokenId The ID of the Token that can be transferred if this call succeeds.
    /// @dev Required for ERC-721 compliance.
    function transfer(
        address _to,
        uint256 _tokenId
    ) public {
        require(_owns(msg.sender, _tokenId), "sender should own the token to transfer");
        require(_addressNotNull(_to), "transfer to address must be valid");

        _transfer(msg.sender, _to, _tokenId);
    }

    /// Third-party initiates transfer of token from address _from to address _to
    /// @param _from The address for the token to be transferred from.
    /// @param _to The address for the token to be transferred to.
    /// @param _tokenId The ID of the Token that can be transferred if this call succeeds.
    /// @dev Required for ERC-721 compliance.
    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) public {
        require(_owns(_from, _tokenId), "transfer from address must own the token");
        require(_approved(_to, _tokenId), "transfer to address must be approved");
        require(_addressNotNull(_to), "transfer to address must be valid");

        _transfer(_from, _to, _tokenId);
    }

    /*** PRIVATE FUNCTIONS ***/
    /// Safety check on _to address to prevent against an unexpected 0x0 default.
    function _addressNotNull(address _to) private pure returns (bool) {
        return _to != address(0);
    }

    /// For checking approval of transfer for address _to
    function _approved(address _to, uint256 _tokenId) private view returns (bool) {
        return playerIndexToApproved[_tokenId] == _to;
    }

    /// For creating Player
    function _createPlayer(string memory _name, address _owner, uint256 _price, uint256 _internalPlayerId) private {
        Player memory _player = Player({
            name: _name,
            internalPlayerId: _internalPlayerId
        });
        uint256 newPlayerId = players.push(_player) - 1;

        // It's probably never going to happen, 4 billion tokens are A LOT, but
        // let's just be 100% sure we never let this happen.
        require(newPlayerId == uint256(uint32(newPlayerId)), "new player id must be valid");

        emit Birth(newPlayerId, _name, _owner);

        playerIndexToPrice[newPlayerId] = _price;

        // This will assign ownership, and also emit the Transfer event as
        // per ERC721 draft
        _transfer(address(0), _owner, newPlayerId);
    }

    /// Check for token ownership
    function _owns(address claimant, uint256 _tokenId) private view returns (bool) {
        return claimant == playerIndexToOwner[_tokenId];
    }

    /// For paying out balance on contract
    function _payout(address _to) private {
        if (_to == address(0)) {
            address(uint160(ceoAddress)).transfer(address(this).balance);
        } else {
            address(uint160(_to)).transfer(address(this).balance);
        }
    }

    /// @dev Assigns ownership of a specific Player to an address.
    function _transfer(address _from, address _to, uint256 _tokenId) private {
        // Since the number of players is capped to 2^32 we can't overflow this
        ownershipTokenCount[_to]++;
        //transfer ownership
        playerIndexToOwner[_tokenId] = _to;

        // When creating new players _from is 0x0, but we can't account that address.
        if (_from != address(0)) {
            ownershipTokenCount[_from]--;
            // clear any previously approved ownership exchange
            delete playerIndexToApproved[_tokenId];
        }

        // Emit the transfer event.
        emit Transfer(_from, _to, _tokenId);
    }

}