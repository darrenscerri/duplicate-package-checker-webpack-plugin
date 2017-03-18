'use strict';

var path = require('path');
var findRoot = require('find-root');
var chalk = require('chalk');
var _ = require('lodash');

function DuplicatePackageCheckerPlugin() {}

function cleanPath(path) {
  return '.' + path.split('/node_modules/').join('/~/');
}

DuplicatePackageCheckerPlugin.prototype.apply = function (compiler) {
  compiler.plugin('emit', function (compilation, callback) {

    var context = compilation.compiler.context;
    var modules = {};

    compilation.modules.forEach(function (module) {

      if (!module.resource) {
        return;
      }

      var root = findRoot(module.resource);
      var pkg = require(path.join(root, 'package.json'));

      var modulePath = cleanPath(root.replace(context, ''));
      var version = pkg.version;

      modules[pkg.name] = modules[pkg.name] || [];

      var isSeen = _.find(modules[pkg.name], function (module) {
        return module.version === version && module.path === modulePath;
      });

      if (!isSeen) {
        modules[pkg.name].push({ version: version, path: modulePath });
      }
    });

    var duplicates = _.omitBy(modules, function (versions) {
      return versions.length <= 1;
    });

    if (Object.keys(duplicates).length) {

      var error = 'duplicate-package-checker:';

      _.each(duplicates, function (instances, name) {
        instances = instances.map(function (version) {
          return chalk.green.bold(version.version) + ' ' + chalk.white.bold(version.path);
        });
        error += '\n  ' + chalk.yellow.bold('<') + chalk.green.bold(name) + chalk.yellow.bold('>') + '\n';
        error += '    ' + instances.join('\n    ') + '\n';
      });

      compilation.warnings.push(new Error(error));
    }

    callback();
  });
};

module.exports = DuplicatePackageCheckerPlugin;