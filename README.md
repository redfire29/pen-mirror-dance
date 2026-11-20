# 塗鴉搖搖鏡 Pen Mirror Dance（WiggleMirror）

> 把倒畫塗鴉或照片平放在筆記本紙上，透過銀色圓錐筆頭的真實 3D 光學反射站起來，平行左右＋前後跳動並一鍵產出無縫循環 GIF！

線上試玩（GitHub Pages）：<https://redfire29.github.io/pen-mirror-dance/>

Turn any doodle or photo into a 3D reflective pen-tip dancing GIF — 100% client-side WebGL raytracing with zero server uploads.

## 功能特色

- **真實 3D 光線追蹤柱面反射**：WebGL Fragment Shader 即時計算圓錐筆頭、不鏽鋼銀杯、亮銀大圓錐與筆記本紙面（橫線筆記本／方格紙／素白畫紙）的反射幾何與筆影。
- **多種垂直平行移動模式**：支援「平行左右滑動」、「平行 U 字滑跳」、「平行左右快跳」、「平行畫圈滑動」、「筆不動・紙左右滑」，並可獨立調整移動速度、左右移動幅度、前後移動幅度與筆頭前後位置；亦可直接在舞台上拖曳平行移動筆頭。
- **雙視角 × 雙畫幅**：一鍵切換「全景同框」／「特寫筆頭」與 `1:1 正方形`／`3:4 實拍直式`。
- **邊畫邊跳塗鴉筆記本**：支援圖片上傳、拖拉放圖、`Ctrl/Cmd + V` 貼上、4 款內建手繪範例（含 `:3 塗鴉貓`），以及與 3D 反射舞台即時連動的隨手塗鴉板。
- **純前端無縫循環 GIF 匯出**：透過 `gifenc` 於瀏覽器本地端產出 `256px` / `480px` / `640px` 無浮水印循環 GIF。
- **雙語介面**：預設繁體中文，右上角可一鍵切換英文（`繁中 / EN`）。

## 技術架構

- **Framework**：Astro 5 + Vue 3（Composition API）
- **Styling**：Tailwind CSS 4（CSS-first `@theme`）
- **Graphics**：WebGL2 / WebGL1 光線追蹤 Shader（附 Canvas 2D 降級備援）
- **GIF Encoding**：`gifenc`（純前端 RGB565 調色盤量化與 LZW 編碼）

## 本機開發與建置

```bash
pnpm install
pnpm dev
```

開啟輸出網址（因已設定 GitHub Pages `base`，本地開發網址為 `http://localhost:4321/pen-mirror-dance/`）。

建置正式靜態檔案與檢查型別：

```bash
pnpm check
pnpm build
```

## GitHub Pages 自動部署

已於 [deploy.yml](.github/workflows/deploy.yml) 設定 GitHub Actions，每次推送到 `main` 分支時會自動執行 `pnpm run build` 並發布 `./dist` 至 GitHub Pages。

若首次啟用部署，請至 Repository 的 **Settings → Pages → Build and deployment → Source** 選擇 **GitHub Actions**。
