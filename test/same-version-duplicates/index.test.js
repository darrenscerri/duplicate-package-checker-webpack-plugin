var webpack = require("webpack");
var assert = require("assert");
var MakeConfig = require("./make.webpack.config");

describe("Duplicate submodule dependency tree", function() {
  it("should output warnings if ignoreSameVersionDuplicates == false", function(done) {
    webpack(
      MakeConfig({
        ignoreSameVersionDuplicates: false
      }),
      function(err, stats) {
        assert(stats.compilation.warnings.length === 1);
        expect(stats.compilation.warnings[0].message).toMatchSnapshot();
        done();
      }
    );
  });

  it("should not output warnings if ignoreSameVersionDuplicates == true", function(done) {
    webpack(MakeConfig(), function(err, stats) {
      assert(stats.compilation.warnings.length === 0);
      done();
    });
  });
});
