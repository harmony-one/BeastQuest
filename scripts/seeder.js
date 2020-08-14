require("dotenv").config();
const { Harmony, Blockchain } = require("@harmony-js/core");
const { ChainID, ChainType, hexToNumber } = require("@harmony-js/utils");
const { Messenger, WSProvider } = require("@harmony-js/network");
const { BN } = require('bn.js');
const hmy = new Harmony(
  process.env.LOCALNET,
  {
    chainType: ChainType.Harmony,
    chainId: ChainID.HmyTestnet,
  }
);
const contractJson = require("../build/contracts/BQSale.json");
let contract = hmy.contracts.createContract(contractJson.abi, process.env.SALE);
contract.wallet.addByPrivateKey(process.env.PRIVATE_KEY);
// const amount = '0x6D499EC6C63380000';
// const options1 = { gasPrice: '0x3B9ACA000' }; 
let options2 = { gasPrice: 1000000000, gasLimit: 6721900 };

(function () {
  const messenger = new Messenger(
    new WSProvider(process.env.LOCALNET_WS),
    ChainType.Harmony,
    ChainID.HmyTestnet,
  );

  const blockchain = new Blockchain(messenger);
  blockchain.newBlockHeaders()
    .on("data", (event) => {
      // console.log(event);
      let blockHash = event.params.result['block-header-hash'];
      // console.log(blockHash);
      contract.methods.setRandomnessSeed(new BN(blockHash)).send(options2).then(res => {
        console.log('set seed: ' + blockHash);
      });
    })
    .on("error", console.error);
})();