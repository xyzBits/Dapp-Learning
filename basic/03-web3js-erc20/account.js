
const web3 = require('./we3_connect');

require('dotenv').config();
const privatekey = process.env.PRIVATE_KEY;
console.log('privatekey = ', privatekey);

const account = web3.eth.accounts.privateKeyToAccount(privatekey);
const account_from = {
    privateKey: account.privateKey,
    accountaddress: account.address,
};

module.exports = account_from;