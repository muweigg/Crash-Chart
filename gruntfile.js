const grunt = require('grunt');

grunt.initConfig({
    pure_grids: {
        responsive: {
            dest: 'src/css/common/third-party/pure/custom-grids-responsive.scss',
            options: {
                units: [5, 12, 24],
                mediaQueries: {
                    sm: 'screen and (min-width: 35.5em)', // 568px 
                    md: 'screen and (min-width: 48em)',   // 768px 
                    lg: 'screen and (min-width: 64em)',   // 1024px 
                    xl: 'screen and (min-width: 80em)'    // 1280px 
                },
                // selectorPrefix: '.col-'
            }
        }
    }
});

grunt.loadNpmTasks('grunt-pure-grids');

grunt.registerTask('default', ['pure_grids']);