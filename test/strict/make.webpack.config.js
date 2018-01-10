const path = require("path");
var DuplicatePackageCheckerPlugin = require("../../src");

module.exports = function(options) {
  return {
    entry: "./entry.js",
    context: __dirname,
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bundle.js"
    },
    plugins: [new DuplicatePackageCheckerPlugin(options)]
  };
};
