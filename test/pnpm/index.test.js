var webpack = require("webpack");
var assert = require("assert");
var MakeConfig = require("./webpack.config");

describe("Pnpm dependency tree", function() {
  it("should not output warnings when no duplicates exist", function(done) {
    webpack(MakeConfig("entry.js"), function(err, stats) {
      assert(stats.compilation.warnings.length === 0);
      done();
    });
  });

  it("should output a warning when package 'a' is duplicated with the same version", function(done) {
    webpack(MakeConfig("entry.dupe.same-version.js"), function(err, stats) {
      assert(stats.compilation.warnings.length === 1);
      expect(stats.compilation.warnings[0].message).toMatchSnapshot();
      done();
    });
  });

  it("should output a warning when package 'a' is duplicated with a different version", function(done) {
    webpack(MakeConfig("entry.dupe.different-version.js"), function(
      err,
      stats
    ) {
      assert(stats.compilation.warnings.length === 1);
      expect(stats.compilation.warnings[0].message).toMatchSnapshot();
      done();
    });
  });
});
