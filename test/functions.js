import test from 'ava';
import functions from '../functions';
import fontPresets from '../font-presets';

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