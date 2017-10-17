module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');



    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %> */ \n'
            },
            dist: {
                src: [ 'js/*.js', 'js/**/*.js' ],
                // dest: 'dist/app.js'
                dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },
        // 자바스크립트 구문검사를 합니다.
        jshint: {
            options: {
                // jshintrc: 'grunt/.jshintrc',
                force: true // error 검출시 task를 fail 시키지 않고 계속 진단
                // reporter: require('jshint-stylish') // output을 수정 할 수 있는 옵션
            },
            all: {
                src: ['Gruntfile.js', 'js/*.js', 'js/**/*.js']
            }
        },
        uglify: {
            dist: {
                files: {
                    'dist/saisei_report-1.0.0.min.js': [ 'dist/saisei_report-1.0.0.js' ]
                },
                options: {
                    mangle: false,
                    compress: {
                        drop_console: true
                    }
                }
            }
        },
        // 감시를 합니다.
        watch: {
            options: {
                livereload: true
            },
            js: {
                files: ['Gruntfile.js', 'js/*.js', 'js/**/*.js'],
                tasks: ['jshint','concat']
            }
        },
        // 서버를 열어서 브라우져에서 확인합니다.
        connect: {
            server: {
                options: {
                    port: 9010,
                    hostname: 'localhost',
                    livereload: true,
                    // keepalive: true,
                    base: './',
                    open: 'http://<%= connect.server.options.hostname %>:<%= connect.server.options.port %>'
                }
            }
        }
    });
    // grunt.registerTask('dev',['connect:server', 'watch']);    // Loading of tasks and registering tasks will be written here
    grunt.registerTask('serve', function (target) {
        console.log(target);
        if (target === 'dist') {
            return grunt.task.run(['connect', 'uglify:dist', 'watch' ]);
        }
        grunt.task.run([
            // 'default',
            'connect',
            'watch'
        ]);
    });

    grunt.registerTask('package', ['concat:dist', 'uglify:dist']);
    grunt.registerTask('default', ['connect', 'watch']);
};