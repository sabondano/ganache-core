const assert = require("assert");
const pify = require("pify");

const Ganache = require(process.env.TEST_BUILD
  ? "../build/ganache.core." + process.env.TEST_BUILD + ".js"
  : "../index.js");
const StateManager = require("../lib/statemanager.js");

describe("server", () => {
  it.only("should return instance of StateManager on start", async() => {
    const server = Ganache.server();
    try {
      const stateManager = await pify(server.listen)(8945);
      const sm = JSON.stringify(Object.keys(stateManager.constructor.prototype));
      assert.deepStrictEqual(
        sm,
        JSON.stringify(Object.keys(StateManager.prototype)),
        "server.listen must return instance of StateManager"
      );
    } finally {
      await pify(server.close)();
    }
  });
});
