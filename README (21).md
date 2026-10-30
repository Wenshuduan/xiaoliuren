# 小六壬 · iOS / PWA

同一套界面与算法，两种上线方式：

1. **PWA**：部署到任意 HTTPS 静态站点，iPhone 用 Safari「添加到主屏幕」，无需审核、无需开发者账号。
2. **原生 App**：用 Capacitor 把同一份网页装进 Xcode 工程，出真机包 / TestFlight / App Store。

| 起课 | 课象 | 手动择时 |
| --- | --- | --- |
| ![起课](preview/pwa-cast.png) | ![课象](preview/pwa-result.png) | ![手动](preview/pwa-manual.png) |

```
app-ios/
  web/                 已构建的静态站点（PWA，可直接部署）
  src/
    ui.js              界面与交互源码
    storage.web.js     浏览器本地存储
    sw.js              Service Worker 模板（构建时注入版本号）
  ios/                 Capacitor 生成的 Xcode 工程（Bundle ID: com.xiaoliuren.app）
  package.json
  capacitor.config.json
```

## 一、PWA

### 本地预览

```bash
cd app-ios/web
python -m http.server 8787
# 浏览器打开 http://127.0.0.1:8787
```

### 部署

把 `app-ios/web/` 整个目录上传到任意静态托管即可，例如 GitHub Pages、Vercel、Netlify、Cloudflare Pages、腾讯云 COS：

- 必须 HTTPS（`localhost` 除外），否则 Service Worker 不生效；
- 入口是 `index.html`，路由用 hash（`#/cast`），不需要服务端 rewrite；
- 更新版本后重新上传即可，`sw.js` 的缓存版本号由构建自动更新。

### 安装到 iPhone

Safari 打开站点 → 底部「分享」→「添加到主屏幕」。之后从桌面打开就是全屏无地址栏，断网也能用（已缓存）。

## 二、iOS 原生包

### 前置

- macOS + Xcode 16 或更高版本
- Apple Developer Program 账号（真机调试 / TestFlight / 上架都需要，¥688/年）
- 本工程已用 Capacitor 8 生成，无需 CocoaPods（走 Swift Package Manager）

### 构建

```bash
cd app-ios
npm install          # 首次
npm run build        # 由 src/ui.js + 小程序 utils 重新生成 web/app.js
npx cap sync ios     # 把 web/ 拷进 ios/App/App/public
npx cap open ios     # 用 Xcode 打开
```

Xcode 里：

1. 选 `App` target → **Signing & Capabilities** → Team 选自己的账号；把 Bundle Identifier 改成自己的（如 `com.yourname.xiaoliuren`）；
2. 连上 iPhone，选中设备，**Run**；
3. 上架：**Product → Archive** → **Distribute App → App Store Connect** 上传，然后在 App Store Connect 填资料、提交审核；
4. 内测：上传后在 App Store Connect → TestFlight 里添加测试员。

改了界面或算法后，重新执行 `npm run build && npx cap sync ios`，再 Archive。

### 已配置好的部分

- 显示名「小六壬」、竖屏限定、浅色模式；
- App 图标（1024，无透明通道）与启动图（纸色 + 徽记）；图标由 `assets/icon-source.webp` 生成；
- 启动页背景 `#f7f1e5`，与网页一致；
- 关闭了出口合规加密声明（`ITSAppUsesNonExemptEncryption = false`）。

### 改图标 / 包名

- 图标与启动图由 `tools/make_app_icons.py` 生成，改完重跑即可；
- 包名、显示名改 `app-ios/capacitor.config.json` 的 `appId` / `appName`，然后 `npx cap sync ios`。

## 三、上架注意

- **占卜 / 算命类内容**在 App Store 审核中属于敏感内容，被拒概率不低；中国区上架还需要完成 App 备案。
- 如果只是自己或朋友用：PWA 或 TestFlight 内测最省事，不必走公开审核。
- 网页里的「分享课象」在 PWA 中调用 Web Share API；在 WKWebView 中若不支持会退化为复制链接。需要原生分享面板时，可再加 `@capacitor/share` 插件。
