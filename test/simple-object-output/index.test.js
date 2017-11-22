var webpack = require("webpack");
var assert = require("assert");
var stripAnsi = require("strip-ansi");
var MakeConfig = require("./make.webpack.config");

describe("Simple dependency tree - object output", function() {
  it("should output warnings", function(done) {
    let warning = {
      duplicates: {
        a: [
          { version: "1.0.0", path: "./~/a", issuer: "./entry.js" },
          { version: "2.0.0", path: "./~/b/~/a", issuer: "./~/b/index.js" }
        ],
        b: [
          { version: "1.0.0", path: "./~/b", issuer: "./entry.js" },
          {
            version: "2.0.0",
            path: "./~/c/~/d/~/b",
            issuer: "./~/c/~/d/index.js"
          }
        ]
      }
    };

    webpack(MakeConfig(), function(err, stats) {
      assert.deepEqual(stats.compilation.warnings[0], warning);
      done();
    });
  });

  it("should output errors", function(done) {
    let error = {
      duplicates: {
        a: [
          { version: "1.0.0", path: "./~/a", issuer: "./entry.js" },
          { version: "2.0.0", path: "./~/b/~/a", issuer: "./~/b/index.js" }
        ],
        b: [
          { version: "1.0.0", path: "./~/b", issuer: "./entry.js" },
          {
            version: "2.0.0",
            path: "./~/c/~/d/~/b",
            issuer: "./~/c/~/d/index.js"
          }
        ]
      }
    };

    webpack(MakeConfig({ emitError: true }), function(err, stats) {
      assert.deepEqual(stats.compilation.errors[0], error);
      done();
    });
  });

  it("should ignore excluded duplicates by name", function(done) {
    let warning = {
      duplicates: {
        b: [
          { version: "1.0.0", path: "./~/b", issuer: "./entry.js" },
          {
            version: "2.0.0",
            path: "./~/c/~/d/~/b",
            issuer: "./~/c/~/d/index.js"
          }
        ]
      }
    };

    webpack(
      MakeConfig({
        exclude: function(instance) {
          return instance.name === "a";
        }
      }),
      function(err, stats) {
        assert.deepEqual(stats.compilation.warnings[0], warning);
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
