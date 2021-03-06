const fs = require('fs');
const ini = require('ini');

const getGitHubUrl = (localFilePath, lineNumber) => {
  if (process.env.VERCEL) {
    const repo = process.env.VERCEL_GIT_REPO_OWNER + '/' + process.env.VERCEL_GIT_REPO_SLUG;

    // TODO: I bet I'll regret hardcoding this
    const filePath = localFilePath
      .replace('/vercel/path0/', '')
      .replace('/vercel/path1/', '')
      .replace('/vercel/path2/', '')
      .replace('/vercel/path3/', '')
      .replace('/vercel/path4/', '');

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

module.exports = getGitHubUrl;
