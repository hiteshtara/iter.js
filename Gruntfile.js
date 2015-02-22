/* jshint node: true */

module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [
                    'src/iter.js'
                ],
                dest: 'dist/iter.js'
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                mangle: false
            },

            build: {
                src: 'dist/iter.js',
                dest: 'dist/iter.min.js'
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            src: {
                src: ['src/iter.js']
            },
            test: {
                src: 'test/**/*.js'
            }
        },

        jasmine: {
            src: 'dist/iter.js',
            options: {
                specs: 'test/**/*.js'
            }
        },

        watch: {
            files: '**/*.js',
            tasks: ['jshint', 'concat', 'uglify', 'jasmine']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('test', ['concat', 'jasmine']);
    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'jasmine']);
};
