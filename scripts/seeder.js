require("dotenv").config();
const fs = require("fs");
const aws = require("aws-sdk");
const prompt = require("prompt-sync")();

const { Harmony, Blockchain } = require("@harmony-js/core");
const { ChainID, ChainType, hexToNumber } = require("@harmony-js/utils");
const { Messenger, WSProvider } = require("@harmony-js/network");
const { BN } = require("bn.js");
const hmy = new Harmony(process.env.TESTNET, {
  chainType: ChainType.Harmony,
  chainId: ChainID.HmyTestnet,
});

const contractJson = require("../build/contracts/BQSale.json");
let contract = hmy.contracts.createContract(contractJson.abi, process.env.SALE);

new aws.KMS({
  accessKeyId: prompt("enter your aws accessKeyId: "),
  secretAccessKey: prompt("enter your aws secretAccessKey: "),
  region: prompt("enter your aws region: "),
}).decrypt(
  {
    CiphertextBlob: fs.readFileSync("./encrypted-secret"),
  },
  function(err, data) {
    if (!err) {
      const decryptedScret = data["Plaintext"].toString();
      contract.wallet.addByPrivateKey(decryptedScret);
      startSeeder();
    }
  }
);

let options1 = { gasPrice: 1000000000, gasLimit: 15000000 };
let options2 = { gasPrice: 1000000000, gasLimit: 6721900 };

function updateSeed(blockHash) {
  contract.methods
    .setRandomnessSeed(new BN(blockHash))
    .send(options2)
    .then((res) => {
      console.log("set seed: " + blockHash);
    });
}

const messenger = new Messenger(
  new WSProvider(process.env.TESTNET_WS),
  ChainType.Harmony,
  ChainID.HmyTestnet
);

const blockchain = new Blockchain(messenger);
let headerEvent;

async function startSeeder() {
  headerEvent = blockchain.newBlockHeaders();
  headerEvent
    .on("data", (event) => {
      // console.log(event);
      let blockHash = event.params.result["block-header-hash"];
      updateSeed(blockHash);
    })
    .on("error", console.error);
}

var tokenIds = fs
  .readFileSync("./tokenIds.txt")
  .toString()
  .split("\n")
  .map((x) => new BN(x));

const IncreaseBy = 500;

async function increaseSupply(start) {
  try {
    let res = await contract.methods.pause().send(options2);
    console.log(res);
    let end = start + IncreaseBy;
    console.log(start);
    console.log(end);
    res = await contract.methods
      .updateNonFungibleSupply(tokenIds.slice(start, end), end)
      .send(options1);
    console.log(res);
    res = await contract.methods.unpause().send(options2);
    console.log(res);
  } catch (e) {
    console.error(e.message);
  }
}

(function() {
  const hmy_ws = new Harmony(process.env.TESTNET_WS, {
    chainType: ChainType.Harmony,
    chainId: ChainID.HmyTestnet,
  });
  const sale = hmy_ws.contracts.createContract(
    contractJson.abi,
    process.env.SALE
  );
  sale.events
    .RunningOutOfSupply()
    .on("data", (event) => {
      console.log(event);
      headerEvent.unsubscribe();
      setTimeout(() => {
        increaseSupply(parseInt(event.returnValues.supplyOffset, 10)).then(
          () => {
            startSeeder();
          }
        );
      }, 10000);
    })
    .on("error", console.error);
})();
