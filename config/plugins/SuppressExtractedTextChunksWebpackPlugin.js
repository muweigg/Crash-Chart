
module.exports = class SuppressExtractedTextChunksWebpackPlugin {

    constructor () {
        this.plugin = { name: 'SuppressExtractedTextChunksWebpackPlugin' };
    }

    apply (compiler) {
        compiler.hooks.compilation.tap(this.plugin, this.applyCompilation.bind(this));
    }

    applyCompilation (compilation) {
        const cssOnlyChunks = [];
        const entryPoints = compilation.options.entry;

        for (let entryPoint of Object.keys(entryPoints)) {
            if (entryPoints[entryPoint].every((el) =>
                el.match(/\.(css|scss|sass|less|styl|html)$/))) {
                cssOnlyChunks.push(entryPoint);
            }
        }

        compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync(this.plugin, (htmlPluginData, callback) => {
            const filterFn = (tag) =>
              !(tag.tagName === 'script' && (!tag.attributes.src || tag.attributes.src.match(/\.css$/)));
            htmlPluginData.head = htmlPluginData.head.filter(filterFn);
            htmlPluginData.body = htmlPluginData.body.filter(filterFn);
            if (callback) {
                return callback(null, htmlPluginData);
            } else {
                return Promise.resolve(htmlPluginData);
            }
        });

        compilation.hooks.afterSeal.tapAsync(this.plugin, (callback) => {
            compilation.chunks
                .filter((chunk) => cssOnlyChunks.indexOf(chunk.name) !== -1)
                .forEach((chunk) => {
                    let newFiles = [];
                    chunk.files.forEach((file) => {
                        if (file.match(/\.js(\.map)?$/)) {
                            delete compilation.assets[file];
                        } else {
                            newFiles.push(file);
                        }
                    });
                    chunk.files = newFiles;
                });
            callback();
        });
    }
}