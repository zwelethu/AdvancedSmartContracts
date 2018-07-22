const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode} = require('./compile');

const provider = new HDWalletProvider('slight citizen mouse jar horse brass oil tone bike nature axis couch', 'https://rinkeby.infura.io/v3/589c5bd9d2d54c62af1c3d436c2bd6f6');
const web3 = new Web3(provider);

const deploy = async ()=> {
	const accounts = await web3.eth.getAccounts();
	console.log('attempting to deploy: ', accounts[0]);
	const res = await new web3.eth.Contract(JSON.parse(interface))
		.deploy({ data: bytecode})
		.send({ gas: '1000000', from: accounts[0] });
	console.log('Contract deployed to: ', res.options.address);	
};
deploy();