var path = require('path');
var findRoot = require('find-root');
var chalk = require('chalk');
var _ = require('lodash');

function DuplicatePackageCheckerPlugin() {}

DuplicatePackageCheckerPlugin.prototype.apply = function(compiler) {
  compiler.plugin('emit', function(compilation, callback) {

    var modules = {};

    compilation.modules.forEach(module => {

      if (!module.resource) {
        return;
      }

      var root = findRoot(module.resource);

      var pkg = require(path.join(root, 'package.json'));

      modules[pkg.name] = (modules[pkg.name] || []);

      if (!_.includes(modules[pkg.name], pkg.version)) {
        modules[pkg.name].push(pkg.version);
      }

    });

    var duplicates = _.omitBy(modules, versions => versions.length <= 1);

    if (Object.keys(duplicates).length) {

      _.each(duplicates, (versions, name) => {
        compilation.warnings.push(new Error('duplicate-package-checker: <' + chalk.green.bold(name) + '> - ' + chalk.yellow.bold(versions.join(', '))));
      });
    }

    callback();
  });
};

module.exports = DuplicatePackageCheckerPlugin;
