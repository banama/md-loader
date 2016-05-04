"use strict";

var marked = require("marked");
var loaderUtils = require("loader-utils");
var assign = require("object-assign");
var highlight = require('./highlight.js')
var stripIndent = require('strip-indent');

marked.Renderer.prototype.code = function(code, lang, escaped) {
    // monkey patching
    // https://github.com/chjj/marked/blob/master/lib/marked.js#L764
    if (this.options.highlight) {
        var out = this.options.highlight(code, lang);
        if (out != null && out !== code) {
            escaped = true;
            code = out;
        }
    }
    return escaped ? code : escape(code, true)
};

// default option
module.exports = function (markdown) {
    // merge params and default config
    var query = loaderUtils.parseQuery(this.query);
    var configKey = query.config || "markdownLoader";
    var options = {
        renderer: new marked.Renderer(),
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false,
        highlight: function (code, lang) {
            return highlight(stripIndent(code), {
                lang: lang,
                gutter: false
            });
        }
    };

    var options = assign({}, options, query, this.options[configKey]);
    this.cacheable();
    marked.setOptions(options);
    return marked(markdown);
};
