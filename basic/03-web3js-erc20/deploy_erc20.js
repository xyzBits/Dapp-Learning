const fs = require('fs');

const contractFile = require('./compile');
const web3 = require('./we3_connect');



require('dotenv').config();
const privatekey = process.env.PRIVATE_KEY;
console.log('privatekey = ', privatekey);

const account = web3.eth.accounts.privateKeyToAccount(privatekey);
const account_fom = {
    privateKey: account.privateKey,
    accountaddress: account.address,
}

console.log('account = ', account);

const bytecode = contractFile.evm.bytecode.object;
const abi = contractFile.abi;

const Deploy = async () => {
    console.log(`Attempting to deploy from account ${account_fom.accountaddress}`);

    web3.eth.getBlockNumber(function (error, result) {
        console.log(result);
    });

    const deployContract = new web3.eth.Contract(abi);

    const deployTx = deployContract.deploy({
        data: bytecode, 
        arguments: ['DAPPLEARNING', 'DAPP', 0, 10000000],// 包含代币最小单位
    });

    const deployTransaction = await web3.eth.accounts.signTransaction(
        {
            data: deployTx.encodeABI(), 
            gas: 8_000_000,
        }, 
        account_fom.privateKey,
    );
    
    const deployReceipt = await web3.eth.sendSignedTransaction(deployTransaction.rawTransaction);
    console.log(`Contract deploy at address: ${deployReceipt.contractAddress}`);
};

// Deploy()
// .then(() => process.exit())
// .catch((error) => {
//     console.error(error);
//     process.exit(1);
// });

const erc20ContractAddress = '0x350197202D8654B3403699aD3aF9B9ca7d08D323';

module.exports = erc20ContractAddress;