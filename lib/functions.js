import DataURI from 'datauri/old/module.js'
import postcss from 'postcss'

const functions = {
  getFontPreset: function (localOptions, name) {
    return localOptions.presets && localOptions.presets[name]
  },

  roundToNumber: function (valueToRound, roundTo) {
    return Math.round(valueToRound / roundTo) * roundTo
  },

  ceilToNumber: function (valueToCeil, ceilTo) {
    return Math.ceil(valueToCeil / ceilTo) * ceilTo
  },

  getPixelValueFromCssProperty: function (properties) {
    let width = 0
    const propertiesSplit = properties.split(' ')

    propertiesSplit.forEach((property) => {
      if (parseInt(property)) {
        if (width) {
          throw new Error(
            'This function does not know how to deal with multiple pixel values in a css property value.'
          )
        }
        width = parseInt(property)
      }
    })

    return width
  },

  applyRs: function (declaration, localDocumentRowSize) {
    if (declaration.value.indexOf('rs') !== -1) {
      const regexp = new RegExp('(\\d*\\.?\\d+)rs', 'gi')

      declaration.value = declaration.value.replace(regexp, function ($1) {
        return parseFloat($1) * localDocumentRowSize + 'px'
      })
    }
  },

  applyFontProperties: function (rule, declaration, fontPreset, localDocumentRowSize) {
    const propertiesToSkip = ['rows', 'base-line-percentage']

    Object.keys(fontPreset).forEach((property) => {
      if (propertiesToSkip.indexOf(property) === -1) {
        rule.insertAfter(declaration, postcss.parse(property + ': ' + fontPreset[property]))
      }
    })

    rule.insertAfter(
      declaration,
      postcss.parse('line-height: ' + localDocumentRowSize * fontPreset['rows'] + 'px')
    )
  },

  calculateTopCorrection: function (fontPreset, localDocumentRowSize) {
    const initialFontBase =
      (localDocumentRowSize * fontPreset['rows']) / 2 +
      (parseFloat(fontPreset['base-line-percentage']) - 0.5) * parseInt(fontPreset['font-size'])
    const wantedFontSize = functions.roundToNumber(initialFontBase, localDocumentRowSize)
    let topCorrection = wantedFontSize - initialFontBase

    if (topCorrection < localDocumentRowSize) {
      topCorrection = topCorrection + localDocumentRowSize
    }

    return topCorrection
  },

  subtractBorder: function (rule, paddingCorrection, localDocumentRowSize, type) {
    rule.walkDecls(function (possibleBorder) {
      if (possibleBorder.prop == 'border') {
        const allBorderWidth = functions.getPixelValueFromCssProperty(possibleBorder.value)
        if (allBorderWidth) {
          paddingCorrection = paddingCorrection - allBorderWidth
        }
      }

      if (possibleBorder.prop == 'border-' + type) {
        const borderTopWidth = functions.getPixelValueFromCssProperty(possibleBorder.value)
        if (borderTopWidth) {
          paddingCorrection = paddingCorrection - borderTopWidth
        }
      }
    })

    if (paddingCorrection < 0) {
      paddingCorrection = paddingCorrection + localDocumentRowSize
    }

    return paddingCorrection
  },

  subtractBorderTop: function (rule, paddingTopCorrection, localDocumentRowSize) {
    return functions.subtractBorder(rule, paddingTopCorrection, localDocumentRowSize, 'top')
  },

  subtractBorderBottom: function (rule, paddingBottomCorrection, localDocumentRowSize) {
    return functions.subtractBorder(rule, paddingBottomCorrection, localDocumentRowSize, 'bottom')
  },

  paddingOrMarginToLongHand: function (value) {
    const valueSplit = value.split(' ')

    if (valueSplit.length == 1) {
      return {
        top: value,
        right: value,
        bottom: value,
        left: value,
      }
    }

    if (valueSplit.length == 2) {
      return {
        top: valueSplit[0],
        right: valueSplit[1],
        bottom: valueSplit[0],
        left: valueSplit[1],
      }
    }

    if (valueSplit.length == 3) {
      return {
        top: valueSplit[0],
        right: valueSplit[1],
        bottom: valueSplit[2],
        left: valueSplit[1],
      }
    }

    if (valueSplit.length == 4) {
      return {
        top: valueSplit[0],
        right: valueSplit[1],
        bottom: valueSplit[2],
        left: valueSplit[3],
      }
    }

    throw new Error('Could not parse')
  },

  fixPadding: function (rule, declaration, paddingTopCorrection, paddingBottomCorrection) {
    let paddingLongHand = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    }

    rule.walkDecls(function (possiblePadding) {
      if (possiblePadding.prop == 'padding') {
        paddingLongHand = functions.paddingOrMarginToLongHand(possiblePadding.value)
        possiblePadding.remove()
      }

      if (possiblePadding.prop == 'padding-top') {
        paddingLongHand.top = parseInt(possiblePadding.value)
        possiblePadding.remove()
      }

      if (possiblePadding.prop == 'padding-bottom') {
        paddingLongHand.bottom = parseInt(possiblePadding.value)
        possiblePadding.remove()
      }
    })

    paddingTopCorrection = parseInt(paddingLongHand.top.toString()) + paddingTopCorrection
    paddingBottomCorrection = parseInt(paddingLongHand.bottom.toString()) + paddingBottomCorrection

    if (paddingTopCorrection) {
      rule.insertAfter(declaration, postcss.parse('padding-top: ' + paddingTopCorrection + 'px'))
    }

    if (paddingBottomCorrection) {
      rule.insertAfter(
        declaration,
        postcss.parse('padding-bottom: ' + paddingBottomCorrection + 'px')
      )
    }

    if (paddingLongHand.left) {
      rule.insertAfter(declaration, postcss.parse('padding-left: ' + paddingLongHand.left))
    }

    if (paddingLongHand.right) {
      rule.insertAfter(declaration, postcss.parse('padding-right: ' + paddingLongHand.right))
    }
  },

  applyGridHelper: function (rule, declaration, localDocumentRowSize) {
    if (declaration.prop == 'vertical-rhythm-grid') {
      const properties = declaration.value.split(' ')

      const firstRowOddColor = properties[0]
      const firstRowEvenColor = properties[1]

      const otherRowOddColor = properties[2]
      const otherRowEvenColor = properties[3]

      const horizontalWidth = properties[4]
      const alternation = properties[5]

      const oneLineWidth = parseInt(horizontalWidth)
      const svgWidth = oneLineWidth * 2
      const svgHeight = alternation * localDocumentRowSize

      const svgStart =
        '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' +
        svgWidth +
        '" height="' +
        svgHeight +
        '" viewBox="0 0 ' +
        svgWidth +
        ' ' +
        svgHeight +
        '">'

      let svgMiddle = ''

      let i

      for (i = 0; i < alternation; i++) {
        const rowOddColor = i == 0 ? firstRowOddColor : otherRowOddColor
        const rowEvenColor = i == 0 ? firstRowEvenColor : otherRowEvenColor
        const y = i * localDocumentRowSize

        svgMiddle +=
          '<rect width="' +
          oneLineWidth +
          '" height="1" x="0" y="' +
          y +
          '" fill="' +
          rowOddColor +
          '"/><rect width="' +
          oneLineWidth +
          '" height="1" x="' +
          oneLineWidth +
          '" y="' +
          y +
          '" fill="' +
          rowEvenColor +
          '"/>'
      }

      const svgEnd = '</svg>'

      const svg = svgStart + svgMiddle + svgEnd

      const datauri = new DataURI()
      datauri.format('.svg', svg)

      declaration.remove()

      rule.insertAfter(
        declaration,
        postcss.parse('background-image:  url("' + datauri.content + '")')
      )
    }
  },
}

export default functions
