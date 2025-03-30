let { Web3 } = require('web3');
let solc = require('solc');
let fs = require('fs');

// Get privatekey from environment
require('dotenv').config();

// 通过环境读取私钥
let privatekey = process.env.PRIVATE_KEY;
if (privatekey.slice(0, 2) !== '0x') privatekey = '0x' + privatekey;

// 无法直接使用 sol 文件，要将它编译为bin文件
// 先读取文件
const source = fs.readFileSync('Incrementer.sol', 'utf8');

// compile solidity
const input = {
  language: 'Solidity',
  sources: {
    'Incrementer.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
};

// 合约编译，将 solidity 源码编译为 solidity对象
const compiledCode = JSON.parse(solc.compile(JSON.stringify(input)));
const contractFile = compiledCode.contracts['Incrementer.sol']['Incrementer'];

// 获取二进制对象和 abi
const bytecode = contractFile.evm.bytecode.bytecode;
const abi = contractFile.abi;
console.log('abi = ', abi);

// 创建与 sepolia provider 的连接
// 构造 web3 对象，可以很方便的发送相应的交易到区块链网络，同时获取区块链的处理结果
// 构造时，需要传入网络的 key
const web3 = new Web3('https://eth-sepolia.g.alchemy.com/v2/' + process.env.INFURA_ID);

// 可以通过私钥获取账户
const accounts = web3.eth.accounts.wallet.add(privatekey);
console.log('accounts = ', accounts);

web3.eth.getBalance(accounts[0].address).then(balance => {
    console.log('balance = ', web3.utils.fromWei(balance, 'ether'), 'ETH');
});

// 箭头函数 () => {} 等价于 function Deploy() {}
// async 表示函数内部包含异步操作，使用 await 等待 promise 解析 
// 和 区块链网络的交互，都是异步
const Deploy = async () => {
    // 构造合约实例
    const deployContract = new web3.eth.Contract(abi);

    // 准备部署的合约交易对象
    const deployTx = deployContract.deploy({
        data: '0x' + bytecode,// 交易必须以 0x 开头
        arguments: [0],// 传递给合约构造函数的参数，
    });

    // 估算部署合约所需要的 gas
    const gas = await deployTx.estimateGas({
        from: accounts,
    });
    console.log('estimated gas: ', gas);

    try {

        // 部署合约，这里发送签名后的交易到区块链网络，同时还会返回交易回执，从交易回执里可以得到此次部署合约的地址
        // 发送部署交易到区块链网络
        const tx = await deployTx.send({
            from: accounts[0].address, 
            gas,
        });

        console.log('Contract deployed at address: ' + tx.options.address);
    } catch (error) {
        console.error(error);
    }
};


// 调用 deploy 函数，并在完成后退出 node进程
// then 处理成功
// catch 处理失败
Deploy()
.then(() => process.exit(0))
.catch((error) => {
    console.log(error);
    process.exit(1);
});