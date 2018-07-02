const helpers = require('./helpers');
const config = require('./webpack.common');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const CleanPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const SuppressExtractedTextChunksWebpackPlugin = require('./plugins/SuppressExtractedTextChunksWebpackPlugin');
// const ManifestPlugin = require('webpack-manifest-plugin');

const fileUtils = require('./fileUtils');
const supportES2015 = helpers.supportES2015();

function getUglifyOptions(supportES2015) {
    const uglifyCompressOptions = {
        pure_getters: true,
        // PURE comments work best with 3 passes.
        // See https://github.com/webpack/webpack/issues/2899#issuecomment-317425926.
        passes: 3,
        drop_console: true,
        warnings: false
    };

    return {
        ecma: supportES2015 ? 6 : 5,
        warnings: false,
        ie8: false,
        mangle: true,
        compress: uglifyCompressOptions,
        output: {
            ascii_only: true,
            comments: false
        }
    };
}

module.exports = webpackMerge(config(), {

    output: {
        filename: '[name].[chunkhash:12].js',
        chunkFilename: '[name].[chunkhash:12].js',
    },
    
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                sourceMap: false,
                parallel: true,
                cache: helpers.root('.webpack-cache/uglify-cache'),
                uglifyOptions: getUglifyOptions(supportES2015),
            }),
            new OptimizeCSSAssetsPlugin({
                cssProcessorOptions: {
                    zindex: false,
                    reduceIdents: false,
                    discardComments: { removeAll: true },
                }
            }),
        ]
    },

    module: {
        rules: [
            {
                test: /\.(s[ac]|c)ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: { publicPath: '.' }
                    },
                    'css-loader?importLoaders=1',
                    'postcss-loader',
                    'sass-loader',
                ]
            },
        ]
    },

    plugins: [
        new CleanPlugin(['dist'], { root: helpers.root() }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash:12].css',
            chunkFilename: '[name].[contenthash:12].css'
        }),
        new SuppressExtractedTextChunksWebpackPlugin(),
        new InlineManifestWebpackPlugin(),
        // new ManifestPlugin(),
    ]
});