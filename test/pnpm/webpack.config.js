const path = require("path");
var DuplicatePackageCheckerPlugin = require("../../src");

module.exports = function(entryFile) {
  return {
    entry: "./" + entryFile,
    mode: "development",
    context: __dirname,
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: entryFile + "-bundle.js"
    },
    plugins: [new DuplicatePackageCheckerPlugin({ pnpm: true })]
  };
};
