const path = require("path");
const withCustomBabelConfigFile = require("next-plugin-custom-babel-config");

module.exports = withCustomBabelConfigFile({
  babelConfigFile: path.resolve("./babel.config.json")
});