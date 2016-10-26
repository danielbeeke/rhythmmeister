import test from 'ava';
import functions from '../functions';
import fontPresets from '../font-presets';
import postcss from 'postcss';

test('getFontPreset should return a preset by name.', t => {
    var preset = functions.getFontPreset(fontPresets, 'paragraphs');
    t.is(preset, fontPresets['presets']['paragraphs']);
});

test('roundToNumber should round a number to another number.', t => {
    var items = [
        // Input, RoundTo, Proof.
        [23, 20, 20],
        [37, 20, 40],
        [17, 4, 16],
        [19, 4, 20]
    ];

    items.forEach(function (item) {
        t.is(functions.roundToNumber(item[0], item[1]), item[2]);
    })
});

test('ceilToNumber should ceil a number to another number.', t => {
    var items = [
        // Input, RoundTo, Proof.
        [23, 20, 40],
        [37, 20, 40],
        [17, 4, 20],
        [19, 4, 20]
    ];

    items.forEach(function (item) {
        t.is(functions.ceilToNumber(item[0], item[1]), item[2]);
    })
});

test('getPixelValueFromCssProperty should get the pixel value from a border', t => {
    var parsed = functions.getPixelValueFromCssProperty('3px solid red');
    t.is(parsed, 3);
});

test('getPixelValueFromCssProperty should throw when getting multiple pixel values', t => {
    t.throws(function () {
        return functions.getPixelValueFromCssProperty('10px 3px');
    }, 'This function does not know how to deal with multiple pixel values in a css property value.');
});

test('applyRs should replace rs with the selected row size for height.', t => {
    var rule = postcss.parse(`div {
        height: 4rs;
    }`);

    var declaration = rule.first.first;

    functions.applyRs(declaration, 10);
    t.is(declaration.value, '40px');
});


test('applyRs should replace rs with the selected row size for padding.', t => {
    var rule = postcss.parse(`div {
        padding: 1px 2rs 3px 4rs;
    }`);

    var declaration = rule.first.first;

    functions.applyRs(declaration, 10);
    t.is(declaration.value, '1px 20px 3px 40px');
});

test('applyRs should replace rs with the selected row size inside calc.', t => {
    var rule = postcss.parse(`div {
        padding: calc(2rs * 4rs);
    }`);

    var declaration = rule.first.first;

    functions.applyRs(declaration, 5);
    t.is(declaration.value, 'calc(10px * 20px)');
});

test('applyFontProperties should append font properties.', t => {
    var parsed = postcss.parse(`div { 
        padding-top: 20px;
        font-preset: paragraphs; 
        color: red;
    }`);

    var rule = parsed.first;
    var declaration = rule.first.next();
    var fontPreset = functions.getFontPreset(fontPresets, declaration.value);

    functions.applyFontProperties(rule, declaration, fontPreset, 10);
    declaration.remove();

    t.is(rule.toString(), `div { 
        padding-top: 20px;
        line-height: 30px;
        color: blue;
        font-style: normal;
        font-size: 16px;
        font-weight: 400;
        font-family: 'Open Sans', serif; 
        color: red;
    }`);
});

test('calculateTopCorrection should get a float value to put at the padding-top', t => {
    var fontPreset = functions.getFontPreset(fontPresets, 'paragraphs');
    var paddingTopCorrection = functions.calculateTopCorrection(fontPreset, 10);
    t.is(paddingTopCorrection, 9.079999999999998);
});

test('subtractBorderTop should remove the border-top from the padding-top', t => {
    var oldPaddingTop = 13;
    var localRowsSize = 10;

    var parsed = postcss.parse(`div { 
        border-top: 2px solid red;
        font-preset: paragraphs; 
        color: red;
    }`);

    var rule = parsed.first;
    var declaration = rule.first.next();
    var fontPreset = functions.getFontPreset(fontPresets, declaration.value);

    functions.applyFontProperties(rule, declaration, fontPreset, localRowsSize);
    var newPaddingTop = functions.subtractBorderTop(rule, oldPaddingTop, localRowsSize);

    t.is(newPaddingTop, 11);
});

test('subtractBorderBottom should remove the border from the padding-bottom', t => {
    var oldPaddingBottom = 13;
    var localRowsSize = 10;

    var parsed = postcss.parse(`div { 
        border: 2px solid red;
        font-preset: paragraphs; 
        color: red;
    }`);

    var rule = parsed.first;
    var declaration = rule.first.next();
    var fontPreset = functions.getFontPreset(fontPresets, declaration.value);

    functions.applyFontProperties(rule, declaration, fontPreset, localRowsSize);
    var newPaddingBottom = functions.subtractBorderBottom(rule, oldPaddingBottom, localRowsSize);

    t.is(newPaddingBottom, 11);
});

test('applyGridHelper only a regression test', t => {
    var parsed = postcss.parse(`div { vertical-rhythm-grid: #000000 #ffffff #bbb #ffffff 1px 4; }`);

    var rule = parsed.first;
    var declaration = rule.first;
    var localRowsSize = 10;

    functions.applyGridHelper(rule, declaration, localRowsSize);

    t.is(rule.toString(), `div {
    background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjIiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyIDQwIj48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4PSIwIiB5PSIwIiBmaWxsPSIjMDAwMDAwIi8+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgeD0iMSIgeT0iMCIgZmlsbD0iI2ZmZmZmZiIvPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIHg9IjAiIHk9IjEwIiBmaWxsPSIjYmJiIi8+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgeD0iMSIgeT0iMTAiIGZpbGw9IiNmZmZmZmYiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4PSIwIiB5PSIyMCIgZmlsbD0iI2JiYiIvPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIHg9IjEiIHk9IjIwIiBmaWxsPSIjZmZmZmZmIi8+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgeD0iMCIgeT0iMzAiIGZpbGw9IiNiYmIiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4PSIxIiB5PSIzMCIgZmlsbD0iI2ZmZmZmZiIvPjwvc3ZnPg=="); }`);
});

test('paddingOrMarginToLongHand one value', t => {
    var longHand = functions.paddingOrMarginToLongHand('10px');

    t.deepEqual(longHand, { top: '10px', right: '10px', bottom: '10px', left: '10px' });
});

test('paddingOrMarginToLongHand two values', t => {
    var longHand = functions.paddingOrMarginToLongHand('1px 2px');

    t.deepEqual(longHand, { top: '1px', right: '2px', bottom: '1px', left: '2px' });
});

test('paddingOrMarginToLongHand three values', t => {
    var longHand = functions.paddingOrMarginToLongHand('1px 2px 3px');

    t.deepEqual(longHand, { top: '1px', right: '2px', bottom: '3px', left: '2px' });
});

test('paddingOrMarginToLongHand four values', t => {
    var longHand = functions.paddingOrMarginToLongHand('1px 2px 3px 4px');

    t.deepEqual(longHand, { top: '1px', right: '2px', bottom: '3px', left: '4px' });
});

test('fixPadding bottom and top', t => {
    var parsed = postcss.parse(`div { 
        border: 2px solid red;
        font-preset: paragraphs; 
        color: red;
    }`);

    var rule = parsed.first;
    var declaration = rule.first.next();

    functions.fixPadding (rule, declaration, 3, 4);

    t.is(rule.toString(), `div { 
        border: 2px solid red;
        font-preset: paragraphs;
        padding-bottom: 4px;
        padding-top: 3px; 
        color: red;
    }`);
});