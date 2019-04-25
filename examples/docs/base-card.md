# BaseCard 基础卡片

<!-- {.md} -->

---

<!-- {.md} -->

## 基础用法

<!-- {.md} -->

使用<!-- {.md} --> `slot="content"` 插槽来自定义卡片上部内容<!-- {.md} -->，
使用<!-- {.md} --> `slot="footer"` 插槽来自定义卡片底部内容<!-- {.md} -->。

<base-demo></base-demo>

::: demo

```html
<vue-cards-base class="demo-card">
  <div slot="content">这是卡片内容</div>
  <div slot="footer">
    <div class="vue-cards__footer-content">这是底部内容</div>
  </div>
</vue-cards-base>
<vue-cards-base class="demo-card" theme-type="primary">
  <div slot="content">这是卡片内容</div>
</vue-cards-base>
```

:::

## Attributes

<!-- {.md} -->

| 参数          | 说明             | 类型     | 可选值                             | 默认值    |
| ------------- | ---------------- | -------- | ---------------------------------- | --------- |
| themeType     | 卡片主题色       | `String` | `default | primary`                | `default` |
