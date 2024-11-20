const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const path = require("path");

module.exports = (env, argv) => {
  const configDir = env.local ? ".config-local" : ".config-dev";
  const entryFile = "./src/index.tsx";

  return {
    entry: {
      index: entryFile,
    },
    devtool: "source-map",
    devServer: {
      host: "0.0.0.0",
      server: "https",
      static: [
        path.resolve(__dirname, "target"),
        path.resolve(__dirname, configDir),
      ],
      port: 8080,
      allowedHosts: "all",
      historyApiFallback: true, // required for react-router
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
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.(css)/,
          use: [
            MiniCssExtractPlugin.loader, // instead of style-loader
            {
              loader: "css-loader", // translates CSS into CommonJS modules
            },
            {
              loader: "postcss-loader",
            },
          ],
        },
        {
          test: /\.(scss)/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader", // translates CSS into CommonJS modules
            },
            {
              loader: "postcss-loader",
            },
            {
              loader: "sass-loader", // compiles Sass to CSS
            },
          ],
        },
        {
          test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
          type: "asset/resource",
          generator: {
            filename: "fonts/[hash][ext][query]",
          },
        },
        {
          test: /\.(csv)$/,
          type: "asset/resource",
        },
        {
          test: /\.(png)$/,
          type: "asset/resource",
          generator: {
            filename: "images/[hash][ext][query]",
          },
        },
      ],
    },
    resolve: {
      alias: {
        "@app": path.resolve(__dirname, "src"),
      },
      modules: [path.resolve(__dirname, "src"), "node_modules"],
      extensions: [".tsx", ".ts", ".js", ".scss", ".json", ".css", ".scss"],
      fallback: {
        http: false,
        crypto: false,
        fs: false,
        path: false,
        os: false,
        stream: false,
        buffer: false,
      },
    },
    output: {
      filename: "[name].bundle.[contenthash].js",
      path: path.resolve(__dirname, "target"),
      publicPath: '/', // required for react-router
    },
    plugins: [
      new MiniCssExtractPlugin(),
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        inlineSource: ".(js|css)$", // embed all javascript and css inline
        chunks: ["index"],
        template: "src/index.html",
        filename: "index.html",
        inject: true,
      }),
      new FaviconsWebpackPlugin({
        logo: './src/assets/favicon.png', // Single source image
        cache: true,
        inject: true, // Inject tags into HTML
        favicons: {
          appName: 'Gdrive Markdown Editor',
          // appDescription: 'Gdrive Markdown Editor',
          // developerName: 'Developer Name',
          // developerURL: null, // Replace with your website URL if needed
          background: '#ffffff',
          theme_color: '#ffffff',
          icons: {
            android: true,         // Android homescreen icon
            appleIcon: true,       // Apple touch icons
            appleStartup: false,   // Apple startup images
            favicons: true,        // Standard favicon
            windows: true,         // Windows 8/10 tile icons
            yandex: false,         // Yandex browser icons
          },
        },
      }), 
    ],
  };
};
