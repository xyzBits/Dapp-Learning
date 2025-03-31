const Web3 = require('web3');

require('dotenv').config();


const web3 = new Web3(
    'https://eth-sepolia.g.alchemy.com/v2/' + process.env.INFURA_ID
);

module.exports = web3;