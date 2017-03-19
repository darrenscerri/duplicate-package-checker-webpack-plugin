var path = require('path');
var findRoot = require('find-root');
var chalk = require('chalk');
var _ = require('lodash');

function DuplicatePackageCheckerPlugin() {}

function cleanPath(path) {
  return '.' + path.split('/node_modules/').join('/~/');
}

DuplicatePackageCheckerPlugin.prototype.apply = function(compiler) {
  compiler.plugin('emit', function(compilation, callback) {

    let context = compilation.compiler.context;
    let modules = {};

    compilation.modules.forEach(module => {

      if (!module.resource) {
        return;
      }

      let root;
      let pkg;

      try {
        root = findRoot(module.resource);
        pkg = require(path.join(root, 'package.json'));

        // Skip module if the package.json does not have a name
        if (!pkg || !pkg.name) {
          return;
        }
      } catch(e) {
        // Skip on error
        return;
      }

      let modulePath = cleanPath(root.replace(context, ''));
      let version = pkg.version;

      modules[pkg.name] = (modules[pkg.name] || []);

      let isSeen = _.find(modules[pkg.name], module => {
        return module.version === version && module.path === modulePath;
      });

      if (!isSeen) {
        modules[pkg.name].push({ version, path: modulePath });
      }

    });

    let duplicates = _.omitBy(modules, versions => versions.length <= 1);

    if (Object.keys(duplicates).length) {

      let error = 'duplicate-package-checker:';

      _.each(duplicates, (instances, name) => {
        instances = instances.map(version => {
          return `${chalk.green.bold(version.version)} ${chalk.white.bold(version.path)}`;
        });
        error += `\n  ${chalk.yellow.bold('<')}${chalk.green.bold(name)}${chalk.yellow.bold('>')}\n`;
        error += `    ${instances.join('\n    ')}\n`;
      });

      compilation.warnings.push(new Error(error));

    }

    callback();
  });
};

module.exports = DuplicatePackageCheckerPlugin;
