require("dotenv").config();
const { Harmony } = require("@harmony-js/core");
const { ChainID, ChainType, hexToNumber } = require("@harmony-js/utils");
const { BN } = require('bn.js');
const hmy = new Harmony(
    process.env.LOCALNET,
    {
        chainType: ChainType.Harmony,
        chainId: ChainID.HmyTestnet,
    }
);

const contractJson = require("../build/contracts/BeastQuest.json");
let contract = hmy.contracts.createContract(contractJson.abi);
contract.wallet.addByPrivateKey(process.env.PRIVATE_KEY);

let options2 = { gasPrice: 1000000000, gasLimit: 6721900 };

let options3 = { data: contractJson.bytecode };

contract.methods
    .contractConstructor(options3)
    .send(options2)
    .then((response) => {
        if (response.transaction.txStatus == "REJECTED") {
            console.log("Reject");
            process.exit(0);
        }
        console.log(
            "contract deployed at " +
            response.transaction.receipt.contractAddress
        );
        process.exit(0);
    });