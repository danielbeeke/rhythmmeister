var postcss = require('postcss');
var functions = require('./functions.js');

module.exports = {
    processor: postcss.plugin('rhythmmeister', function (options) {

        options = options || {};
        var documentRowSize = parseInt(options['document-row-size']);

        return function (css) {
            css.walkRules(function (rule) {
                rule.walkDecls(function (declaration, i) {
                    functions.applyRs(declaration, documentRowSize);
                    functions.applyGridHelper(rule, declaration, documentRowSize);
                });
            });

            css.walkRules(function (rule) {
                rule.walkDecls(function (declaration, i) {
                    if (declaration.prop == 'font-preset' && functions.getFontPreset(options, declaration.value)) {
                        var fontPreset = functions.getFontPreset(options, declaration.value);
                        functions.applyFontProperties(rule, declaration, fontPreset, documentRowSize);

                        var paddingTopCorrection = functions.calculateTopCorrection(fontPreset, documentRowSize);
                        var paddingBottomCorrection = documentRowSize - paddingTopCorrection;

                        paddingTopCorrection = functions.subtractBorderTop(rule, paddingTopCorrection, documentRowSize);
                        paddingBottomCorrection = functions.subtractBorderBottom(rule, paddingBottomCorrection, documentRowSize);

                        functions.fixPadding(rule, declaration, Math.round(paddingTopCorrection), Math.round(paddingBottomCorrection));

                        declaration.remove();
                    }
                })
            })
        }
    }),

    load: function (moduleName) {
        functions.purgeCache(moduleName);
        return require(moduleName);
    }
}