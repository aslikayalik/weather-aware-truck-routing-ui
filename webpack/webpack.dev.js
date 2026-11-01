const webpack = require('webpack');
const webpackMerge = require('webpack-merge').merge;
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
const path = require('path');
const sass = require('sass');

const utils = require('./utils.js');
const commonConfig = require('./webpack.common.js');

const ENV = 'development';

module.exports = async options =>
  webpackMerge(await commonConfig({ env: ENV }), {
    devtool: 'cheap-module-source-map',
    mode: ENV,
    entry: ['./src/index'],
    output: {
      path: utils.root('dist'),
      filename: '[name].[contenthash:8].js',
      chunkFilename: '[name].[chunkhash:8].chunk.js',
    },
    optimization: {
      moduleIds: 'named',
    },
    module: {
      rules: [
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
            },
            {
              loader: 'postcss-loader',
            },
            {
              loader: 'sass-loader',
              options: { implementation: sass },
            },
          ],
        },
      ],
    },
    devServer: {
      open: true,
      hot: true,
      static: {
        directory: './dist/',
        watch: true,
      },
      port: 9060,
      proxy: [
        {
          // Backend (Django) - default: the web service from docker-compose
          context: ['/api', '/captcha', '/profile_images', '/admin', '/static/admin'],
          target: process.env.DEV_PROXY_TARGET || 'http://127.0.0.1:8000',
          secure: false,
          changeOrigin: true,
        },
      ],
      https: options.tls,
      historyApiFallback: true,
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
      },
      headers: {
        'Cache-Control': 'no-store',
      },
    },
    stats: process.env.JHI_DISABLE_WEBPACK_LOGS ? 'none' : options.stats,
    plugins: [
      process.env.JHI_DISABLE_WEBPACK_LOGS
        ? null
        : new SimpleProgressWebpackPlugin({
          format: options.stats === 'minimal' ? 'compact' : 'expanded',
        }),
      new WebpackNotifierPlugin({
        title: 'Weather-Aware Truck Routing',
      }),
    ].filter(Boolean),
  });