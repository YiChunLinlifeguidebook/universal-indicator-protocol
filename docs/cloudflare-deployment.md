# 🚀 Cloudflare Pages 部署指南

本專案已設定好可直接部署到 Cloudflare Pages 的網站結構。

---

## 資料夾結構

```
faster-than-light/
├── website/                  ← Cloudflare Pages 的網站根目錄
│   ├── index.html            ← 主要商業落地頁
│   ├── css/
│   │   └── style.css         ← 全站樣式
│   ├── js/
│   │   └── main.js           ← 前端互動邏輯
│   ├── _redirects            ← Cloudflare Pages 路由規則
│   └── _headers              ← HTTP 安全標頭設定
├── wrangler.toml             ← Wrangler CLI 設定
├── package.json              ← 部署腳本
└── .gitignore
```

---

## 部署方式

### 方式 A：Cloudflare Dashboard（推薦新手）

1. 前往 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages**
2. 點擊 **Create application** → **Pages** → **Connect to Git**
3. 選擇此 GitHub repository
4. 設定如下：
   - **Build command**：（留空，純靜態網站不需要建置）
   - **Build output directory**：`website`
5. 點擊 **Save and Deploy**

### 方式 B：Wrangler CLI

```bash
# 安裝 Node.js 依賴
npm install

# 登入 Cloudflare
npx wrangler login

# 部署到 production
npm run deploy

# 預覽部署
npm run deploy:preview
```

---

## 自訂網域

1. 在 Cloudflare Pages 設定頁面 → **Custom domains**
2. 點擊 **Set up a custom domain**
3. 輸入您的網域名稱
4. Cloudflare 會自動設定 DNS 及 SSL 憑證

---

## 後續更新網站內容

所有網站內容集中在 `website/` 目錄：

- 修改 `website/index.html` — 更新文字、區塊內容
- 修改 `website/css/style.css` — 調整樣式
- 新增圖片至 `website/` — 在 HTML 中用 `<img src="your-image.jpg">` 引用

每次推送到 GitHub 後，Cloudflare Pages 會自動重新部署。

---

## 聯絡表單串接（可選）

`website/js/main.js` 中的表單送出目前為示範模式。
如需實際收集表單資料，可選擇：

- **Cloudflare Workers**：建立一個 Worker 處理 POST 請求並轉寄 Email
- **Formspree / Netlify Forms**：第三方表單服務
- **EmailJS**：前端直接寄信服務

---

© 2026 YiChunLinlifeguidebook. All rights reserved.
