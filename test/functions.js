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