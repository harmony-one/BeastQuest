require("dotenv").config();
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
let options2 = { gasPrice: 1000000000, gasLimit: 6721900, value: "0x1B1AE4D6E2EF500000" }; // 500 ONEs

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
    .Purchased()
    .on("data", (event) => {
      console.log(event);
    })
    .on("error", console.error);
});

(async function() {
  const recipient = "0x0B585F8DaEfBC68a311FbD4cB20d9174aD174016";
  const lotId = 0;
  const quantity = 5;
  const tokenAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
  const maxTokenAmount = 500;
  const minConversionRate = "0xDE0B6B3A7640000"; // equivalent to 1e+18
  const extData = "0x736f6d65";

  let res = await contract.methods
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
  console.log(res);
  process.exit(0);
})();
// console.log(contract.methods);
