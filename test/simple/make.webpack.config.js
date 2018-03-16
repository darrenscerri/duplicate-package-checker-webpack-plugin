const path = require("path");
var DuplicatePackageCheckerPlugin = require("../../src");

module.exports = function(options, mode = "development") {
  return {
    entry: "./entry.js",
    mode,
    context: __dirname,
    optimization: { minimize: false }, // Disable Uglify since it fails to run in the CI environment
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bundle.js"
    },
    plugins: [new DuplicatePackageCheckerPlugin(options)]
  };
};
