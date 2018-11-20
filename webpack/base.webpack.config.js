const { merge } = require("lodash");
const { resolve } = require("path");
const { IgnorePlugin } = require("webpack");

const outputDir = resolve(__dirname, "..", "build");

module.exports = (override) => {
  return merge(
    {},
    {
      output: {
        path: outputDir
      },
      devtool: "source-map",
      externals: [
        (context, request, callback) => {
          var modules = /^(eth-block-tracker|keccakjs|secp256k1)(\/.*)?$/;
          if (modules.test(request)) {
            return callback();
          }

          // we want to webpack all local files (files starting with a .)
          if (/^\./.test(request)) {
            return callback();
          }

          // we don't want to webpack any other modules
          return callback(null, "commonjs " + request);
        }
      ],
      resolve: {
        alias: {
          keccakjs: "keccakjs/browser.js",

          // eth-block-tracker is es6 but automatically builds an es5 version for us on install.
          "eth-block-tracker": "eth-block-tracker/dist/es5/index.js",

          // replace native `scrypt` module with pure js `js-scrypt`
          // "scrypt": "js-scrypt",

          // replace native `secp256k1` with pure js `elliptic.js`
          secp256k1: "secp256k1/elliptic.js"
        }
      },
      plugins: [
        // ignore these plugins completely
        new IgnorePlugin(/^(?:electron|ws)$/)
      ],
      mode: "production"
    },
    override
  );
};
