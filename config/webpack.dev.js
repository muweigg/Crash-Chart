const helpers = require('./helpers');
const config = require('./webpack.common');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
// const webpackMergeDll = webpackMerge.strategy({ plugins: 'replace' });

const fileUtils = require('./fileUtils');

// hot html-webpack-plugin
const HOT = /--hot/i.test(process.argv.join(' '));
let devServer;

function CustomHtmlReloadPlugin() {
    const cache = {}
    const plugin = {
        name: 'CustomHtmlReloadPlugin'
    }
    this.hooks.compilation.tap(plugin, compilation => {
        compilation.hooks.htmlWebpackPluginAfterEmit.tap(plugin, data => {
            const orig = cache[data.outputName]
            const html = data.html.source()
            // plugin seems to emit on any unrelated change?
            if (orig && orig !== html) {
                devServer.sockWrite(devServer.sockets, 'content-changed')
            }
            cache[data.outputName] = html
        })
    })
}

module.exports = webpackMerge(config(), {

    devtool: "eval",

    devServer: {
        before(app, server) {
            devServer = server;
        }
    },

    module: {
        rules: [{
            test: /\.(s[ac]|c)ss$/,
            use: ['vue-style-loader', 'css-loader?importLoaders=1', 'postcss-loader', 'sass-loader'],
        }]
    },

    plugins: [HOT ? CustomHtmlReloadPlugin : () => {}]
});