var postcss = require('postcss');
var DataURI = require('datauri');

var functions = {
    getFontPreset: function (localOptions, name) {
        return localOptions.presets && localOptions.presets[name];
    },

    roundToNumber: function (valueToRound, roundTo) {
        return Math.round(valueToRound / roundTo) * roundTo;
    },

    ceilToNumber: function (valueToCeil, ceilTo) {
        return Math.ceil(valueToCeil / ceilTo) * ceilTo;
    },

    getBorderWidth: function (properties) {
        var width = false;
        var propertiesSplit = properties.split(' ');

        propertiesSplit.forEach((property) => {
            if (parseInt(property)) {
                width = parseInt(property);
            }
        });

        return width;
    },

    applyRs: function (declaration, localDocumentRowSize) {
        if (declaration.value.indexOf('rs') !== -1) {
            var regexp = new RegExp('(\\d*\\.?\\d+)rs', 'gi');

            declaration.value = declaration.value.replace(regexp, function ($1) {
                return parseFloat($1) * localDocumentRowSize + 'px';
            });
        }
    },

    applyFontProperties: function (rule, declaration, fontPreset, localDocumentRowSize) {
        var propertiesToSkip = ['rows', 'base-line-percentage'];

        Object.keys(fontPreset).forEach((property) => {
            if (propertiesToSkip.indexOf(property) === -1) {
                rule.insertAfter(declaration, postcss.parse(property + ': ' + fontPreset[property]));
            }
        });

        rule.insertAfter(declaration, postcss.parse('line-height: ' + localDocumentRowSize * fontPreset['rows'] + 'px'));
    },

    calculateTopCorrection: function (fontPreset, localDocumentRowSize) {
        var initialFontBase = ((localDocumentRowSize * fontPreset['rows']) / 2) + (parseFloat(fontPreset['base-line-percentage']) - 0.5) * parseInt(fontPreset['font-size']);
        var wantedFontSize = functions.roundToNumber(initialFontBase, localDocumentRowSize);
        var topCorrection = wantedFontSize - initialFontBase;

        if (topCorrection < localDocumentRowSize) {
            topCorrection = topCorrection + localDocumentRowSize;
        }

        return topCorrection;
    },

    subtractBorderTop: function (rule, paddingTopCorrection, localDocumentRowSize) {
        rule.walkDecls(function (possibleBorder) {
            if (possibleBorder.prop == 'border') {
                var allBorderWidth = functions.getBorderWidth(possibleBorder.value);
                if (allBorderWidth) {
                    paddingTopCorrection = paddingTopCorrection - allBorderWidth;
                }
            }

            if (possibleBorder.prop == 'border-top') {
                var borderTopWidth = functions.getBorderWidth(possibleBorder.value);
                if (borderTopWidth) {
                    paddingTopCorrection = paddingTopCorrection - borderTopWidth;
                }
            }
        });

        if (paddingTopCorrection < 0) {
            paddingTopCorrection = paddingTopCorrection + localDocumentRowSize;
        }

        return paddingTopCorrection;
    },

    subtractBorderBottom: function (rule, paddingBottomCorrection, localDocumentRowSize) {
        rule.walkDecls(function (possibleBorder) {
            if (possibleBorder.prop == 'border') {
                var allBorderWidth = functions.getBorderWidth(possibleBorder.value);
                if (allBorderWidth) {
                    paddingBottomCorrection = paddingBottomCorrection - allBorderWidth;
                }
            }

            if (possibleBorder.prop == 'border-bottom') {
                var borderBottomWidth = functions.getBorderWidth(possibleBorder.value);
                if (borderBottomWidth) {
                    paddingBottomCorrection = paddingBottomCorrection - borderBottomWidth;
                }
            }
        });

        if (paddingBottomCorrection < 0) {
            paddingBottomCorrection = paddingBottomCorrection + localDocumentRowSize;
        }

        return paddingBottomCorrection;
    },

    fixPadding: function (rule, declaration, paddingTopCorrection, paddingBottomCorrection) {
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

        if (paddingTopCorrection < previousPaddingTop) {
            paddingTopCorrection = functions.ceilToNumber(documentRowSize, previousPaddingTop) + paddingTopCorrection;
        }

        if (paddingBottomCorrection < previousPaddingBottom) {
            paddingBottomCorrection = functions.ceilToNumber(documentRowSize, previousPaddingBottom) + paddingBottomCorrection;
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
    },

    applyGridHelper: function (rule, declaration, localDocumentRowSize) {
        if (declaration.prop == 'vertical-rhythm-grid') {
            var properties = declaration.value.split(' ');

            var firstRowOddColor = properties[0];
            var firstRowEvenColor = properties[1];

            var otherRowOddColor = properties[2];
            var otherRowEvenColor = properties[3];

            var horizontalWidth = properties[4];
            var alternation = properties[5];

            var oneLineWidth = parseInt(horizontalWidth);
            var svgWidth = oneLineWidth * 2;
            var svgHeight = alternation * localDocumentRowSize;


            var svgStart = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + svgWidth  + '" height="' + svgHeight + '" viewBox="0 0 ' + svgWidth  + ' ' + svgHeight + '">';

            var svgMiddle = '';

            for (i = 0; i < alternation; i++) {
                var rowOddColor = i == 0 ? firstRowOddColor : otherRowOddColor;
                var rowEvenColor = i == 0 ? firstRowEvenColor : otherRowEvenColor;
                var y = i * localDocumentRowSize;

                svgMiddle += '<rect width="' + oneLineWidth + '" height="1" x="0" y="' + y + '" fill="' + rowOddColor + '"/><rect width="' + oneLineWidth + '" height="1" x="' + oneLineWidth + '" y="' + y + '" fill="' + rowEvenColor + '"/>';
            }

            var svgEnd = '</svg>';

            var svg = svgStart + svgMiddle + svgEnd;

            var datauri = new DataURI();
            datauri.format('.svg', svg);

            declaration.remove();

            rule.insertAfter(declaration, postcss.parse('background-image:  url("' + datauri.content + '")'));
        }
    }
};

module.exports = functions;