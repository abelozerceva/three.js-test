var webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
	alias: {
		'three/OrbitControls': path.join(__dirname, 'node_modules/three/examples/js/controls/OrbitControls.js'),
		'three': path.join(__dirname, 'node_modules/three/build/three.min.js'),
		// 'three/OBJLoader': path.join(__dirname, 'node_modules/three/examples/js/loaders/OBJLoader.js')
	}
},
  plugins:[
	new webpack.ProvidePlugin({
		'THREE': 'three'
    }),
    ]
};