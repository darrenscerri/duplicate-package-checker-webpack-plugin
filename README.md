# 🕵 duplicate-package-checker-webpack-plugin

[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status](https://travis-ci.org/darrenscerri/duplicate-package-checker-webpack-plugin.svg?branch=master)](https://travis-ci.org/darrenscerri/duplicate-package-checker-webpack-plugin)

Webpack plugin that warns when your bundle contains multiple versions of the same package.

![duplicate-package-checker-webpack-plugin](https://raw.githubusercontent.com/darrenscerri/duplicate-package-checker-webpack-plugin/master/screenshot.png)

## Why?

It might be possible that a single package gets included multiple times in a Webpack bundle due to different package versions. This situation may happen without any warning, resulting in extra bloat in your bundle and may lead to hard-to-find bugs.

This plugin will warn you of such cases to minimize bundle size and avoid bugs caused by unintended duplicate packages.

Motivation: https://github.com/webpack/webpack/issues/385 and https://github.com/webpack/webpack/issues/646.

## Install

```sh
npm install duplicate-package-checker-webpack-plugin --save-dev
```

## Configuration

Add the plugin to your webpack config:

```js
var DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");

module.exports = {
  plugins: [new DuplicatePackageCheckerPlugin()]
};
```

You can also pass an object with configurable options:

```js
new DuplicatePackageCheckerPlugin({
  // Also show module that is requiring each duplicate package (default: false)
  verbose: true,
  // Emit errors instead of warnings (default: false)
  emitError: true,
  // Show help message if duplicate packages are found (default: true)
  showHelp: false,
  // Warn also if major versions differ (default: true)
  strict: false,
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
    return instance.name === "fbjs";
  }
});
```

## Strict mode

Strict mode warns when multiple packages with different **major** versions (such as `v1.0.0` vs `v2.0.0`) exist in the bundle.

Packages with different major versions introduce backward incompatible changes and require either interventions on third-party packages or unsafe workarounds (such as resolving differing package major versions dependencies with a single version).

It is suggested that strict mode is kept enabled since this improves visibility into your bundle and can help in solving and identifying potential issues.

## Resolving duplicate packages in your bundle

There are multiple ways you can go about resolving duplicate packages in your bundle, the right solution mostly depends on what tools you're using and on each particular case.

### Webpack `resolve.alias`

Add an entry in [`resolve.alias`](https://webpack.github.io/docs/configuration.html#resolve-alias) which will configure Webpack to route any package references to a single specified path.

For example, if Lodash is duplicated in your bundle, the following configuration would render all Lodash imports to always refer to the Lodash instance found at `./node_modules/lodash`.

```
alias: {
  lodash: path.resolve(__dirname, 'node_modules/lodash'),
}
```

**Note: Aliasing packages with different major versions may break your app. Use only if you're sure that all required versions are compatible, at least in the context of your app**

### Yarn `install --flat`

Yarn allows [flat installations](https://yarnpkg.com/lang/en/docs/cli/install/#toc-yarn-install-flat) (`yarn install --flat`) which will only allow one version of each package to be installed.

### Yarn resolutions

If you want more control over your overridden dependency versions and don't feel like using `yarn install --flat`, yarn supports ["selective version resolution"](https://yarnpkg.com/lang/en/docs/selective-version-resolutions) which allows you to enforce specific versions for each dependency.

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

### NPM Dedupe

If you use NPM and not Yarn, you can try running `npm dedupe`. NPM **may** leave multiple versions of the same package installed even if a single version satisfies each [semver](https://docs.npmjs.com/getting-started/semantic-versioning) of all of its dependants.

### Bump your dependencies

If your project is using an old version of a package and a dependency is using a newer version of that package, consider upgrading your project to use the newer version.

### File issues!

If your project has a dependency and it's using an outdated version of a package, file an issue and notify the author to update the dependencies. Let's help keep our projects green and our applications secure, performant and bug-free!

## Webpack versions

### Webpack 3.x

`npm install duplicate-package-checker-webpack-plugin@^2.1.0 --save-dev`

### Webpack 4.x

`npm install duplicate-package-checker-webpack-plugin`

[downloads-image]: https://img.shields.io/npm/dt/duplicate-package-checker-webpack-plugin.svg
[npm-url]: https://www.npmjs.com/package/duplicate-package-checker-webpack-plugin
[npm-image]: https://img.shields.io/npm/v/duplicate-package-checker-webpack-plugin.svg
