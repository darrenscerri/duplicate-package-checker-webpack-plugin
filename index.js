"use strict";

var path = require("path");
var findRoot = require("find-root");
var chalk = require("chalk");
var _ = require("lodash");

var defaults = {
  verbose: false,
  emitError: false,
  exclude: null
};

function DuplicatePackageCheckerPlugin(options) {
  this.options = _.extend({}, defaults, options);
}

function cleanPath(path) {
  return path.split("/node_modules/").join("/~/");
}

// Get closest package definition from path
function getClosestPackage(modulePath) {
  var root = void 0;
  var pkg = void 0;

  // Catch findRoot or require errors
  try {
    root = findRoot(modulePath);
    pkg = require(path.join(root, "package.json"));
  } catch (e) {
    return null;
  }

  // If the package.json does not have a name property, try again from
  // one level higher.
  // https://github.com/jsdnxx/find-root/issues/2
  // https://github.com/date-fns/date-fns/issues/264#issuecomment-265128399
  if (!pkg.name) {
    return getClosestPackage(path.resolve(root, ".."));
  }

  return {
    package: pkg,
    path: root
  };
}

DuplicatePackageCheckerPlugin.prototype.apply = function(compiler) {
  var verbose = this.options.verbose;
  var emitError = this.options.emitError;
  var exclude = this.options.exclude;

  compiler.plugin("emit", function(compilation, callback) {
    var context = compilation.compiler.context;
    var modules = {};

    function cleanPathRelativeToContext(modulePath) {
      var cleanedPath = cleanPath(modulePath);

      // Make relative to compilation context
      if (cleanedPath.indexOf(context) === 0) {
        cleanedPath = "." + cleanedPath.replace(context, "");
      }

      return cleanedPath;
    }

    compilation.modules.forEach(function(module) {
      if (!module.resource) {
        return;
      }

      var pkg = void 0;
      var packagePath = void 0;

      var closestPackage = getClosestPackage(module.resource);

      // Skip module if no closest package is found
      if (!closestPackage) {
        return;
      }

      pkg = closestPackage.package;
      packagePath = closestPackage.path;

      var modulePath = cleanPathRelativeToContext(packagePath);

      var version = pkg.version;

      modules[pkg.name] = modules[pkg.name] || [];

      var isSeen = _.find(modules[pkg.name], function(module) {
        return module.version === version;
      });

      if (!isSeen) {
        var entry = { version: version, path: modulePath };

        var issuer =
          module.issuer && module.issuer.resource
            ? cleanPathRelativeToContext(module.issuer.resource)
            : null;
        entry.issuer = issuer;

        modules[pkg.name].push(entry);
      }
    });

    var duplicates = _.omitBy(modules, function(instances, name) {
      if (instances.length <= 1) {
        return true;
      }

      if (exclude) {
        instances = instances.filter(function(instance) {
          instance = Object.assign({ name: name }, instance);
          return !exclude(instance);
        });

        if (instances.length <= 1) {
          return true;
        }
      }

      return false;
    });

    if (Object.keys(duplicates).length) {
      var error = "duplicate-package-checker:";

      _.each(duplicates, function(instances, name) {
        instances = instances.map(function(version) {
          var str =
            chalk.green.bold(version.version) +
            " " +
            chalk.white.bold(version.path);
          if (verbose && version.issuer) {
            str += " from " + chalk.white.bold(version.issuer);
          }
          return str;
        });
        error +=
          "\n  " +
          chalk.yellow.bold("<") +
          chalk.green.bold(name) +
          chalk.yellow.bold(">") +
          "\n";
        error += "    " + instances.join("\n    ") + "\n";
      });

      var array = emitError ? compilation.errors : compilation.warnings;
      array.push(new Error(error));
    }

    callback();
  });
};

module.exports = DuplicatePackageCheckerPlugin;
