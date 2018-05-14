"use strict";

var path = require("path");
var findRoot = require("find-root");
var chalk = require("chalk");
var _ = require("lodash");
var semver = require("semver");

var defaults = {
  verbose: false,
  showHelp: true,
  emitError: false,
  exclude: null,
  strict: true,
  ignoreSameVersionDuplicates: true
};

function DuplicatePackageCheckerPlugin(options) {
  this.options = _.extend({}, defaults, options);
}

function cleanPath(path) {
  return path.split(/[\/\\]node_modules[\/\\]/).join("/~/");
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
  var showHelp = this.options.showHelp;
  var emitError = this.options.emitError;
  var exclude = this.options.exclude;
  var strict = this.options.strict;
  var ignoreSameVersionDuplicates = this.options.ignoreSameVersionDuplicates;

  compiler.hooks.emit.tapAsync("DuplicatePackageCheckerPlugin", function(
    compilation,
    callback
  ) {
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

      var entry = { version: version, path: modulePath };

      var issuer =
        module.issuer && module.issuer.resource
          ? cleanPathRelativeToContext(module.issuer.resource)
          : null;
      entry.issuer = issuer;
      var isIncluded = modules[pkg.name].filter(function(v) {
        return v.path === entry.path;
      });
      if (isIncluded.length === 0) {
        modules[pkg.name].push(entry);
      }
    });

    var duplicates = {};

    var _loop = function _loop(name) {
      var instances = modules[name];

      if (instances.length <= 1) {
        return "continue";
      }

      var filtered = instances;
      if (ignoreSameVersionDuplicates) {
        filtered = [];
        var groups = _.groupBy(instances, function(instance) {
          return instance.version;
        });
        _.each(groups, function(group) {
          if (group.length >= 1) {
            filtered = filtered.concat(group[0]);
          }
        });

        if (filtered.length <= 1) {
          return "continue";
        }
      }

      if (!strict) {
        filtered = [];
        var _groups = _.groupBy(instances, function(instance) {
          return semver.major(instance.version);
        });

        _.each(_groups, function(group) {
          if (group.length >= 1) {
            filtered = filtered.concat(group[0]);
          }
        });

        if (filtered.length <= 1) {
          return "continue";
        }
      }

      if (exclude) {
        filtered = filtered.filter(function(instance) {
          instance = Object.assign({ name: name }, instance);
          return !exclude(instance);
        });

        if (filtered.length <= 1) {
          return "continue";
        }
      }

      duplicates[name] = filtered;
    };

    for (var name in modules) {
      var _ret = _loop(name);

      if (_ret === "continue") continue;
    }

    var duplicateCount = Object.keys(duplicates).length;

    if (duplicateCount) {
      var array = emitError ? compilation.errors : compilation.warnings;

      var i = 0;

      var sortedDuplicateKeys = Object.keys(duplicates).sort();

      sortedDuplicateKeys.map(function(name) {
        var instances = duplicates[name].sort(function(a, b) {
          return a.version < b.version ? -1 : 1;
        });

        var error =
          name +
          "\n" +
          chalk.reset("  Multiple versions of ") +
          chalk.green.bold(name) +
          chalk.white(" found:\n");
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
        error += "    " + instances.join("\n    ") + "\n";
        // only on last warning
        if (showHelp && ++i === duplicateCount) {
          error +=
            "\n" +
            chalk.white.bold("Check how you can resolve duplicate packages: ") +
            "\nhttps://github.com/darrenscerri/duplicate-package-checker-webpack-plugin#resolving-duplicate-packages-in-your-bundle\n";
        }
        array.push(new Error(error));
      });
    }

    callback();
  });
};

module.exports = DuplicatePackageCheckerPlugin;
