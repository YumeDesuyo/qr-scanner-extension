# qr-scanner-extension
扫描屏幕二维码的chrome插件
# Screen QR Scanner

一个轻量级 Chrome 扩展，用于扫描当前网页中的二维码。

支持：

- 登录二维码
- 支付二维码
- URL 链接
- 文本二维码
- 网页中的任意 QR Code

---

# 功能特点

- 一键扫描当前网页二维码
- 自动识别二维码内容
- 支持链接跳转
- 轻量快速
- 基于 Chrome Manifest V3

---

# 项目结构

```text
qr-scanner-extension/
│
├── manifest.json
├── background.js
├── popup.html
├── popup.js
├── styles.css
├── jsqr.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
