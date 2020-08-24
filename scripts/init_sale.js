require("dotenv").config();
const fs = require("fs");
const { Harmony } = require("@harmony-js/core");
const { ChainID, ChainType } = require("@harmony-js/utils");
const { BN } = require("bn.js");
const hmy = new Harmony(process.env.TESTNET, {
  chainType: ChainType.Harmony,
  chainId: ChainID.HmyTestnet,
});
const contractAddr = process.env.SALE;
const contractJson = require("../build/contracts/BQSale.json");
let contract = hmy.contracts.createContract(contractJson.abi, contractAddr);
contract.wallet.addByPrivateKey(process.env.PRIVATE_KEY);
let options1 = { gasPrice: 1000000000, gasLimit: 11000000 };
let options2 = { gasPrice: 1000000000, gasLimit: 6721900 };

(function() {
  const hmy_ws = new Harmony(process.env.TESTNET_WS, {
    chainType: ChainType.Harmony,
    chainId: ChainID.HmyTestnet,
  });
  const contract = hmy_ws.contracts.createContract(
    contractJson.abi,
    contractAddr
  );

  contract.events
    .LotCreated()
    .on("data", (event) => {
      console.log(event);
    })
    .on("error", console.error);
})();

(async function() {
  // add sale contract minter role to nft contract
  const tokenJson = require("../build/contracts/BeastQuest.json");
  let tokenContract = hmy.contracts.createContract(
    tokenJson.abi,
    process.env.TOKEN
  );
  let res = await tokenContract.methods
    .addMinter(process.env.SALE)
    .send(options2);
  console.log(res);

  // add tokenIds to sale contract
  var tokens = fs
    .readFileSync("./tokenIds.txt")
    .toString()
    .split("\n")
    .map((x) => new BN(x));
  var tokenIds = tokens.slice(0, 500);
  res = await contract.methods
    .updateNonFungibleSupply(tokenIds, 500)
    .send(options1);
  console.log(res);

  // create lot 0
  const lotId = 0;
  const nonFungibleSupply = tokenIds;
  const fungibleAmount = 1;
  const price = 100;

  res = await contract.methods
    .createLot(lotId, nonFungibleSupply, fungibleAmount, price)
    .send(options1);
  console.log(res);

  // start sale
  res = await contract.methods.start().send(options2);
  console.log(res);

  process.exit(0);
})();

(async function() {
  // let res = await contract.methods._nonFungibleSupply(4).call(options2);
  let res = await contract.methods.lastDiscount().call(options2);
  console.log(res.toString());
  // console.log(res);
});
