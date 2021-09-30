const { declare } = require('@babel/helper-plugin-utils')
const { types: t } = require('@babel/core')

const scriptLocation = 'babel-plugin-open-source/script.js'

module.exports = declare(api => {
  api.assertVersion(7)

  const visitor = {
    Program: {
      enter: (_, state) => {
        state.file.set('hasJSX', false);
      },
      exit: (path, state) => {
        // only add import statement to files that have JSX

        // bonus TODO: would be nice if we only add this once for each entry point
        // but we don't have that information here
        if (!state.file.get('hasJSX')) return;

        const declaration = t.importDeclaration(
          [],
          t.stringLiteral(scriptLocation)
        );

        path.node.body.unshift(declaration);
      },
    },
    JSXOpeningElement(path, state) {
      if (process.env.NODE_ENV !== 'development') return

      const location = path.container.openingElement.loc

      // the element was generated and doesn't have location information
      if (!location) return

      state.file.set('hasJSX', true);

      if (path.container.openingElement.name.name === 'Fragment') return

      const sourceData = JSON.stringify({
        filename: state.filename,
        start: location.start.line,
        end: location.end.line
      })

      if (state.opts.reactNativeWeb) {
        const dataSetAttr = path.container.openingElement.attributes.find(
          (attr) => {
            return attr.name && attr.name.name === "dataSet";
          }
        );
        const dataSetProperty = t.objectProperty(
          t.identifier("source"),
          t.stringLiteral(sourceData)
        );

        if (dataSetAttr && t.isJSXExpressionContainer(dataSetAttr.value)) {
          // dataSet={{x: a}}
          if (t.isObjectExpression(dataSetAttr.value.expression)) {
            dataSetAttr.value.expression.properties.push(dataSetProperty);
          }
          // dataSet={x}
          else if (t.isIdentifier(dataSetAttr.value.expression)) {
            dataSetAttr.value.expression = t.objectExpression([
              t.spreadElement(dataSetAttr.value.expression),
              dataSetProperty,
            ]);
          }
        }
      } else {
        path.container.openingElement.attributes.push(
          t.jsxAttribute(
            t.jsxIdentifier('data-source'),
            t.stringLiteral(sourceData)
          )
        )
      }
    }
  }

  return {
    name: 'babel-plugin-open-source',
    visitor,
  }
})
