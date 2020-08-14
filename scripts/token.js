require("dotenv").config();
const { Harmony, Blockchain } = require("@harmony-js/core");
const { ChainID, ChainType, hexToNumber } = require("@harmony-js/utils");
// const { Messenger, WSProvider } = require("@harmony-js/network");
const { BN } = require('bn.js');
const hmy = new Harmony(
  process.env.LOCALNET,
  {
    chainType: ChainType.Harmony,
    chainId: ChainID.HmyTestnet,
  }
);
const contractAddr = process.env.TOKEN;
const contractJson = require("../build/contracts/BeastQuest.json");
let contract = hmy.contracts.createContract(contractJson.abi, contractAddr);
contract.wallet.addByPrivateKey(process.env.PRIVATE_KEY);
// const amount = '0x6D499EC6C63380000';
// const options1 = { gasPrice: '0x3B9ACA000' }; 
let options2 = { gasPrice: 1000000000, gasLimit: 6721900 };

(function() {
  const hmy_ws = new Harmony(process.env.LOCALNET_WS, {
    chainType: ChainType.Harmony,
    chainId: ChainID.HmyTestnet,
  });
  const contract = hmy_ws.contracts.createContract(
    contractJson.abi,
    contractAddr
  );

  contract.events
    .MinterAdded()
    .on("data", (event) => {
      console.log(event);
    })
    .on("error", console.error);
});

(async function () {
  // console.log(contract.methods);
  // let res = await contract.methods.isMinter(process.env.SALE).call(options2);

  let res = await contract.methods.addMinter(process.env.SALE).send(options2);
  // let res = await contract.methods.totalSupply().call(options2);
  console.log(res);
})();

// console.log(contract.methods);