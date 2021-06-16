const path = require("path");
const common = require("./webpack.common.js")
const { merge } = require("webpack-merge");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = merge(common, {
    mode: "development",   
    output: {
        filename:'[name].[hash:20].js', // Handle cache
        path: path.resolve(__dirname, "dist"),
        clean: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/template.html",
            inject: true,
            chunks: ['index'],
            filename: 'app'
        }),
        new HtmlWebpackPlugin({
            template: "./src/landingPageTemplate.html",
            inject: true,
            chunks: ['landingPage'],
            filename: 'index.html'
        }),
        new Dotenv({ // makes vars available to the application js code
            path: './.env',
            safe: true,
            allowEmptyValues: true,
        }),
        // new WebpackCDNInject({
        //     head: ["https://apis.google.com/js/api.js"]
        //   })
    ],
    module: {
        rules: [
            {
                test: /\.scss$/i,
                use: ['style-loader', //3. Inject styles into DOM
                    'css-loader', //2. Turns css into commonjs
                    'sass-loader' //1. Turns sass into css
                ],
            },
            {
                test: /\.node$/,
                loader: "node-loader",
            },
        ]
    },
    resolve: {

        modules: ['node_modules'],

        alias: {
            'node_modules': path.join(__dirname, 'node_modules')
        },

    },
    devServer: {
        // contentBase: path.join(__dirname, 'dist'),
        contentBase: './dist',
        compress: true,
        port: 9000,
    },
});