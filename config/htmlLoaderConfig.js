module.exports = {
    minimize: false,
    removeAttributeQuotes: false,
    caseSensitive: true,
    customAttrSurround: [
        [/#/, /(?:)/],
        [/\*/, /(?:)/],
        [/\[?\(?/, /(?:)/]
    ],
    customAttrAssign: [/\)?\]?=/],
    attrs: ['img:src', 'img:data-src'],
    interpolate: 'require'
}