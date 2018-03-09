const path = require("path");
var DuplicatePackageCheckerPlugin = require("../../src");

module.exports = {
  entry: "./entry.js",
  mode: "development",
  context: __dirname,
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  },
  plugins: [new DuplicatePackageCheckerPlugin()]
};
