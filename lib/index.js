import functions from './functions.js'

const plugin = (options = {}) => ({
  postcssPlugin: 'postcss-rhythmmeister',
  Rule(rule) {
    options = options || {}
    const documentRowSize = parseInt(options['document-row-size'])

    rule.walkDecls(function (declaration, i) {
      functions.applyRs(declaration, documentRowSize)
      functions.applyGridHelper(rule, declaration, documentRowSize)
    })

    rule.walkDecls(function (declaration, i) {
      if (
        declaration.prop == 'font-preset' &&
        functions.getFontPreset(options, declaration.value)
      ) {
        const fontPreset = functions.getFontPreset(options, declaration.value)
        functions.applyFontProperties(rule, declaration, fontPreset, documentRowSize)

        let paddingTopCorrection = functions.calculateTopCorrection(fontPreset, documentRowSize)
        let paddingBottomCorrection = documentRowSize - paddingTopCorrection

        paddingTopCorrection = functions.subtractBorderTop(
          rule,
          paddingTopCorrection,
          documentRowSize
        )
        paddingBottomCorrection = functions.subtractBorderBottom(
          rule,
          paddingBottomCorrection,
          documentRowSize
        )

        functions.fixPadding(
          rule,
          declaration,
          Math.round(paddingTopCorrection),
          Math.round(paddingBottomCorrection)
        )

        declaration.remove()
      }
    })
  },
})

export default plugin
