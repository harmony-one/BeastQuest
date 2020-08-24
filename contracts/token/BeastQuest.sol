pragma solidity 0.6.8;

import "@animoca/ethereum-contracts-core_library/contracts/access/MinterRole.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BeastQuest is ERC721, Ownable, MinterRole {
    constructor(string memory name, string memory symbol, string memory url) 
    MinterRole() 
    ERC721(name, symbol) 
    public
    {
        _setBaseURI(url);
    }

    function mint(address to, uint256 tokenId) public onlyMinter {
        _safeMint(to, tokenId);
    }

    function updateBaseTokenURI(string memory tokenURI) public onlyMinter {
        _setBaseURI(tokenURI);
    }
}
