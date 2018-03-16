var webpack = require("webpack");
var assert = require("assert");
var MakeConfig = require("./make.webpack.config");

describe("Simple dependency tree", function() {
  it("should output warnings", function(done) {
    webpack(MakeConfig(), function(err, stats) {
      expect(stats.compilation.warnings[0].message).toMatchSnapshot();
      expect(stats.compilation.warnings[1].message).toMatchSnapshot();
      assert(stats.compilation.warnings.length === 2);
      done();
    });
  });

  it("should output warnings in verbose", function(done) {
    webpack(MakeConfig({ verbose: true }), function(err, stats) {
      expect(stats.compilation.warnings[0].message).toMatchSnapshot();
      expect(stats.compilation.warnings[1].message).toMatchSnapshot();
      assert(stats.compilation.warnings.length === 2);
      done();
    });
  });

  it("should output errors", function(done) {
    webpack(MakeConfig({ emitError: true }), function(err, stats) {
      expect(stats.compilation.errors[0].message).toMatchSnapshot();
      expect(stats.compilation.errors[1].message).toMatchSnapshot();
      assert(stats.compilation.errors.length === 2);
      assert(stats.compilation.warnings.length === 0);
      done();
    });
  });

  it("should output errors in production mode", function(done) {
    webpack(MakeConfig({ emitError: true }, "production"), function(
      err,
      stats
    ) {
      expect(stats.compilation.errors[0].message).toMatchSnapshot();
      expect(stats.compilation.errors[1].message).toMatchSnapshot();
      assert(stats.compilation.errors.length === 2);
      assert(stats.compilation.warnings.length === 0);
      done();
    });
  });

  it("should ignore excluded duplicates by name", function(done) {
    webpack(
      MakeConfig({
        exclude: function(instance) {
          return instance.name === "a";
        }
      }),
      function(err, stats) {
        expect(stats.compilation.warnings[0].message).toMatchSnapshot();
        assert(stats.compilation.warnings.length === 1);
        done();
      }
    );
  });

  it("should ignore excluded duplicates by issuer", function(done) {
    webpack(
      MakeConfig({
        exclude: function(instance) {
          return instance.issuer === "./entry.js";
        }
      }),
      function(err, stats) {
        assert(stats.compilation.warnings.length === 0);
        done();
      }
    );
  });
  it("should respect showHelp option", function(done) {
    webpack(
      MakeConfig({
        showHelp: false
      }),
      function(err, stats) {
        expect(stats.compilation.warnings[0]).toMatchSnapshot();
        expect(stats.compilation.warnings[1]).toMatchSnapshot();
        done();
      }
    );
  });
});
