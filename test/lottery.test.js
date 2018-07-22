const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const {interface, bytecode} = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
	accounts = await web3.eth.getAccounts();

	lottery = await new web3.eth.Contract(JSON.parse(interface))
		.deploy({ data: bytecode})
		.send({ from: accounts[0], gas: '1000000'});
});

describe('Lottery Contract', () => {
	it('deploys a contract', () => {
		assert.ok(lottery.options.address);
	});
	it('allows one account to enter', async() => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('0.02', 'ether')
		});
		const players = await lottery.methods.getPlayers().call({
			from: accounts[0]
		});
		assert.equal(1, players.length);
	});

	it('allows multiple accounts to enter', async() => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('0.02', 'ether')
		});
		
		await lottery.methods.enter().send({
			from: accounts[1],
			value: web3.utils.toWei('0.02', 'ether')
		});
		
		await lottery.methods.enter().send({
			from: accounts[2],
			value: web3.utils.toWei('0.02', 'ether')
		});
		
		await lottery.methods.enter().send({
			from: accounts[3],
			value: web3.utils.toWei('0.02', 'ether')
		});
	
		const players = await lottery.methods.getPlayers().call({
			from: accounts[0]
		});
		assert.equal(accounts[0], players[0]);
		assert.equal(accounts[1], players[1]);
		assert.equal(accounts[2], players[2]);
		assert.equal(accounts[3], players[3]);
		assert.equal(4, players.length);
	});
	
	it('requires minimum amount of ether', async() => {
		try {
			await lottery.methods.enter().send({
				from: accounts[4],
				value: web3.utils.toWei('0.002', 'ether')
			});
			assert(false);
		} catch (err) {
			assert(err);
		}
	});	

	it('requires manager to pick winner', async() => {
		try {
			await lottery.methods.pickWinner().send({
				from: accounts[4]
			});
			assert(false);
		} catch (err) {
			assert(err);
		}
	});	

	it('ensures money sent to winner', async() => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('2', 'ether')
		});
		const initBal = await web3.eth.getBalance(accounts[0]);
		await lottery.methods.pickWinner().send({
				from: accounts[0]
			});
		const finalBal = await web3.eth.getBalance(accounts[0]);
		console.log((initBal + web3.utils.toWei('2', 'ether')) - finalBal );
		const diff = finalBal - initBal;
		assert(diff > web3.utils.toWei('1.8', 'ether'));
	});
});