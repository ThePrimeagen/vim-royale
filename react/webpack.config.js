const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  plugins: [
  ],
};

// Doing TypeScript type checking
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

const path = require("path")
const paths = {
    // Source files
    src: path.resolve(__dirname, "src"),

    // Production build files
    build: path.resolve(__dirname, "dist"),
}

module.exports = {
    mode: "production",
    devtool: false,

    // Where webpack looks to start building the bundle and include polyfill
    entry: [paths.src + '/client.tsx'],

    output: {
        path: paths.build,
        publicPath: "/",
        filename: "js/[name].bundle.js",
    },

    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
    },

    // Production: Magic happen here transpiling to es5 to partly support older browser like IE11
    target: ["web", "es5"],

    // Customize the webpack build process
    plugins: [

        // Removes/cleans build folders and unused assets when rebuilding
        new CleanWebpackPlugin(),

        new ForkTsCheckerWebpackPlugin({
            async: false,
        }),

        // Generates an HTML file from a template
        // Generates deprecation warning: https://github.com/jantimon/html-webpack-plugin/issues/1501
        new HtmlWebpackPlugin({
            title: "I hate webpack:w",
            template: paths.src + "/index.html", // template file
            filename: "index.html", // output file
        }),

        new CopyWebpackPlugin({
            patterns: [
                { from: "src/style.css", to: "style.css" },
            ],
        }),
    ],

    module: {

        // Note: These 2 rules could likely be handled in one test: statement.
        // However, using 2seperate statements each sttament could have different options if needed

        // Use Babel to transpile JavaScript ES6+ / React files to ES5
        rules: [{
            test: /\.(jsx|js)$/,
            exclude: /node_modules/,
            use: {
                loader: "babel-loader"
            }
        }, {
            test: /\.(tsx|ts)$/,
            exclude: /node_modules/,
            use: {
                loader: "babel-loader"
            }
        }]
    },

    /*
    optimization: {
        minimize: true,
        // Once your build outputs multiple chunks, this option will ensure they share the webpack runtime
        // instead of having their own. This also helps with long-term caching, since the chunks will only
        // change when actual code changes, not the webpack runtime.
        runtimeChunk: {
            name: "runtime",
        },
    },
    */
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
    },
};
