const { override, addBabelPlugins } = require('customize-cra')
const plugin = require('babel-plugin-open-source')

module.exports = override(...addBabelPlugins(plugin))