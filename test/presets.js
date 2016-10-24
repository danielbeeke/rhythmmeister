import test from 'ava';
import fontPresets from '../font-presets';
import unit from 'parse-unit';

test('config must have a document-row-size.', t => {
    if (fontPresets['document-row-size']) {
        var parsedUnit = unit(fontPresets['document-row-size']);

        if (isNaN(parseInt(parsedUnit[0]))) {
            t.fail();
        }

        if (parseInt(parsedUnit[0]) > 0) {
            t.pass();
        }
    }
});

test('config must have a document-row-size set in pixels.', t => {
    if (fontPresets['document-row-size']) {
        var parsedUnit = unit(fontPresets['document-row-size']);
        t.is(parsedUnit[1], 'px');
    }
});

test('config must have at least one preset.', t => {
    if (fontPresets['presets'].length > 0) {
        t.pass();
    }
});

test('each preset contains font size, row, font-family, font-weight and a base-line-percentage.', t => {
    if (fontPresets['presets']) {
        Object.keys(fontPresets['presets']).forEach(function(presetName) {
            var preset = fontPresets['presets'][presetName];

            if (
                typeof preset['font-family'] === 'undefined' ||
                typeof preset['rows'] === 'undefined' ||
                typeof preset['font-size'] === 'undefined' ||
                typeof preset['base-line-percentage'] === 'undefined'
            ) {
                t.fail();
            }
        });
    }
});

test('rows should be unitless.', t => {
    if (fontPresets['presets']) {
        Object.keys(fontPresets['presets']).forEach(function(presetName) {
            var preset = fontPresets['presets'][presetName];
            t.is(unit(preset['rows'])[1], '');
        });
    }
});

test('font-sizes should be in pixels.', t => {
    if (fontPresets['presets']) {
        Object.keys(fontPresets['presets']).forEach(function(presetName) {
            var preset = fontPresets['presets'][presetName];
            t.is(unit(preset['font-size'])[1], 'px');
        });
    }
});

test('base-line-percentages should be between 0.5 and 1.', t => {
    if (fontPresets['presets']) {
        Object.keys(fontPresets['presets']).forEach(function(presetName) {
            var preset = fontPresets['presets'][presetName];
                if (preset['base-line-percentage'] > 0.5 && preset['base-line-percentage'] < 1) {
                    t.pass();
                }
        });
    }
});
