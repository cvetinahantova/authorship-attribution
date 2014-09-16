// Gruntfile.js

module.exports = function(grunt){

    // configurate Grunt
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // configure jshint to validate js files
        jshint: {
            options: {
                reporter: require('jshint-stylish')
            },
            build: ['Gruntfile.js', 'public/src/**/*.js']
        },

        // configure uglify to minify js files
        uglify: {
            options:{
                banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
            },
            build: {
              files: {
                  'public/dist/js/app.min.js' : ['public/src/js/**/*.js', 'public/src/js/*.js']
              }
            }
        },

        // configure cssmin to minify css files
        cssmin: {
            options: {
                banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
            },
            build: {
                files: {
                    'public/dist/css/styles.min.css' : 'public/src/css/style.css'
                }
            }
        },

        watch:{
            styleSheets:{
                files:['public/src/css/*.css'],
                tasks:['cssmin']
            },
            scripts:{
                files: ['public/src/js/**/*.js', 'public/src/js/*.js'],
                tasks: ['jshint', 'uglify']
            }
        },

        // configure nodemon
        nodemon:{
            dev:{
                script: 'server.js'
            }
        },

        concurrent: {
            options:{
                logConcurrentOutput: true
            },
            tasks:['watch', 'nodemon']
        }

    });

    // load grunt plugins
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['jshint', 'cssmin', 'uglify', 'concurrent']);
};