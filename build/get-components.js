// 获取packages目录下所有的组件目录，为我们构建packages下的入口文件做准备。

const fs = require('fs')
const path = require('path')

const excludes = [
  'index.js',
  'theme-chalk',
  'mixins',
  'utils',
  '.DS_Store'
]

module.exports = function () {
  const dirs = fs.readdirSync(path.resolve(__dirname, '../packages'))
  return dirs.filter(dirName => excludes.indexOf(dirName) === -1)
}
