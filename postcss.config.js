const autoprefixer = require('autoprefixer');
module.exports = {
    plugins: [
        autoprefixer({ browsers: [
            'ie >= 9', 'firefox >= 28', 'chrome >= 21'
        ] })
    ]
}