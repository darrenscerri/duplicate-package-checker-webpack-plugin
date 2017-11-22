# duplicate-package-checker-webpack-plugin

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status](https://travis-ci.org/darrenscerri/duplicate-package-checker-webpack-plugin.svg?branch=master)](https://travis-ci.org/darrenscerri/duplicate-package-checker-webpack-plugin)

Webpack plugin that warns you when multiple versions of the same package exist in a build.

![duplicate-package-checker-webpack-plugin](https://cloud.githubusercontent.com/assets/729230/24270619/357ebc62-1016-11e7-9b04-f79fd5a72db7.png)

## Why?

It might be possible that a single package gets included multiple times in a Webpack build due to different package versions. This situation may happen without any warning,  resulting in extra bloat in your build and may lead to hard-to-find bugs.

This plugin will warn you of such cases to minimize build size and avoid bugs caused by unintended duplicate packages.

Motivation: https://github.com/webpack/webpack/issues/385 and https://github.com/webpack/webpack/issues/646.

## Install

```sh
npm install duplicate-package-checker-webpack-plugin --save-dev
```

## Configuration

Add the plugin to your webpack config:

```js
var DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');

module.exports = {
    plugins: [
      new DuplicatePackageCheckerPlugin()
    ]
};
```

You can also pass an object with configurable options:
```js
new DuplicatePackageCheckerPlugin({
  // Also show module that is requiring each duplicate package
  verbose: true,
  // Emit errors instead of warnings
  emitError: true,
  /**
   * Exclude instances of packages from the results.
   * If all instances of a package are excluded, or all instances except one,
   * then the package is no longer considered duplicated and won't be emitted as a warning/error.
   * @param {Object} instance
   * @param {string} instance.name The name of the package
   * @param {string} instance.version The version of the package
   * @param {string} instance.path Absolute path to the package
   * @param {?string} instance.issuer Absolute path to the module that requested the package
   * @returns {boolean} true to exclude the instance, false otherwise
   */
  exclude(instance) {
    return instance.name === 'fbjs';
  }
})
```

## Resolving duplicate packages in your bundle

There are multiple ways you can go about resolving duplicate packages in your bundle, the right solution mostly depends on what tools you're using.

### Webpack `resolve.alias`

Add an entry in [`resolve.alias`](https://webpack.github.io/docs/configuration.html#resolve-alias) which will configure Webpack to route any package references to a single specified path.

If Lodash is duplicated in your bundle, the following configuration would render all Lodash imports to always refer to the Lodash instance found at `./node_modules/lodash`.

```
alias: {
  lodash: path.resolve(__dirname, 'node_modules/lodash'),
}
```

### Yarn resolutions

Yarn supports ["selective version resolution"](https://yarnpkg.com/lang/en/docs/selective-version-resolutions) which allows you to enforce a common version for a package required by dependencies.

**package.json** 
```
{
  "dependencies": {
    "lodash": "4.17.0",
    "old-package-with-old-lodash": "*"
  },
  "resolutions": {
    "old-package-with-old-lodash/lodash": "4.17.0"
  }
}
```

### Bump your dependencies

If your project is using an old version of a package and a dependency is using a newer version of that package, consider upgrading your project to use a newer version of that package.

### File issues!

If your project has a dependency and it's using an outdated version of a package, file an issue and notify the author to update the dependencies.

[downloads-image]: https://img.shields.io/npm/dt/duplicate-package-checker-webpack-plugin.svg
[npm-url]: https://www.npmjs.com/package/duplicate-package-checker-webpack-plugin
[npm-image]: https://img.shields.io/npm/v/duplicate-package-checker-webpack-plugin.svg
