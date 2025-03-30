const Web3 = require('web3');
const fs = require('fs');

// 编译好的合约导入
// 导入 compile 文件中的 incrementer 合约对象
const contractOfIncrementer = require('./compile');
const { env } = require('process');

require('dotenv').config();
const privatekey = process.env.PRIVATE_KEY;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// 构造 web3 对象
const providerRPC = {
    development: 'https://eth-sepolia.g.alchemy.com/v2/' + process.env.INFURA_ID,
};

const web3 = new Web3(providerRPC.development);

const account = web3.eth.accounts.privateKeyToAccount(privatekey);
console.log('account = ', account);
const account_from = {
    privateKey: privatekey, 
    accountAddress: account.address,
};

const bytecode = contractOfIncrementer.evm.bytecode.object;
const abi = contractOfIncrementer.abi;

const Trans = async () => {
    console.log('========================== 1. Deploy contract');
    console.log(`Attempting to deploy from account ${account.address}`);

    // 创建合约
    const deployContract = new web3.eth.Contract(abi);


    // 创建合约交易，部署合约的二进制交易，还没有发送区块链网络，因此合约还没创建
    const deployTx = deployContract.deploy({
        data: bytecode, 
        arguments: [5],
    });

    // 交易签名，使用私鉏对交易进行签名
    const createTransaction = await web3.eth.accounts.signTransaction(
        {
            data: deployTx.encodeABI(), 
            gas: 8_000_000, 
        }, 
        account_from.privateKey,
    );

    // 部署合约
    // 发送签名后的交易到区块链网络，同时回去返回的交易回执，从交易回执中得到此次部署的合约地址
    // const createReceipt = await web3.eth.sendSignedTransaction(
    //     createTransaction.rawTransaction
    // );
    // console.log(`Contract deployed at address: ${createReceipt.contractAddress}`);

    // const deployedBlockNumber = createReceipt.blockNumber;


    console.log();
    console.log('=========================2. Call Contract Interface getNumber');
    const contractAddress = '0xA6672465FEe2180382A75fd2BB9f17CAe16D208e';
    console.log(`Deployed contract address = ${contractAddress}`);

    let incrementer = new web3.eth.Contract(abi, contractAddress);

    console.log(
        `Making a call to contract at address: ${contractAddress} `
    );

    let number = await incrementer.methods.getNumber().call();
    console.log(`The current number stored is :${number}  `);


    console.log();
    console.log(
        `===========================3. Call Contract Interface increment`
    );

    const _value = 3;
    let incrementTx = incrementer.methods.increment(_value);

    let incrementTransaction = await web3.eth.accounts.signTransaction(
        {
            to: contractAddress, 
            data: incrementTx.encodeABI(), 
            gas: 8_000_000,
        },
        account_from.privateKey,
    );

    const incrementReceipt = await web3.eth.sendSignedTransaction(
        incrementTransaction.rawTransaction
    );

    console.log(`Tx successful with hash: ${incrementReceipt.transactionHash}`);

    number = await incrementer.methods.getNumber().call();
    console.log(`After increment, the current number stored is: ${number}`);


    console.log();
    console.log('=============================4. Call Contract Interface reset');
    const resetTx = incrementer.methods.reset();

    const resetTransaction = await web3.eth.accounts.signTransaction(
        {
            to: contractAddress, 
            data: resetTx.encodeABI(),
            gas: 8_000_000,
        }, 
        account_from.privateKey,
    );

    const resetReceipt = await web3.eth.sendSignedTransaction(
        resetTransaction.rawTransaction
    );

    console.log(`Tx successful with hash: ${resetReceipt.transactionHash}`);
    number = await incrementer.methods.getNumber().call();
    console.log(`After reset, the current number stored is: ${number}`);



    console.log();
    console.log('=======================5. Listen to Events');
    console.log('Listen to Increment Event only once && continuously');

    const web3Socket = new Web3(
        'wss://eth-mainnet.g.alchemy.com/v2/' + process.env.INFURA_ID
    );

    incrementer.once('Increment', (error, event) => {
        console.log('I am a onetime event listener, I am going to die now');
    });

    web3Socket.eth.subscribe('logs', {
        address: contractAddress, 
        topics: []
    }, (error, result) => {
        if (error) {
            console.log(error);
        }
    })
    .on('data', (event) => {
        console.log('New Event: ', event);
    })
    .on('error', (error) => {
        console.error('Error: ', error);
    });

};

Trans()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});