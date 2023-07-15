const getGitHubUrl = require('./github-url.js');

const getEditorUrl = (editor, filename, line) => {
  if (editor === 'sublime') {
    // https://macromates.com/blog/2007/the-textmate-url-scheme/
    // https://github.com/ljubadr/sublime-protocol-win
    return `subl://open?url=file://${filename}&line=${line}`;
  } else if (editor === 'phpstorm') {
    // https://github.com/siddharthkp/babel-plugin-open-source/issues/6#issue-999132767
    return `phpstorm://open?file=${filename}&line=${line}`;
  } else if (editor === 'atom') {
    // https://flight-manual.atom.io/hacking-atom/sections/handling-uris/#core-uris
    return `atom://core/open/file?filename=${filename}&line=${line}`;
  } else if (editor === 'vscode-insiders') {
    return `vscode-insiders://file/${filename}:${line}`;
  } else if (editor === 'github') {
    return getGitHubUrl(filename, line);
  } else {
    return `vscode://file/${filename}:${line}`;
  }
};

module.exports = getEditorUrl;
