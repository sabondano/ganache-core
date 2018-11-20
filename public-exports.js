// make sourcemaps work!
require("source-map-support/register");

// make webpack grab some things without having to traverse things needlessly:
require("eth-block-tracker");
require("keccakjs");
require("secp256k1");

const Provider = require("./lib/provider");
const Server = require("./lib/server");

// This interface exists so as not to cause breaking changes.
module.exports = {
  server: function(options) {
    return Server.create(options);
  },
  provider: function(options) {
    return new Provider(options);
  },
  _webpacked: true
};
