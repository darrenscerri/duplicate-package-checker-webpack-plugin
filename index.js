var path = require('path');
var findRoot = require('find-root');
var chalk = require('chalk');
var _ = require('lodash');

function DuplicatePackagesCheckerPlugin() {}

DuplicatePackagesCheckerPlugin.prototype.apply = function(compiler) {
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

    console.log('');

    if (Object.keys(duplicates).length) {
      console.log(chalk.yellow('WARNING! Duplicate packages found.'));

      _.each(duplicates, (versions, name) => {
        console.log('<' + chalk.green.bold(name) + '> - ' + chalk.yellow.bold(versions.join(', ')));
      });
    } else {
      console.log(chalk.green('No duplicate packages found!'));
    }

    console.log('');

    callback();
  });
};

module.exports = DuplicatePackagesCheckerPlugin;

