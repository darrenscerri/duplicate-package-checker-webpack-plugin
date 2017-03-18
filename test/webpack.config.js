const path = require('path');
var DuplicatePackageCheckerPlugin = require('../');

module.exports = {
  entry: './entry.js',
  context: __dirname,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  plugins: [
    new DuplicatePackageCheckerPlugin()
  ]
};
