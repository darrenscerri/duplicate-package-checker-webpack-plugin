var webpack = require("webpack");
var assert = require("assert");
var stripAnsi = require("strip-ansi");
var config = require("./webpack.config");

describe("npm v2 packages", function() {
  it("should not output warnings", function(done) {
    webpack(config, function(err, stats) {
      assert(stats.compilation.warnings.length === 0);
      done();
    });
  });
});
