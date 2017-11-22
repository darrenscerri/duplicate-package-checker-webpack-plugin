var webpack = require("webpack");
var assert = require("assert");
var config = require("./webpack.config");

describe("Dependency tree with non-root package.json", function() {
  it("should output warnings", function(done) {
    webpack(config, function(err, stats) {
      expect(stats.compilation.warnings[0].message).toMatchSnapshot();
      done();
    });
  });
});
