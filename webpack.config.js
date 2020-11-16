
var path = require('path');

var main = {
  target: 'electron-main',
  entry: path.resolve(__dirname, 'src', 'index'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        include: path.resolve(__dirname, 'src'),
        loader: 'ts-loader'
      }
    ]
  },
}

var renderer = {
  mode: "development",
  target: 'electron-renderer',
  entry: path.join(__dirname, 'src', 'renderer', 'index'),
  output: {
    path: path.resolve(__dirname, 'dist', 'renderer'),
    filename: 'index.js'
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@framework': path.resolve(__dirname, './Framework/src')
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader'
      }
    ]
  },
  // devServer: {
  //   contentBase: path.resolve(__dirname, './'),
  //   watchContentBase: true,
  //   inline: true,
  //   hot: true,
  //   port: 5000,
  //   host: '0.0.0.0',
  //   compress: true,
  //   useLocalIp: true,
  //   writeToDisk: true
  // },
  // devtool: 'inline-source-map'
}

module.exports = [
  main, renderer
];