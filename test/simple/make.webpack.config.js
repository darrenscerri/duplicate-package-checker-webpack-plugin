const path = require("path");
var DuplicatePackageCheckerPlugin = require("../../src");

module.exports = function(options, mode = "development") {
  return {
    entry: "./entry.js",
    mode,
    context: __dirname,
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bundle.js"
    },
    plugins: [new DuplicatePackageCheckerPlugin(options)]
  };
};
