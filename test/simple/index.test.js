var webpack = require("webpack");
var assert = require("assert");
var MakeConfig = require("./make.webpack.config");

describe("Simple dependency tree", function() {
  it("should output warnings", function(done) {
    webpack(MakeConfig(), function(err, stats) {
      expect(stats.compilation.warnings[0].message).toMatchSnapshot();
      done();
    });
  });

  it("should output warnings in verbose", function(done) {
    webpack(MakeConfig({ verbose: true }), function(err, stats) {
      expect(stats.compilation.warnings[0].message).toMatchSnapshot();
      done();
    });
  });

  it("should output errors", function(done) {
    webpack(MakeConfig({ emitError: true }), function(err, stats) {
      expect(stats.compilation.errors[0].message).toMatchSnapshot();
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
});
