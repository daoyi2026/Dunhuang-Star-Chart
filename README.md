# 敦煌星图

一幅可交互的北天星官图：以唐代天极为中心缓缓转动的真实星空，配有敦煌星图原卷与星官释义。

在线访问：https://daoyi2026.github.io/Dunhuang-Star-Chart/

## 怎么看
- **唐时**（默认）：公元 700 年前后的北天，星空绕当时的天极缓缓旋转。移动鼠标像提一盏灯，照亮附近的星官名；点选星官可看古籍释义。
- **此刻敦煌**：站在敦煌（北纬 40.14°，东经 94.66°）面朝正北，看到的此刻真实天空。切换时星空先经历约 1300 年的岁差漂移。
- **入宫导览**：九站，自天极至天牢，可用 ← → 换站。
- **古卷**：在星空空白处长按约 0.8 秒，或点右上角「古卷」，打开敦煌星图原件紫微宫部分。可缩放、拖动，点暗处或按 Esc 回到星空。
- **听星河**：浏览器内生成的环境音，点击后开始。

## 文件
- `index.html`、`app.js`：页面与 Canvas 2D 渲染，无第三方依赖。
- `sky-data.js`：约 1.4 万颗恒星（≤7.2 等）、261 组中国星官连线与银河轮廓，J2000 坐标，取自 [d3-celestial](https://github.com/ofrohn/d3-celestial)（HYG / Hipparcos 星表）。岁差与地平坐标在页面中实时计算。
- `texts.js`：28 个星官的释义与出处。
- `audio.js`：Web Audio 环境音。
- `dunhuang-ziwei.jpg`：敦煌星图（大英图书馆藏，Or.8210/S.3326）紫微宫部分，图片来自 [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dunhuang_star_map.jpg)，公有领域。

`preview-v2`、`preview-v3`、`preview-v5`、`preview-v8` 为历次版本，保留备查。

## GitHub Pages
Settings → Pages → Deploy from a branch → `main` / `(root)`。
