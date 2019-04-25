# 开发指南
<!-- {.md} -->

----
<!-- {.md} -->

## 初始化项目
<!-- {.md} -->

```js
git clone https://github.com/Eamonnzhang/vue-cards.git

cd vue-cards

# 初始化项目、安装依赖
npm run init

# 本地开发模式
npm run dev

# 样式开发单独启动一个服务
npm run dev:style

```
<!-- {.md} -->

浏览器访问<!-- {.md} --> [http://localhost:8080](http://localhost:8080)<!-- {.md} --> 就可以看到所有组件的示例了

## 添加新组件和样式
<!-- {.md} -->
请按照<!-- {.md} --> `packages` 目录下的文件夹结构添加新的组件，如需新的样式请在 `packages/theme-chalk/src` 添加。

## 添加组件示例和文档
<!-- {.md} -->
请在<!-- {.md} --> `examples/demos` 目录下添加新的组件示例。如需添加文档，请在 `examples/docs` 下添加新的文档，同时要在 `nav.config.json` 中添加新的路由才能预览。

## 发布NPM包和文档
<!-- {.md} -->
```js
# 发布npm包
npm run release

# 发布文档
npm run publish:docs
```
<!-- {.md} -->
具体执行命令，可查看对应脚本。
<!-- {.md} -->

## 生成CHANGELOG
<!-- {.md} -->
Todo
<!-- {.md} -->