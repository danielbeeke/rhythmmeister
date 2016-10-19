var postcss = require('postcss');

module.exports = postcss.plugin('rhythmmeister', function (options) {

    options = options || {};

    var getFontPreset = function (name) {
        return options.presets && options.presets[name];
    };

    var roundToNumber = function (valueToRound, roundTo) {
        return Math.round(valueToRound / roundTo) * roundTo;
    };

    var ceilToNumber = function (valueToCeil, ceilTo) {
        return Math.ceil(valueToCeil / ceilTo) * ceilTo;
    };

    var documentRowSize = parseInt(options['document-row-size']);

    return function (css) {

        css.walkRules(function (rule) {
            rule.walkDecls(function (declaration, i) {
                if (declaration.value.indexOf('rs') !== -1) {
                    var regexp = new RegExp('(\\d*\\.?\\d+)rs', 'gi');

                    declaration.value = declaration.value.replace(regexp, function ($1) {
                        return parseFloat($1) * documentRowSize + 'px';
                    });
                }

                if (declaration.prop == 'font-preset' && getFontPreset(declaration.value)) {
                    var fontPreset = getFontPreset(declaration.value);

                    var propertiesToSet = ['font-family', 'font-size', 'font-weight', 'font-style', 'letter-spacing'];

                    propertiesToSet.forEach((property) => {
                        if (fontPreset[property]) {
                            rule.insertAfter(declaration, postcss.parse(property + ': ' + fontPreset[property]));
                        }
                    });

                    rule.insertAfter(declaration, postcss.parse('line-height: ' + documentRowSize * fontPreset['rows'] + 'px'));

                    var initialFontBase = ((documentRowSize * fontPreset['rows']) / 2) + (parseFloat(fontPreset['base-line-percentage']) - 0.5) * parseInt(fontPreset['font-size']);
                    var wantedFontSize = roundToNumber(initialFontBase, documentRowSize);
                    var paddingTopCorrection = wantedFontSize - initialFontBase;

                    if (paddingTopCorrection < 0) {
                        paddingTopCorrection = documentRowSize + paddingTopCorrection;
                    }

                    var paddingBottomCorrection = documentRowSize - paddingTopCorrection;

                    var previousPaddingTop = 0;
                    var previousPaddingBottom = 0;
                    var paddingLeft = 0;
                    var paddingRight = 0;

                    rule.walkDecls(function (possiblePadding) {
                        if (possiblePadding.prop == 'padding') {
                            var paddings = possiblePadding.value.split(' ');

                            if (paddings.length < 3) {
                                previousPaddingTop = parseInt(paddings[0]);
                                previousPaddingBottom = parseInt(paddings[0]);
                            }

                            else {
                                previousPaddingTop = parseInt(paddings[0]);
                                previousPaddingBottom = parseInt(paddings[2]);
                            }

                            if (paddings.length == 1) {
                                paddingLeft = paddings[0];
                                paddingRight = paddings[0];
                            }

                            else if (paddings.length > 1) {
                                paddingLeft = paddings[1];
                            }

                            else if (paddings.length > 3) {
                                paddingRight = paddings[3];
                            }
                            else {
                                paddingRight = paddings[1];
                            }

                            possiblePadding.remove();
                        }

                        if (possiblePadding.prop == 'padding-top') {
                            previousPaddingTop = parseInt(possiblePadding.value);
                            possiblePadding.remove();
                        }

                        if (possiblePadding.prop == 'padding-bottom') {
                            previousPaddingBottom = parseInt(possiblePadding.value);
                            possiblePadding.remove();
                        }
                    });

                    if (options['use existing padding as min padding']) {
                        if (paddingTopCorrection < previousPaddingTop) {
                            paddingTopCorrection = ceilToNumber(documentRowSize, previousPaddingTop) + paddingTopCorrection;
                        }

                        if (paddingBottomCorrection < previousPaddingBottom) {
                            paddingBottomCorrection = ceilToNumber(documentRowSize, previousPaddingBottom) + paddingBottomCorrection;
                        }
                    }

                    if (paddingTopCorrection) {
                        rule.insertAfter(declaration, postcss.parse('padding-top: ' + paddingTopCorrection + 'px'));
                    }

                    if (paddingBottomCorrection) {
                        rule.insertAfter(declaration, postcss.parse('padding-bottom: ' + paddingBottomCorrection + 'px'));
                    }

                    if (paddingLeft) {
                        rule.insertAfter(declaration, postcss.parse('padding-left: ' + paddingLeft));
                    }

                    if (paddingRight) {
                        rule.insertAfter(declaration, postcss.parse('padding-right: ' + paddingRight));
                    }

                    declaration.remove();
                }
            });
        });
    }
});