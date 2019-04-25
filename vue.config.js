const path = require('path')
function resolve (dir) {
  return path.join(__dirname, dir)
}

const MarkdownItContainer = require('markdown-it-container')
const MarkdownItCheckBox = require('markdown-it-task-checkbox')
const MarkdownItDec = require('markdown-it-decorate')
const utils = require('./build/utils')
const vueMarkdown = {
  raw: true,
  preprocess: (MarkdownIt, source) => {
    MarkdownIt.renderer.rules.table_open = function () {
      return '<table class="table">'
    }
    // ```html``` 给这种样式加个class hljs
    MarkdownIt.renderer.rules.fence = utils.wrapCustomClass(
      MarkdownIt.renderer.rules.fence
    )
    // ```code``` 给这种样式加个class code_inline
    const codeInline = MarkdownIt.renderer.rules.code_inline
    MarkdownIt.renderer.rules.code_inline = function (...args) {
      args[0][args[1]].attrJoin('class', 'code_inline')
      return codeInline(...args)
    }
    return source
  },
  use: [
    [
      MarkdownItContainer,
      'demo',
      {
        validate: params => params.trim().match(/^demo\s*(.*)$/),
        render: function (tokens, idx) {
          if (tokens[idx].nesting === 1) {
            return `<demo-block>
                        <div slot="highlight">`
          }
          return '</div></demo-block>\n'
        }
      }
    ],
    [
      MarkdownItCheckBox,
      {
        disabled: true
      }
    ],
    [MarkdownItDec]
  ]
}

module.exports = {
  lintOnSave: false,
  publicPath: './',
  // 修改 src 目录 为 examples 目录
  pages: {
    index: {
      entry: 'examples/main.js',
      template: 'public/index.html',
      filename: 'index.html'
    }
  },
  // 扩展 webpack 配置，使 packages 加入编译
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('examples'))
    config.module
      .rule('md')
      .test(/\.md/)
      .use('vue-loader')
      .loader('vue-loader')
      .end()
      .use('vue-markdown-loader')
      .loader('vue-markdown-loader/lib/markdown-compiler')
      .options(vueMarkdown)
  },
  // 修改webpack的配置
  configureWebpack: {
    // 把原本需要写在webpack.config.js中的配置代码 写在这里 会自动合并
    externals: {
      jquery: 'jQuery',
      'ORYX': 'ORYX'
    }
  },
  // 注意：格式 ‘aaa’:‘ccc’,左边代表要引入资源包的名字，右边代表该模块在外面使用引用的名字
  // 例如 jQuery在外面的引用就为$
  /*
   上面的例子。属性名称是 jquery，表示应该排除 import $ from 'jquery' 中的 jquery 模块。
   为了替换这个模块，jQuery 的值将被用来检索一个全局的 jQuery 变量。
   */

  pluginOptions: {
    i18n: {
      locale: 'zh',
      fallbackLocale: 'en',
      localeDir: 'assets/i18n',
      enableInSFC: false
    }
  }
}


