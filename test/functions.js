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
        font-preset: paragraphs; 
        color: red;
    }`);
    var rule = parsed.first;

    var declaration = rule.first;
    var fontPreset = functions.getFontPreset(fontPresets, declaration.value);

    functions.applyFontProperties(rule, declaration, fontPreset, 10);
    declaration.remove();

    t.is(rule.toString(), `div { 
        line-height: 30px; 
        color: blue; 
        font-style: normal; 
        font-size: 16px; 
        font-weight: 400; 
        font-family: 'Open Sans', serif; 
        color: red;
    }`);
});
