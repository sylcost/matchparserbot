const path = require('path')

module.exports = options => {
    return {
      entry: './front_materialui/react.js',
      output: {
        //path: path.resolve(__dirname, './front_boostrap/dist'),
        path: path.resolve(__dirname, './front_materialui/dist'),
        filename: 'bundle.js',
      },
      mode: 'development',
      devtool: 'inline-source-map',
      devServer: {
        contentBase: './dist'
      },
      module: {
        rules: [
          {
            test: /.js$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'babel-loader'
              }
            ],
          },
          {
            test: /\.css$/,
            loader: 'style-loader!css-loader'
          },
          {
            test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
            loader: 'url-loader',
            options: {
              limit: 10000
            }
          }
        ],
      },
    }
  }