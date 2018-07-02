const helpers = require('./helpers');
const SpritesmithPlugin = require('webpack-spritesmith');

function getConfig (name) {
    return new SpritesmithPlugin({
        src: {
            cwd: helpers.root(`src/sprites/${name}`),
            glob: '**/*.png'
        },
        target: {
            image: helpers.root(`src/assets/images/${name}.png`),
            css: helpers.root(`src/css/common/_/_${name}.scss`)
        },
        apiOptions: {
            cssImageRef: `../../assets/images/${name}.png`
        },
        spritesmithOptions: {
            padding: 10,
            algorithm: 'top-down',
            algorithmOpts: { sort: true },
            exportOpts: { quality: 100 }
        }
    })
}

module.exports = [
    getConfig('icons')
]

