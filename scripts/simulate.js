require("dotenv").config();
const fs = require("fs");
const { Harmony, Blockchain } = require("@harmony-js/core");
const { ChainID, ChainType, hexToNumber } = require("@harmony-js/utils");
const { Messenger, WSProvider } = require("@harmony-js/network");
const { BN } = require("bn.js");
const hmy = new Harmony(process.env.TESTNET, {
  chainType: ChainType.Harmony,
  chainId: ChainID.HmyTestnet,
});
const contractAddr = process.env.SALE;
const contractJson = require("../build/contracts/BQSale.json");
let contract = hmy.contracts.createContract(contractJson.abi, contractAddr);
contract.wallet.addByPrivateKey(process.env.PRIVATE_KEY_USER);
// const amount = '0x6D499EC6C63380000';
// const options1 = { gasPrice: '0x3B9ACA000' };
let options2 = {
  gasPrice: 1000000000,
  gasLimit: 67219000,
  value: "0x21E19E0C9BAB2400000" //"0x1B1AE4D6E2EF500000",
}; // 500 ONEs

let toPurchase = new Map();
let counter = 0;
var tokens = fs
  .readFileSync("./tokenIds.txt")
  .toString()
  .split("\n");
tokens.forEach((element) => {
  toPurchase.set(element, counter++);
});
let purchased = new Map();
// console.log(toPurchase);
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
    .Purchased()
    .on("data", (event) => {
      // console.log(event);
      event.returnValues.nonFungibleTokens.forEach((element) => {
        let item = element.toString();
        let index = toPurchase.get(item);
        if (purchased.has(item)) {
          console.log("Bug, repurchased an already purchased tokenId: "+ item);
          process.exit(1);
        } else {
          console.log("Purchased " + item + ", at index: " + index);
          purchased.set(item, true);
        }
      });
    })
    .on("error", console.error);
})();

function keepPurchasing() {
  const recipient = "0x0B585F8DaEfBC68a311FbD4cB20d9174aD174016";
  const lotId = 0;
  const quantity = 50;
  const tokenAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
  const maxTokenAmount = 500;
  const minConversionRate = "0xDE0B6B3A7640000"; // equivalent to 1e+18
  const extData = "0x736f6d65";
  console.log('Purchase called...');
  contract.methods
    .purchaseFor(
      recipient,
      lotId,
      quantity,
      tokenAddress,
      maxTokenAmount,
      hexToNumber(minConversionRate),
      extData
    )
    .send(options2);
}

function delay(i) {
  setTimeout(() => {
    keepPurchasing();
  }, 10000*i);
}
for (var i = 0; i < 500; i++) {
  delay(i);
}
