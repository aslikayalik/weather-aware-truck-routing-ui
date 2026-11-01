const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const MergeJsonWebpackPlugin = require('merge-jsons-webpack-plugin');
const utils = require('./utils.js');

const getTsLoaderRule = env => {
  const rules = [
    {
      loader: 'thread-loader',
      options: {
        // There should be 1 cpu for the fork-ts-checker-webpack-plugin.
        // The value may need to be adjusted (e.g. to 1) in some CI environments,
        // as cpus() may report more cores than what are available to the build.
        workers: require('os').cpus().length - 1,
      },
    },
    {
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
        happyPackMode: true,
      },
    },
  ];
  return rules;
};

module.exports = async options => {
  const development = options.env === 'development';
  const envPath = path.resolve(__dirname, '../.env');
  const envLocalPath = path.resolve(__dirname, '../.env.local');
  const envVars = {
    ...(require('dotenv').config({ path: envPath }).parsed || {}),
    ...(fs.existsSync(envLocalPath) ? require('dotenv').config({ path: envLocalPath }).parsed || {} : {}),
  };

  return merge({
    cache: {
      // 1. Set cache type to filesystem
      type: 'filesystem',
      cacheDirectory: path.resolve(__dirname, '../dist/webpack'),
      buildDependencies: {
        // 2. Add your config as buildDependency to get cache invalidation on config change
        config: [
          __filename,
          path.resolve(__dirname, `webpack.${development ? 'dev' : 'prod'}.js`),
          path.resolve(__dirname, 'utils.js'),
          path.resolve(__dirname, '../postcss.config.js'),
          path.resolve(__dirname, '../tsconfig.json'),
        ],
      },
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      modules: ['node_modules'],
      alias: utils.mapTypescriptAliasToWebpackAlias(),
      fallback: {
        path: require.resolve('path-browserify'),
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: getTsLoaderRule(options.env),
          include: [utils.root('./src/')],
          exclude: [utils.root('node_modules')],
        },
        {
          // Images referenced from CSS (e.g. leaflet.css)
          test: /\.(png|jpe?g|gif|svg)$/,
          type: 'asset/resource',
          generator: { filename: 'content/images/[name].[contenthash:8][ext]' },
        },
      ],
    },
    stats: {
      children: false,
    },
    plugins: [
      new webpack.EnvironmentPlugin({
        // react-jhipster requires LOG_LEVEL config.
        LOG_LEVEL: development ? 'info' : 'error',
      }),
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(envVars),
      }),
      new ESLintPlugin({
        baseConfig: {
          parserOptions: {
            project: ['../tsconfig.json'],
          },
        },
      }),
      new ForkTsCheckerWebpackPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          { from: './public/favicon.ico', to: 'favicon.ico' },
          { from: './public/manifest.webapp', to: 'manifest.webapp' },
          { from: './public/robots.txt', to: 'robots.txt' },
          { from: './public/content/images', to: 'content/images' },
        ],
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
        chunksSortMode: 'auto',
        inject: 'body',
        base: '/',
      }),
      new MergeJsonWebpackPlugin({
        output: {
          groupBy: [
            { pattern: './src/locales/tr.json', fileName: './i18n/tr.json' },
            { pattern: './src/locales/en.json', fileName: './i18n/en.json' },
          ],
        },
      }),
    ],
  });
};
