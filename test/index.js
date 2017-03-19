var webpack = require('webpack');
var assert = require('assert');
var stripAnsi = require('strip-ansi');

describe('Plugin', function() {
  it('should output warnings', function(done) {
    var config = require('./simple/webpack.config');
    let warning = "duplicate-package-checker:\n  <a>\n    1.0.0 ./~/a\n    2.0.0 ./~/b/~/a\n\n  <b>\n    1.0.0 ./~/b\n    2.0.0 ./~/c/~/d/~/b\n";

    webpack(config, function(err, stats) {
      assert(stripAnsi(stats.compilation.warnings[0].message) === warning);
      done();
    });
  });

  it('should handle non-root package.json', function(done) {
    var config = require('./non-root-package-json/webpack.config');
    let warning = "duplicate-package-checker:\n  <a>\n    1.0.0 ./~/a\n    2.0.0 ./~/b/~/a\n\n  <b>\n    1.0.0 ./~/b\n    2.0.0 ./~/c/~/d/~/b\n";

    webpack(config, function(err, stats) {
      assert(stripAnsi(stats.compilation.warnings[0].message) === warning);
      done();
    });
  });
});
