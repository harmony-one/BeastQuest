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

* Deploy BeastQuest smart contract. You will need a testnet funded account. Fund your harmony one address [here](https://harmony-faucet.ibriz.ai)

```
truffle migrate --reset --network testnet
```
or 
```
node examples/deploy.js
```

* Create soccer players

```
node examples/create.js
```

* Purchase soccer players
```
node examples/purchase.js
```