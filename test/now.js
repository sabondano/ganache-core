const to = require('../lib/utils/to');
const Web3 = require('web3');
const assert = require('assert');
const Ganache = require("../index");
const path = require("path");
const compileAndDeploy = require ('./helpers/contracts').compileAndDeploy

const mnemonic = 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'

function setUp(options = {mnemonic}, contractName = 'Now') {
  let context = {
    options: options,
    provider: null,
    web3: null,
    accounts: [],
    contractArtifact: {},
    instance: null
  }

  before ('setup web3', async function() {
    context.provider = new Ganache.provider(context.options);
    //context.provider = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    context.options.blockTime = 2000;
    context.web3 = new Web3(context.provider);
  })

  before("compile source", async function() {
    this.timeout(10000)
    context.contractArtifact = await compileAndDeploy(path.join(__dirname, '.', `${contractName}.sol`), contractName, context.web3)
    context.instance = context.contractArtifact.instance
  })

  return context
}

describe(`'evm_increaseTime' vs 'now' timestamp without evm_mine`, function() {
  let context = setUp();
  let secondsToJump = 3600;

  it(`should NOT update latest block or 'now' after a timeout`, async function() {
    let nowTimestamp;

    const blockNumber1 = await context.web3.eth.getBlockNumber();

    nowTimestamp = await context.instance.methods.getCurrentTime().call();
    const timestamp1 = parseInt(nowTimestamp);

    await sleep(2000);
    
    const blockNumber2 = await context.web3.eth.getBlockNumber();

    nowTimestamp = await context.instance.methods.getCurrentTime().call();
    const timestamp2 = parseInt(nowTimestamp);

    assert.equal(timestamp1, timestamp2);
    assert.equal(blockNumber1,blockNumber2);
  });
  
  it.only(`should increase 'now' after executing 'evm_increaseTime'`, async function() {
    let timestamp;

    timestamp = await context.instance.methods.getCurrentTime().call();
    const timestamp1 = parseInt(timestamp);

    const blockNumber1 = await context.web3.eth.getBlockNumber();

    await send("evm_increaseTime", [secondsToJump], context.provider);

    timestamp = await context.instance.methods.getCurrentTime().call();
    const timestamp2 = parseInt(timestamp);

    const blockNumber2 = await context.web3.eth.getBlockNumber();

    assert.equal(timestamp1 + secondsToJump, timestamp2);
    assert.equal(blockNumber1,blockNumber2);
  });
  
  it(`should update 'now' with 'evm_increaseTime' followed by 'evm_mine'`, async function() {
    let nowTimestamp;
    const miningDelayInSeconds = 1;

    nowTimestamp = await context.instance.methods.getCurrentTime().call();
    const timestamp1 = parseInt(nowTimestamp);

    const blockNumber1 = await context.web3.eth.getBlockNumber();

    await send("evm_increaseTime", [secondsToJump], context.provider);
    await sleep(miningDelayInSeconds * 1000);
    await send("evm_mine", [], context.provider);

    const blockNumber2 = await context.web3.eth.getBlockNumber();

    const _timeString = await context.instance.methods.getCurrentTime().call();
    nowTimestamp = parseInt(_timeString);

    assert.equal(timestamp1 + secondsToJump + miningDelayInSeconds, nowTimestamp);
    assert.equal( (blockNumber1 + 1), blockNumber2);
  })
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function send(method, params, provider) {
  return new Promise(
    (resolve, reject) => {
      if (typeof params == "function") {
        callback = params;
        params = [];
      }

      provider.send({
        jsonrpc: "2.0",
        method: method,
        params: params || [],
        id: new Date().getTime()
      }, function(err, result) {
        if(err) return reject(err);
        resolve(result);
      });
    }
  );
};
