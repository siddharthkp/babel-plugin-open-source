const { declare } = require('@babel/helper-plugin-utils');
const { types: t } = require('@babel/core');
const dotenv = require('dotenv');
const getEditorUrl = require('./editor-url.js');

const scriptLocation = 'babel-plugin-open-source/script.js';

// picks root directory's .env file
const dotenvConfig = dotenv.config();

module.exports = declare((api) => {
  api.assertVersion(7);

  const visitor = {
    Program: {
      enter: (_, state) => {
        state.file.set('hasJSX', false);

        const editorInOpts = state.opts && state.opts.editor ? state.opts.editor.toLowerCase() : 'vscode';
        let editor = process.env.NODE_ENV === 'production' ? 'github' : editorInOpts;
        const editorInENV = dotenvConfig && dotenvConfig.parsed && dotenvConfig.parsed.BABEL_OPEN_SOURCE_EDITOR;
        if (editorInENV) editor = editorInENV;

        state.file.set('editor', editor);

        if (process.env.NODE_ENV === 'development' || editor === 'github');
        else state.file.set('skip', true);
      },
      exit: (path, state) => {
        // only add import statement to files that have JSX

        // bonus TODO: would be nice if we only add this once for each entry point
        // but we don't have that information here
        if (!state.file.get('hasJSX')) return;

        const declaration = t.importDeclaration([], t.stringLiteral(scriptLocation));

        path.node.body.unshift(declaration);
      }
    },
    JSXOpeningElement(path, state) {
      if (state.file.get('skip')) return;

      const location = path.container.openingElement.loc;

      // the element was generated and doesn't have location information
      if (!location) return;

      state.file.set('hasJSX', true);

      const nameNode = path.container.openingElement.name;
      if (nameNode.name === 'Fragment') return;
      // use like: <React.Fragment>{...}</React.Fragment>
      if (
        nameNode.type === 'JSXMemberExpression' &&
        nameNode.object &&
        nameNode.object.name === 'React' &&
        nameNode.property &&
        nameNode.property.name === 'Fragment'
      ) {
        return;
      }

      const editor = state.file.get('editor');
      const url = getEditorUrl(editor, state.filename, location.start.line);

      const sourceData = JSON.stringify({ url });
      const sourceNode = t.jsxExpressionContainer(t.templateLiteral([t.templateElement({ raw: sourceData })], []));

      path.container.openingElement.attributes.push(t.jsxAttribute(t.jsxIdentifier('data-source'), sourceNode));
    }
  };

  return {
    name: 'babel-plugin-open-source',
    visitor
  };
});
