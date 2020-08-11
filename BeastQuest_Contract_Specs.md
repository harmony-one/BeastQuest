# BeastQuest Contract Specs



### NFT Sales Contract

- A limited time sales with different price for different SKUs.
- All sales will be made using Harmony One Token.
- TokenId will be generate before the sales.
- An list of tokenId will be created as tokenSupply for a SKU and will be maintain by the contract
- Token will be minted in the order of the list
- An index will be maintain what should be the next token for the next sale

All the previous items is already supported by FixSupplyLotSales, the items below are what need to be changed:

### NFT Sales Contract

### 

**Removing KyberNetworkSupport**

- KyberAdapter(kyberProxy) and kyberProxy in constrcutor needs to be remove
- update getPrice function to return price in "ONE".
- update _purchaseForPayment function removing all token swap with kyber network

**Hacking up hardcoded fungible support**

- update _purchaseForDelivery ignore DeliverPurchaseVars.values[index] support.
- add ERC721 mint call in _purchaseForDelivery that it delivers the token to user with the ERC-721 contract on purchase.
- During migration the fungibleTokenId need to have an value, suggest to have anything more than zero.
- 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee will be used for the tokenAddress in purchaseFor to represent user using "One" for the medium of purchase, which is equivalent of ETH on ethereum.

### ERC-721 Token Contract

- contract will have to implement MinterRole.

- Sale contract will be added as a minter during migration.

- A mint function for token minting.

- tokenUrl during minting will be inferred from a combination of baseURL and tokenId (in base10) eg. https://quidd-nft-rinkeby.animocabrands.com/json/57896044672577994259987572102401290735144483321370868584568129820623313568512

- a updateBaseTokenURI function that updates the base part of the tokenURI.
  eg. https://quidd-nft-rinkeby.animocabrands.com/json/

- only owner or a address with minter role can call the mint function for token minting.

  