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

const contractJson = require("../build/contracts/BQSale.json");
let contract = hmy.contracts.createContract(contractJson.abi);
contract.wallet.addByPrivateKey(process.env.PRIVATE_KEY);

let options2 = { gasPrice: 1000000000, gasLimit: 6721900 };

const payoutWallet = "0xc162199cDaeAa5a82f00651dd4536F5d2d4277C5";
const fungibleTokenId = 1;
const inventoryContract = process.env.TOKEN;

let options3 = { data: contractJson.bytecode, arguments: [payoutWallet, fungibleTokenId, inventoryContract] };

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