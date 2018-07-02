const utils = require('loader-utils');
const fs = require('fs');
const path = require('path');
const nunjucks = require('nunjucks');

const NunjucksLoader = nunjucks.Loader.extend({
    //Based off of the Nunjucks 'FileSystemLoader' 

    init: function (searchPaths, sourceFoundCallback) {
        this.sourceFoundCallback = sourceFoundCallback;
        if (searchPaths) {
            searchPaths = Array.isArray(searchPaths) ? searchPaths : [searchPaths];
            // For windows, convert to forward slashes
            this.searchPaths = searchPaths.map(path.normalize);
        } else {
            this.searchPaths = ['.'];
        }
    },

    getSource: function (name) {
        let fullpath = null;
        let paths = this.searchPaths;

        for (let i = 0; i < paths.length; i++) {
            let basePath = path.resolve(paths[i]);
            let p = path.resolve(paths[i], name);

            // Only allow the current directory and anything
            // underneath it to be searched
            if (p.indexOf(basePath) === 0 && fs.existsSync(p)) {
                fullpath = p;
                break;
            }
        }

        if (!fullpath) {
            return null;
        }

        this.sourceFoundCallback(fullpath);

        return {
            src: fs.readFileSync(fullpath, 'utf-8'),
            path: fullpath,
            noCache: this.noCache
        };
    }
});

module.exports = function (content) {
    this.cacheable();

    const callback = this.async();
    const opt = utils.getOptions(this);

    const nunjucksSearchPaths = opt.searchPaths;
    const nunjucksContext = opt.context;
    const nunjucksOptions = opt.options;

    const loader = new NunjucksLoader(nunjucksSearchPaths, function (path) {
        this.addDependency(path);
    }.bind(this));

    const nunjEnv = new nunjucks.Environment(loader, nunjucksOptions);
    nunjucks.configure(null, {
        watch: false
    });

    const template = nunjucks.compile(content, nunjEnv);
    html = template.render(nunjucksContext);

    callback(null, html);
};