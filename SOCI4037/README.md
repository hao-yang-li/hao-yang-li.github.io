# SOCI4037 Project Carnivalesque Map of Chinese Internet

一个可直接托管到 GitHub Pages 的纯前端 H5 坐标轴编辑器。

## 功能

- 滚轮缩放，拖动画布平移。
- 右键空白处新建椭圆 item。
- 编辑模式下可拖动 item。
- 鼠标悬停 item 后滚轮可整体缩放椭圆。
- 选中 item 后，可拖动上下左右控制点调整形状，拖动上方控制点调整方向。
- 椭圆内只展示文字；点击椭圆会在侧边展开详情卡片。
- 详情卡片支持图片、中文 intro、English intro，以及多个自定义名称的外链。
- 详情卡片图片支持上传、拖入，或复制图片后按 `Cmd/Ctrl+V` 粘贴。
- 最小缩放为 70%，放大和平移有边界限制，避免把地图拖到完全找不到。
- 坐标轴图例、象限文字和屏幕参考轴会浮动显示，放大后仍能看到。
- 导出/导入 JSON 和操作提示只在编辑模式显示。
- 进入编辑模式需要账号密码。
- 页面会按浏览器语言显示中文或英文内容，也可以用工具栏按钮手动切换。
- 数据自动保存在浏览器 `localStorage`，也可以导出/导入 JSON。

## GitHub Pages 部署

把 `index.html`、`styles.css`、`app.js` 放在仓库根目录，进入仓库的 Settings > Pages，选择部署分支即可。

图片上传、拖入或粘贴功能需要 Supabase Storage。配置完成后，图片会上传到 `map-images` bucket，换电脑也能显示。浏览器页面不会自动把图片文件写进 git 仓库。

## Supabase 协作

当前版本已接入 Supabase：

- item 数据保存到 `map_state` 表。
- 图片上传到 `map-images` Storage bucket。
- 换电脑打开同一个 GitHub Pages 页面后，会自动读取 Supabase 上的共享数据和图片。
- Supabase Realtime 会在浏览模式下接收别人保存的更新。
- 如果 Supabase 还没配置好，页面会报错提示，不再把图片退回 base64 本地模式。

首次使用前，在 Supabase 项目的 SQL Editor 里运行 `supabase-setup.sql`。
