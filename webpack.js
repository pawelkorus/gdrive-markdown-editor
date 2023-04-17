const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const path = require('path');

module.exports = (env, argv) => {
    const configDir = env.local? '.config-local' : '.config-dev'
    const entryFile = './src/index.ts'
    
    return {
        entry: {
            'index': entryFile
        },
        devtool: 'source-map',
        devServer: {
            host: 'editor-2askjkd902nd.com',
            server: 'https',
            static: [path.resolve(__dirname, 'target'), path.resolve(__dirname, configDir)]
        },
        optimization: { 
            splitChunks: {
                cacheGroups: {
                    commons: {
                        test: /[\\/]node_modules[\\/]/,
                        name: "vendor",
                        chunks: "initial",
                    },
                }, 
            },
        },
        module: {
            rules: [
                {
                    test: /\.(tsx|ts)?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/
                },
                {
                    test: /\.(css)/,
                    use: [ 
                      MiniCssExtractPlugin.loader, // instead of style-loader
                      {
                        loader: 'css-loader', // translates CSS into CommonJS modules
                      }]
                },
                {
                    test: /\.(scss)/,
                    use: [
                      MiniCssExtractPlugin.loader, 
                      {
                        loader: 'css-loader', // translates CSS into CommonJS modules
                      }, {
                        loader: 'sass-loader' // compiles Sass to CSS
                      }
                    ]
                },
                {
                  test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                  type: 'asset/resource',
                  generator: {
                    filename: 'fonts/[hash][ext][query]'
                  }
                },
                {
                  test: /\.(csv)$/,
                  type: 'asset/resource'
                },
                {
                  test: /\.(png)$/,
                  type: 'asset/resource'
                }
            ]
        },
        resolve: {
            extensions: [ '.tsx', '.ts', '.js', '.scss', '.json', '.css', '.scss' ],
            fallback: {
                'http': false,
                'crypto': false,
                'fs': false,
                'path': false,
                'os': false,
                'stream': false,
                'buffer': false
            }
        },
        output: {
            filename: '[name].bundle.[contenthash].js',
            path: path.resolve(__dirname, 'target')
        },
        plugins: [
            new MiniCssExtractPlugin(),
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
              inlineSource: '.(js|css)$', // embed all javascript and css inline
              chunks: ['index'],
              template: 'src/index.html',
              filename: 'index.html'
            })
        ]
    }
}
