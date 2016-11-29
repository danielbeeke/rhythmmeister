# RhythmMeister

This helps creating a vertical grid for texts on the almighty interwebs.
Check out http://rhythmmeister.com/ for a visible explanation and live preview.

### Install
```
npm install rhythmmeister --save
```

####gulpfile.js
```
var rhythmmeister = require('rhythmmeister');

gulp.task('postcss', function() {
  // This enables reloading the presets json without caching.
  var fontPresets = rhythmmeister.load(path.resolve('./font-presets'));

  var processors = [
        rhythmmeister.processor(fontPresets)
    ];

    gulp.src('css/**/*.css')
        .pipe(postcss(processors))
        .pipe(gulp.dest('css'))
});

// Reload the css on font-preset change.
gulp.watch('font-presets.json', function () {
   gulp.run('postcss');
});

```

### How to use?

Give a settings JSON file like the following to it:

```
{
  "document-row-size": "12px",
  "presets": {
    "paragraphs": {
      "font-family": "'Abhaya Libre', serif",
      "rows": 3,
      "font-weight": 300,
      "font-size": "16px",
      "base-line-percentage": 0.88
    }
  }
}
```

Now you can use font-preset: paragraphs; in your css.
This will set the line height, all the font properties and fix the top padding so the text is put on the vertical grid.

If you add a border to the text it is subtracted from the padding top.
Also if after the subtraction the padding is negative it is fixed.

Now you can use the unit __rs__. This is row size * given value. 

```
body {
    border: 4px solid red;
    padding-top: 1rs;
    border-top: 1px solid red;
    font-preset: paragraphs;
    height: 3rs;
}
```

### Tests
RhythmMeister is tested with [ava](https://github.com/avajs/ava).
Run 'gulp' to test.