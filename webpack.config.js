var path = require('path')

module.exports = {
    entry: './src/js/aeromap.ts',
    output: {
        filename: './dist/js/aeromap.js'
    },
    module: {
        rules: [
            // { 
            //     test: /\.css?$/, 
            //     use: ['style-loader', 'css-loader']
            // },
            {
                test: /\.ts$/,
                use: ['ts-loader'],
                exclude: /node_modules/
            }
        ],
    },
    resolve: {
        extensions: ['.css', '.ts', '.json'],
        // alias: {
        //     leaflet_css: '/node_modules/leaflet/dist/leaflet.css'
        // }
    },

}