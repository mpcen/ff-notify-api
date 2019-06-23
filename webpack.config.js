const path = require('path');
var fs = require('fs');

// Read more about what is going on here @
// https://jlongster.com/Backend-Apps-with-Webpack--Part-I#Getting-Started
let nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

module.exports = {
    mode: 'development',
    target: 'node',
    entry: {
        api: './api/index.js',
        services: './services/index.ts',
        socketListener: './websocket/listener.ts'
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    externals: nodeModules
};
