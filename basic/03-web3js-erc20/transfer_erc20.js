// const web3 = require('./we3_connect');
// const contractFile = require('./compile');
// const account_from = require('./account');

import web3 from './we3_connect.js';
import contractFile  from './compile.js';
import account_from from './account.js';

const erc20ContractAddress = '0x350197202D8654B3403699aD3aF9B9ca7d08D323';

console.log('erc20ContractAddress = ', erc20ContractAddress);

const receiver = '0x4C36FE09d2E26B9f44BA067089E14f3b2A89FA57';
const abi = contractFile.abi;


const Trans = async() => {

    const erc20Contract = new web3.eth.Contract(
        abi, 
        erc20ContractAddress
    );
    
    
    const transferTx = erc20Contract.methods.transfer(receiver, 100000).encodeABI();
    
    const transferTransaction = await web3.eth.accounts.signTransaction(
        {
            to: erc20ContractAddress, 
            data: transferTx, 
            gas: 8_000_000,
        }, 
        account_from.privateKey
    );
    
    await web3.eth.sendSignedTransaction(transferTransaction.rawTransaction);
    
    await erc20Contract.methods.balanceOf(receiver)
    .call()
    .then((result) => {
        console.log(`The balance of receiver is ${result}`);
    })    
};

Trans()
.then(() => process.exit(0))
.catch((error) => {
    console.log(error);
    process.exit(1);
});