/**
 * @author: MuWei
 */
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');
const HtmlPlugin = require('html-webpack-plugin');

const scan_js   = [helpers.root('src/js'), /\.ts$/i];
const scan_css  = [helpers.root('src/css'), /\.scss$/i];
const scan_html = [helpers.root('src/templates'), /\.html$/i];
const commonEntrys = {
    'js/common': [helpers.root('src/js/common/common.ts')],
    'js/CrashChart': [helpers.root('src/js/CrashChart.ts')]
};

let entriesDict = {};

function getFiles(dirPath = './', ext = /\.html$/i, result = {}) {
    const entires = fs.readdirSync(dirPath);
    for (let entry of entires) {
        const fullPath = path.join(dirPath, entry);
        const stats = fs.statSync(fullPath);
        if (stats && stats.isFile()) {
            if (ext.test(fullPath)) result[entry] = fullPath;
        } else if (stats && stats.isDirectory() && entry !== 'common') {
            getFiles(fullPath, ext, result);
        }
    }
    return result;
}

function getHTML () {
    const entires = {};
    const result = getFiles(...scan_html);

    for (let html in result) {
        const fullPath = result[html].replace(/\\+?/g, '/');
        const str = fullPath.match(/[\\/]templates[\\/]/)[0];
        const s = fullPath.indexOf(str) + str.length;
        const keyName = fullPath.substr(s);
        const key = keyName.substr(0, keyName.lastIndexOf('.'));
        entires[keyName] = [fullPath];
        entriesDict[`css/${key}`] = true;
        entriesDict[`js/${key}`] = true;
    }

    return entires;
}

function getJS () {
    let entires = {};
    const result = getFiles(...scan_js);

    for (let js in result) {
        const fullPath = result[js].replace(/\\+?/g, '/');
        const str = fullPath.match(/[\\/]js[\\/]/)[0];
        const s = fullPath.indexOf(str);
        const e = fullPath.lastIndexOf('.') - s;
        const keyName = fullPath.substr(s, e).substr(1);
        if (entriesDict[keyName])
            entires[keyName] = [fullPath];
    }

    return entires;
}

function getCSS () {
    const entires = {};
    const result = getFiles(...scan_css);

    for (let css in result) {
        const fullPath = result[css].replace(/\\+?/g, '/');
        const str = fullPath.match(/[\\/]css[\\/]/)[0];
        const s = fullPath.indexOf(str);
        const e = fullPath.lastIndexOf('.') - s;
        const keyName = fullPath.substr(s, e).substr(1);
        if (entriesDict[keyName])
            entires[keyName] = [fullPath];
    }

    return entires;
}

function getEntires () {
    const html = getHTML();
    const js   = getJS();
    const css  = getCSS();
    return {...js, ...css}
}

function getHTMLPlugin () {
    const plugins = [];
    const result = getHTML();

    for (let html in result) {
        const fullPath = result[html][0];
        const keyName = html.substr(0, html.lastIndexOf('.'));
        plugins.push( new HtmlPlugin({
            filename: html,
            template: fullPath,
            chunks: [
                'runtime',
                'vendors/vendors',
                'components/components',
                'js/common',
                'js/CrashChart',
                `css/${keyName}`,
                `js/${keyName}`,
            ],
            chunksSortMode: 'dependency',
            inject: 'body',
        }) );
    }

    return plugins;
}

exports.getEntires = getEntires;
exports.getHTMLPlugin = getHTMLPlugin;
exports.commonEntrys = commonEntrys;
