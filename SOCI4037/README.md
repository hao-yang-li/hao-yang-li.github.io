# Carnivalesque Map

一个可直接托管到 GitHub Pages 的纯前端 H5 坐标轴编辑器。

## 功能

- 滚轮缩放，拖动画布平移。
- 右键空白处新建椭圆 item。
- 编辑模式下可拖动 item、修改文字、坐标、尺寸、旋转、跳转链接。
- item 可上传图片，图片会裁剪进椭圆中。
- 关闭编辑模式后，点击带链接的 item 会打开对应网页。
- 数据自动保存在浏览器 `localStorage`，也可以导出/导入 JSON。

## GitHub Pages 部署

把 `index.html`、`styles.css`、`app.js` 放在仓库根目录，进入仓库的 Settings > Pages，选择部署分支即可。

如果使用图片上传功能，图片会以 base64 存进浏览器本地数据或导出的 JSON 中，不需要额外服务器。
