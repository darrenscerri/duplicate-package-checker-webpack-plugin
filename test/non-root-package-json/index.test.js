var webpack = require('webpack');
var assert = require('assert');
var stripAnsi = require('strip-ansi');
var config = require('./webpack.config');

describe('Dependency tree with non-root package.json', function() {
  it('should output warnings', function(done) {
    let warning = "duplicate-package-checker:\n  <a>\n    1.0.0 ./~/a\n    2.0.0 ./~/b/~/a\n\n  <b>\n    1.0.0 ./~/b\n    2.0.0 ./~/c/~/d/~/b\n";

    webpack(config, function(err, stats) {
      assert.equal(stripAnsi(stats.compilation.warnings[0].message), warning);
      done();
    });
  });
});
