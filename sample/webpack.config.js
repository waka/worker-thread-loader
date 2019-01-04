'use strict';

const path = require('path');

const entries = {
  index: path.resolve(__dirname, 'src', 'index.js')
};

module.exports = {
  entry: entries,

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },

  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      path.resolve(__dirname, 'node_modules')
    ]
  },

  resolveLoader: {
    alias: {
      'worker-thread-loader': path.join(__dirname, '../dist/index')
    }
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'worker-thread-loader',
            options: {
              key: 'js'
            }
          },
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            }
          }
        ]
      }
    ]
  }
};
