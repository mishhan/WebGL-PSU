const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	entry: './src/index.ts',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/
			},
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.(png|svg|jpg|gif)$/,
				use: ['file-loader']
			}
		]
	},
	plugins: [new CopyWebpackPlugin([{ from: 'src/assets', to: 'assets' }])],
	resolve: {
		extensions: ['.tsx', '.ts', '.js', '.css']
	},
	devServer: {
		inline: true,
		contentBase: './dist',
		port: 5500
	},
	output: {
		filename: 'app.js',
		path: path.resolve(__dirname, 'dist')
	}
};
