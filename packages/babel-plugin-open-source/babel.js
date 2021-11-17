const { declare } = require('@babel/helper-plugin-utils')
const { types: t } = require('@babel/core')
const fs = require('fs');
const dotenv = require('dotenv')
const filePath = require('path')

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
      let url = null;
      let editor = state.opts?.editor?.toLowerCase() || 'vscode';

      // the element was generated and doesn't have location information
      if (!location) return

      try {
        if(state.opts.envPath) {
          editor = dotenv.parse(fs.readFileSync(filePath.resolve(process.cwd(),state.opts.envPath), 'utf8'))?.BABEL_OPEN_SOURCE_EDITOR;
        }
      }  catch (error) {
        console.error("ERROR in Babel Plugin Open Source", error)
      }

      state.file.set('hasJSX', true);

      if (path.container.openingElement.name.name === 'Fragment') return

      if(editor === 'sublime') {
        // https://macromates.com/blog/2007/the-textmate-url-scheme/
        // https://github.com/ljubadr/sublime-protocol-win
        url = `subl://open?url=file://${state.filename}&line=${location.start.line}`
      } else if (editor === 'phpstorm'){
        // https://github.com/siddharthkp/babel-plugin-open-source/issues/6#issue-999132767
        url = `phpstorm://open?file=${state.filename}&line=${location.start.line}`
      } else if (editor === 'atom') {
        // https://flight-manual.atom.io/hacking-atom/sections/handling-uris/#core-uris
        url = `atom://core/open/file?filename=${state.filename}&line=${location.start.line}`
      } else if (editor === 'vscode-insiders') {
        url = `vscode-insiders://file/${state.filename}:${location.start.line}`
      } else {
        url = `vscode://file/${state.filename}:${location.start.line}`
      }


      const sourceData = JSON.stringify({
        filename: state.filename,
        start: location.start.line,
        end: location.end.line,
        url: url,
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
    visitor,
  }
})
