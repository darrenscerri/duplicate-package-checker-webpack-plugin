var webpack = require("webpack");
var assert = require("assert");
var MakeConfig = require("./make.webpack.config");

describe("Simple dependency tree", function() {
  it("should output warnings if strict", function(done) {
    webpack(MakeConfig(), function(err, stats) {
      assert(stats.compilation.warnings.length === 2);
      expect(stats.compilation.warnings[0].message).toMatchSnapshot();
      expect(stats.compilation.warnings[1].message).toMatchSnapshot();
      done();
    });
  });

  it("should not output warnings if not strict", function(done) {
    webpack(
      MakeConfig({
        strict: false
      }),
      function(err, stats) {
        assert(stats.compilation.warnings.length === 2);
        expect(stats.compilation.warnings[0].message).toMatchSnapshot();
        expect(stats.compilation.warnings[1].message).toMatchSnapshot();
        done();
      }
    );
  });
});
