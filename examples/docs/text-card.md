# TextCard 文字卡片

<!-- {.md} -->

---

<!-- {.md} -->

## 基础用法

<!-- {.md} -->

使用`message`属性来自定义文字内容。

<!-- {.md} -->

<text-demo></text-demo>

::: demo

```html
<vue-cards-text class="demo-card" message="这是卡片内容"></vue-cards-text>

<vue-cards-text
  class="demo-card"
  theme-type="primary"
  message="这是卡片内容"
></vue-cards-text>
```

:::

## Attributes

<!-- {.md} -->

| 参数      | 说明       | 类型   | 可选值          | 默认值  |
| --------- | ---------- | ------ | --------------- | ------- |
| themeType | 卡片主题色 | String | default/primary | default |
| message | 文本内容 | String | - | - |
