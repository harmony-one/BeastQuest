require("dotenv").config();
const { Harmony } = require("@harmony-js/core");
const { ChainID, ChainType } = require("@harmony-js/utils");
const hmy = new Harmony(
  process.env.TESTNET,
  {
    chainType: ChainType.Harmony,
    chainId: ChainID.HmyTestnet,
  }
);
const contractAddr = process.env.TOKEN;
const contractJson = require("../build/contracts/BeastQuest.json");
let contract = hmy.contracts.createContract(contractJson.abi, contractAddr);
contract.wallet.addByPrivateKey(process.env.PRIVATE_KEY_USER);

let options2 = { gasPrice: 1000000000, gasLimit: 6721900 };

(async function () {
  const addr = '0x0B585F8DaEfBC68a311FbD4cB20d9174aD174016'; // account of PRIVATE_KEY_USER
  let res = await contract.methods.balanceOf(addr).call(options2);
  console.log('User ' + addr + ' has ' + res.toString() + ' tokens');
  token = await contract.methods.tokenOfOwnerByIndex(addr, 0).call(options2);
  console.log('token at index 0: ' + token);  
  res = await contract.methods.tokenURI(token).call(options2);
  console.log('URL of token: ' + token + ' is ' + res);
  process.exit(0);
  // there are also other functions if you need, just check
  // console.log(contract.methods);
})();

