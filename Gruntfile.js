/**
 * Copyright (C) 2013-2014 Christophe Rosset <tophe@topheman.com> - https://github.com/topheman/PanoramaSensorsViewer
 * 
 * Released under MIT License :
 * https://github.com/topheman/PanoramaSensorsViewer/blob/master/LICENSE
 */

/**
 * Tou know grunt ? It's great ! Two things :
 * - npm install (will install the node packages needed)
 * - npm install grunt-cli -g (if you don't have it already)
 * - grunt server (will start you a local server so that you can test)
 */
module.exports = function(grunt) {

    // Load Grunt tasks declared in the package.json file
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var PanoramaSensorsViewerVersion = require('./package.json').version,
    gruntSpecificOptions;
    
    try{
        gruntSpecificOptions = grunt.file.readJSON('./grunt.options.json');//specific options meant to be split from the hard code of the GruntFile.js
    }
    catch(e){
        grunt.log.error("No grunt.options.json file find (you will need it for ftp-deploy)");
    }

    // Configure Grunt 
    grunt.initConfig({
        
        // grunt-contrib-connect will serve the files of the project
        // on specified port and hostname
        connect: {
            debug: {
                options: {
                    port: 9002,
                    hostname: "0.0.0.0",
                    keepalive: true,
                    base: "src"
                }
            },
            release: {
                options: {
                    port: 9002,
                    hostname: "0.0.0.0",
                    keepalive: true,
                    base: "release"
                }
            }
        },
        
        // grunt-open will open your browser at the project's URL
        open: {
            debug: {
                path: 'http://localhost:<%= connect.debug.options.port%>/'
            },
            release: {
                path: 'http://localhost:<%= connect.release.options.port%>/'
            }
        },
        
        //this part is for building
        clean: {
            //clean all before any build
            all: {
                src : ['release']
            },
            "after-build" : {
                src : [
                    'release/googleAnalyticsScriptTag.html'
                ]
            }
        },
        
        copy:{
            release:{
                files:[
                    {expand: true, cwd: 'src/', src: ['**'], dest: 'release/'}
                ]
            }
        },
        
        "git-rev-parse": {
            panoramaSensorsViewerRevision: {
                options: {
                    prop: 'PanoramaSensorsViewerRevision',
                    number: 8
                }
            }
        },
        
        //https://github.com/jsoverson/preprocess + https://npmjs.org/package/grunt-preprocess
        preprocess: {
            options:{
                context:{
                    "PanoramaSensorsViewerVersion" : PanoramaSensorsViewerVersion,
                    "PanoramaSensorsViewerRevision" : '<%= grunt.config.get("PanoramaSensorsViewerRevision") %>',
                    "PanoramaSensorsViewerVersionAndRevision" : 'v'+PanoramaSensorsViewerVersion+' - r.<%= grunt.config.get("PanoramaSensorsViewerRevision") %>'
                }
            },
            "process-html" : {
                files : {
                    'release/index.html' : 'src/index.html',
                    'release/demo.basic.html' : 'src/demo.basic.html',
                    'release/demo.controls.html' : 'src/demo.controls.html',
                    'release/demo.custompanorama.html' : 'src/demo.custompanorama.html',
                    'release/demo.custompanorama.tiles.html' : 'src/demo.custompanorama.tiles.html',
                    'release/demo.events.html' : 'src/demo.events.html',
                    'release/test.bug.android.firefox.html' : 'src/test.bug.android.firefox.html'
                }
            }
        }
        
    });
    
    if(gruntSpecificOptions){
        grunt.config("ftp-deploy",{
            release: {
                auth: {
                    host: gruntSpecificOptions["ftp-deploy"].release.host,
                    port: gruntSpecificOptions["ftp-deploy"].release.port,
                    authKey: 'key1'
                },
                src: 'release',
                dest: gruntSpecificOptions["ftp-deploy"].release.dest,
                exclusions: ['release/build.txt']
            }
        });
        grunt.registerTask('deploy', ['ftp-deploy:release']);
    }
    
    grunt.registerTask('server', ['open:debug', 'connect:debug']);
    grunt.registerTask('default', ['open:debug', 'connect:debug']);
    
    grunt.registerTask('getGitRevisionNumbers',['git-rev-parse']);
    
    grunt.registerTask('build', ['clean:all','copy:release','getGitRevisionNumbers','preprocess:process-html','clean:after-build']);
    grunt.registerTask('server-release', ['open:release', 'connect:release']);
    
};