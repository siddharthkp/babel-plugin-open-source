const fs = require('fs');
const ini = require('ini');
const { declare } = require('@babel/helper-plugin-utils');
const { types: t } = require('@babel/core');
const dotenv = require('dotenv');

const scriptLocation = 'babel-plugin-open-source/script.js';

// picks root directory's .env file
const dotenvConfig = dotenv.config();

module.exports = declare((api) => {
  api.assertVersion(7);

  const visitor = {
    Program: {
      enter: (_, state) => {
        state.file.set('hasJSX', false);

        let editor = state.opts && state.opts.editor ? state.opts.editor.toLowerCase() : 'vscode';
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
      let url = null;

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

      if (editor === 'sublime') {
        // https://macromates.com/blog/2007/the-textmate-url-scheme/
        // https://github.com/ljubadr/sublime-protocol-win
        url = `subl://open?url=file://${state.filename}&line=${location.start.line}`;
      } else if (editor === 'phpstorm') {
        // https://github.com/siddharthkp/babel-plugin-open-source/issues/6#issue-999132767
        url = `phpstorm://open?file=${state.filename}&line=${location.start.line}`;
      } else if (editor === 'atom') {
        // https://flight-manual.atom.io/hacking-atom/sections/handling-uris/#core-uris
        url = `atom://core/open/file?filename=${state.filename}&line=${location.start.line}`;
      } else if (editor === 'vscode-insiders') {
        url = `vscode-insiders://file/${state.filename}:${location.start.line}`;
      } else if (editor === 'github') {
        url = getGitHubUrl(state.filename, location.start.line);
      } else {
        url = `vscode://file/${state.filename}:${location.start.line}`;
      }
      const sourceData = JSON.stringify({ url });

      path.container.openingElement.attributes.push(
        t.jsxAttribute(t.jsxIdentifier('data-source'), t.stringLiteral(sourceData))
      );
    }
  };

  return {
    name: 'babel-plugin-open-source',
    visitor
  };
});

const getGitHubUrl = (localFilePath, lineNumber) => {
  if (process.env.VERCEL) {
    // TODO: I bet I'll regret hardcoding this
    const gitRoot = '/vercel/path0/';

    const repo = process.env.VERCEL_GIT_REPO_OWNER + '/' + process.env.VERCEL_GIT_REPO_SLUG;
    const filePath = localFilePath.replace(gitRoot, '');

    // TODO: replace with ci-env
    const branchName = process.env.VERCEL_GIT_COMMIT_REF || 'main';

    return `https://github.com/${repo}/blob/${branchName}/${filePath}#L${lineNumber}`;
  } else {
    try {
      const findGitRoot = require('find-git-root');
      const gitRoot = findGitRoot(localFilePath).replace('.git', '');
      const repo = getRepository(gitRoot);
      const filePath = localFilePath.replace(gitRoot, '');

      // TODO: replace with ci-env
      const branchName = process.env.GITHUB_HEAD_REF || 'main';

      return `https://github.com/${repo}/blob/${branchName}/${filePath}#L${lineNumber}`;
    } catch (error) {
      console.log('Could not find .git root, skipping plugin');
    }
  }
};

const getRepository = (gitRoot) => {
  const result = fs.readFileSync(gitRoot + '/.git/config', 'utf8');
  const config = ini.parse(result);

  return config['remote "origin"'].url.replace('git@github.com:', '').replace('.git', '');
};
