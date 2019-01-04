# worker-thread-loader

The loader for webpack, this loader use `worker-threads`.

## Getting started

First, clone and checkout this repository.

You can play sample application.

```
$ npm install
$ npm build
$ cd sample
$ npm install
$ npm run build
```

## Usage

package.json

```js
{
  "scripts": {
    "build": "node --experimental-worker ./node_modules/.bin/webpack --mode production"
  }
}
```

webpack.config.js

```js
module.exports = {
  ...

  resolveLoader: {
    alias: {
      'worker-thread-loader': path.resolve(PATH_TO_LOADER, 'dist', 'index')
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
```
