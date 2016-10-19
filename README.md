# RhythmMeister PostCSS

How to use?

Add the plugin to grunt or gulp like you normally would with a postcss plugin.
Give a settings like the following to it:

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

You can use font-preset: paragraphs;
This will set the line height, all the font properties and fix the top padding so the text is put on the vertical grid.

If you can add a border to the text it is subtracted from the padding top.
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

### TODO

* Write tests
* Make long hand border notation work
* Clean up repo
* Register postcss plugin
* Use in a project
* Use on http://rhythmmeister.com/