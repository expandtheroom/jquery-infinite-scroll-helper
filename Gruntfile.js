module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('infinite-scroll-helper.jquery.json'),
		watch: {
			html: {
				files: ['example/index.html'],
				options: {
					livereload: true
				}
			},
			js: {
				files: ['jquery.<%= pkg.name %>.js'],
				tasks: ['jshint', 'uglify'],
				options: {
					livereload: true
				}
			}
		},
		uglify: {
			dist: {
				files: {
					'jquery.<%= pkg.name %>.min.js': ['jquery.<%= pkg.name %>.js']
				},
			},
			options: {
				mangle: {
					toplevel: true,
					unsafe: true
				}
			}
		},

		jshint: {
			all: ['jquery.<%= pkg.name %>.js']
		}
	});

	// load tasks
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	// register tasks
	grunt.registerTask('default', 'uglify');
};