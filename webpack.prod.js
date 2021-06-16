const path = require("path");
const common = require("./webpack.common.js")
const { merge } = require("webpack-merge");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const Dotenv = require('dotenv-webpack');

module.exports = merge(common, {
    mode: "production",
    output: {
        filename: "[name].[contenthash].js", // Handle cache
        path: path.resolve(__dirname, "dist"),
        clean: true
    },
    optimization: {
        minimizer: [
            new OptimizeCssAssetsPlugin(),
            new TerserPlugin(),
            new HtmlWebpackPlugin({
                template: "./src/template.html",
                inject: true,
                chunks: ['index'],
                filename: 'app.html',
                minify: {
                    removeAttributeQuotes: true,
                    collapseWhitespace: true,
                    removeComments: true
                }
            }),
            new HtmlWebpackPlugin({
                template: "./src/landingPageTemplate.html",
                inject: true,
                chunks: ['landingPage'],
                filename: 'index.html',
                minify: {
                    removeAttributeQuotes: true,
                    collapseWhitespace: true,
                    removeComments: true
                }
            }),
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({ filename: "[name].[contenthash].css" }),
        new Dotenv({ // makes vars available to the application js code
            path: './.env',
            safe: true,
            allowEmptyValues: true,
        })
    ],
    module: {
        rules: [
            {
                test: /\.scss$/i,
                use: [
                    MiniCssExtractPlugin.loader, //3. Extract css into files
                    'css-loader', //2. Turns css into commonjs
                    'sass-loader' //1. Turns sass into css
                ],
            },
            {
                test: /\.node$/,
                loader: "node-loader",
            },
        ]
    }
});