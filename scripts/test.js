require("dotenv").config();
const { Harmony, Blockchain } = require("@harmony-js/core");
const { ChainID, ChainType, hexToNumber } = require("@harmony-js/utils");
const { Messenger, WSProvider } = require("@harmony-js/network");
const { BN } = require('bn.js');
const hmy = new Harmony(
  // "https://api.s0.b.hmny.io",
  "http://localhost:9500",
  {
    chainType: ChainType.Harmony,
    chainId: ChainID.HmyTestnet,
  }
);
const contractJson = require("../build/contracts/NFT.json");
let contract = hmy.contracts.createContract(contractJson.abi, '0x2163f4842c6e39edc33dd1d297d7e97349978c73');
contract.wallet.addByPrivateKey(process.env.PRIVATE_KEY_USER);
// const amount = '0x6D499EC6C63380000';
// const options1 = { gasPrice: '0x3B9ACA000' }; 
let options2 = { gasPrice: 1000000000, gasLimit: 6721900 };

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async function () {
  // let res = await contract.methods.getSeed().call(options2);
  // console.log(res.toString());
  while (true) {
    let res = await contract.methods.randomSelection(2).send(options2);
    if (res.transaction.txStatus == "REJECTED") {
      console.log("Reject");
      process.exit(0);
    }
    res = await contract.methods.getSelected().call(options2);
    console.log(res.toString());
    await sleep(10000);
  }
})();