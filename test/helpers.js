import test from 'ava';
import fontPresets from '../font-presets';
import unit from 'parse-unit';

test('config must have at least one preset.', t => {
    if (fontPresets['presets'].length > 0) {
        t.pass();
    }
});