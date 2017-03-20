var path = require('path');
var findRoot = require('find-root');
var chalk = require('chalk');
var _ = require('lodash');

function DuplicatePackageCheckerPlugin() {}

function cleanPath(path) {
  return '.' + path.split('/node_modules/').join('/~/');
}

// Get closest package definition from path
function getClosestPackage(modulePath) {
  let root;
  let pkg;

  // Catch findRoot or require errors
  try {
    root = findRoot(modulePath);
    pkg = require(path.join(root, 'package.json'));
  } catch(e) {
    return null;
  }

  // If the package.json does not have a name property, try again from
  // one level higher.
  // https://github.com/jsdnxx/find-root/issues/2
  // https://github.com/date-fns/date-fns/issues/264#issuecomment-265128399
  if (!pkg.name) {
    return getClosestPackage(path.resolve(root, '..'));
  }

  return {
    package: pkg,
    path: root
  };
}

DuplicatePackageCheckerPlugin.prototype.apply = function(compiler) {
  compiler.plugin('emit', function(compilation, callback) {

    let context = compilation.compiler.context;
    let modules = {};

    compilation.modules.forEach(module => {

      if (!module.resource) {
        return;
      }

      let pkg;
      let packagePath;

      let closestPackage = getClosestPackage(module.resource);

      // Skip module if no closest package is found
      if (!closestPackage) {
        return;
      }

      pkg = closestPackage.package;
      packagePath = closestPackage.path;

      let modulePath = cleanPath(packagePath.replace(context, ''));
      let version = pkg.version;

      modules[pkg.name] = (modules[pkg.name] || []);

      let isSeen = _.find(modules[pkg.name], module => {
        return module.version === version;
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
