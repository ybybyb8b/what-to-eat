# 今晚吃什么

一个面向两人晚餐、本地优先的移动端 PWA。支持外卖候选、食材选择、菜品推荐、晚餐方案、采购清单与完整数据备份。

## 开发

```bash
npm install
npm run dev
```

## 验收与构建

```bash
npm run typecheck
npm run test
npm run lint
npm run build
```

生产文件输出到 `dist/`，可以通过 `npm run preview` 本地预览。

应用数据保存在浏览器 IndexedDB 的 `jinwan-chi-shenme` 数据库中。首次启动会写入中文示例数据，之后不会覆盖用户修改。
