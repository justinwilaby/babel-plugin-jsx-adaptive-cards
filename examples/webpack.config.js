const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  resolve: {
    extensions: ['.js', '.acx']
  },
  module: {
    rules: [
      {
        test: /\.(js|acx)$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['test']),
  ],
  output: {
    filename: 'test.js',
    path: path.resolve(__dirname, 'test')
  }
};
