const HtmlWebpackPlugin = require('html-webpack-plugin')

const PageOptions = {
    title: 'Aeromap',
    template: 'index.html'
}

module.exports = {
    entry: './src/js/aeromap.ts',
    output: {
        filename: './dist/js/aeromap.js'
    },
    plugins: [
        new HtmlWebpackPlugin(PageOptions)
    ],
    module: {
        rules: [
            { 
                test: /\.css?$/, 
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.ts$/,
                use: ['ts-loader'],
                exclude: /node_modules/
            },
            {
                test: /\.png$/,
                loader: "url-loader?mimetype=image/png"
            }
        ],
    },
    resolve: {
        extensions: ['.ts', '.json', '.png', '.js', '.css', '.html'],
        alias: {
            leaflet_css: '/node_modules/leaflet/dist/leaflet.css'
        }
    },

}