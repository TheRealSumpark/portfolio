const { merge } = require('webpack-merge');
const commonConfiguration = require('./webpack.common.js');

module.exports = merge(commonConfiguration, {
  mode: 'development',
  devServer: {
    host: '127.0.0.1',
    port: 8080,
    contentBase: './dist',
    watchContentBase: true,
    open: false,
    overlay: true,
  },
});
