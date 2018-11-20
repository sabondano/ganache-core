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
          if (
            /^(web3-provider-engine|eth-block-tracker|ethereumjs-wallet|web3|web3-eth|web3-eth-accounts|scrypt.js|scrypt)(\/.*)?$/.test(
              request
            )
          ) {
            console.log(request);
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
          // eth-block-tracker is es6 but automatically builds an es5 version for us on install.
          "eth-block-tracker": "eth-block-tracker/dist/es5/index.js",

          // replace native `scrypt` module with pure js `js-scrypt`
          scrypt: "js-scrypt"
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
