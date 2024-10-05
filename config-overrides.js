const webpack = require('webpack');
const { override, addWebpackPlugin } = require('customize-cra');

module.exports = override(
  addWebpackPlugin(new webpack.ProvidePlugin({
    process: 'process/browser.js',
    Buffer: ['buffer', 'Buffer'],
  })),
  (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer"),
      "os": require.resolve("os-browserify/browser"),
      "path": require.resolve("path-browserify"),
      "fs": false,
      "process": require.resolve("process/browser.js"),
      "vm": require.resolve("vm-browserify")  // Añade esta línea
    };
    return config;
  }
);
