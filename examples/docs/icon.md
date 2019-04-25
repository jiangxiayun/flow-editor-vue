# Icon 图标
<!-- {.md} -->

---
<!-- {.md} -->

## 如何使用
<!-- {.md} -->

方式一：<!-- {.md} -->
通过<!-- {.md} -->`vue-cards-icon`标签来引用

<icon-demo></icon-demo>

::: demo

```html
<vue-cards-icon name="cards-playing-outline" :size="16"></vue-cards-icon>
<vue-cards-icon name="cards" :size="16"></vue-cards-icon>
<vue-cards-icon name="close" :size="16"></vue-cards-icon>
```

:::



## Attributes
<!-- {.md} -->
| 参数      | 说明    | 类型      | 可选值       | 默认值   |
|---------- |-------- |---------- |-------------  |-------- |
| name     | 图标名称  | string  | -          |    -     |
| color    | 图标颜色  | string  | -           |    -    |
| size    | 图标大小  | number  | -           |    -    |
| symbol    | 是否多色（开启将以`svg`标签方式引入图标）  | boolean  | `true`,`false`          |    `true`     |
