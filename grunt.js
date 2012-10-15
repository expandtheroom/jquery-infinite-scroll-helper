module.exports = function(grunt) {

	grunt.initConfig({
		min: {
			dist: {
				src: ['jquery.infinite-scroll-helper.js'],
				dest: 'jquery.infinite-scroll-helper.min.js'
			}
		},
		uglify: {
			mangle: {
				toplevel: true,
				unsafe: true
			}
		}
	});

	grunt.registerTask('default', 'min');

};