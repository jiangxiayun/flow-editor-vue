// vue.config.js
module.exports = {
  // 修改webpack的配置
  configureWebpack: {
    // 把原本需要写在webpack.config.js中的配置代码 写在这里 会自动合并
    externals: {
      'jquery' : '$',
      'ORYX':'ORYX'
    }
  },

  pluginOptions: {
    i18n: {
      locale: 'zh',
      fallbackLocale: 'en',
      localeDir: 'assets/i18n',
      enableInSFC: false
    }
  }
}

// 注意：格式 ‘aaa’:‘ccc’,左边代表要引入资源包的名字，右边代表该模块在外面使用引用的名字
// 例如 jQuery在外面的引用就为$
