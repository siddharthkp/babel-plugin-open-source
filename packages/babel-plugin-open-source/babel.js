const { declare } = require('@babel/helper-plugin-utils')
const { types: t } = require('@babel/core')

const scriptLocation = 'babel-plugin-open-source/script.js'

module.exports = declare(api => {
  api.assertVersion(7)

  const visitor = {
    Program: {
      exit: ({ node }) => {
        const declaration = t.importDeclaration(
          [],
          t.stringLiteral(scriptLocation)
        );

        node.body.unshift(declaration);
      }
    },
    JSXOpeningElement(path, state) {
      if (process.env.NODE_ENV !== 'development') return

      const location = path.container.openingElement.loc

      // the element was generated and doesn't have location information
      if (!location) return

      const sourceData = JSON.stringify({
        filename: state.filename,
        start: location.start.line,
        end: location.end.line
      })

      path.container.openingElement.attributes.push(
        t.jsxAttribute(
          t.jsxIdentifier('data-source'),
          t.stringLiteral(sourceData)
        )
      )
    }
  }

  return {
    name: 'babel-plugin-open-source',
    visitor
  }
})

