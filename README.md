# BeastQuest
BeastQuest game ported to [Harmony](http://harmony.one) blockchain

## Install instructions

### Requirements 

* nodejs 
* truffle
* solidity (solc)

### Commands

* Fetch repo 

```
git clone https://github.com/harmony-one/BeastQuest.git
```

* Install dependencies

```
npm install
```

* Compile BeastQuest smart contract

```
truffle compile
```

* Deploy BeastQuest smart contracts. You will need a testnet funded account. Fund your harmony one address [here](https://harmony-faucet.ibriz.ai)

1. Deploy Token contract. Make sure to export `PRIVATE_KEY`.
```
node scripts/deploy_token.js
```

Export token contract address. This is needed before deploying Sale contract. Testnet token contract is deployed at `0x060adc610f4ba21fc81457b7be36d202524bcf37`
```
export TOKEN=0x060adc610f4ba21fc81457b7be36d202524bcf37
```

2. Deploy Sale contract
```
node scripts/deploy_sale.js
```
Export sale contract address. This is needed before initializing Sale contract and starting purchase. Testnet sale contract is deployed at `0x456975edb9b973bf5731232ac88f2b92b7b72236`
```
export SALE=0x456975edb9b973bf5731232ac88f2b92b7b72236
```

3. Initialize sale contracts. This should create a lot with base price of 100, initialize tokenIds for the sale (tokenIds can be updated later as well), and start the sale.
```
node scripts/init_sale.js
```

4. Run seeder for sending blockHash. This will be run as service by Harmony during the NFT sale. The blockHash will be used to randomize the assignment of tokens to purchases.
```
node scripts/seeder.js
```

5. Create another user account and fund the account, to be used as purchaser. Export `PRIVATE_KEY_USER`.
```
node scripts/purchase.js
```

If you simply doing the purchase, skips steps 1-4 and directly do step 5. 

6. Check your tokens after purchase using:
```
node scripts/token.js
```

which displays tokens owned by user and tokenURL
```
User 0x0B585F8DaEfBC68a311FbD4cB20d9174aD174016 has 5 tokens
token at index 0: 57896044672578003901615837656455696622713895309247884933833559270639261451008
URL of token: 57896044672578003901615837656455696622713895309247884933833559270639261451008 is https://quidd-nft-rinkeby.animocabrands.com/json/57896044672578003901615837656455696622713895309247884933833559270639261451008
```