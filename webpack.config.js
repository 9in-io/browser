const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const pkg = require('./package.json');

const banner = `9in browser SDK v${pkg.version} (@9in-io/sdk)
Copyright (c) ${new Date().getFullYear()} Cubelet Ltd. MIT License.
https://github.com/9in-io/browser`;

// A local link to v2/packages/sdk is bundled from its TypeScript sources (the "@9in/source"
// export condition, ESM-style `./x.js` imports); the npm package ships dist/ only.
const sdkFromSource = fs.existsSync(path.join(path.dirname(require.resolve('@9in-io/sdk/package.json')), 'src'));

const config = {
    entry: './src/index.ts',
    mode: 'production',
    target: ['web', 'es2020'],
    module: {
        rules: [{test: /\.ts$/, loader: 'ts-loader', options: {transpileOnly: true, configFile: path.resolve(__dirname, 'tsconfig.json')}}],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        conditionNames: sdkFromSource ? ['@9in/source', '...'] : ['...'],
        extensionAlias: {'.js': ['.ts', '.js']},
    },
    plugins: [
        new webpack.BannerPlugin({banner}),
        new webpack.DefinePlugin({__VERSION__: JSON.stringify(pkg.version)}),
    ],
    optimization: {minimizer: [new TerserPlugin({extractComments: false})]},
};

module.exports = [
    {...config, output: {filename: '9in.min.js', path: path.resolve(__dirname, 'dist'), library: {name: 'Nine', type: 'window'}}},
    {...config, output: {filename: '9in.umd.min.js', path: path.resolve(__dirname, 'dist'), library: {name: 'Nine', type: 'umd'}, globalObject: 'this'}},
];
