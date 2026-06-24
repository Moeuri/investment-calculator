# 大盤投資計算器 v1.1

009816 / 0050 / 高股息ETF 大盤投資計算工具

## 功能

- 📈 定期定額（0050 vs 009816，含稅率、20年試算）
- 🏦 保險 vs 股市（與定期定額報酬率同步）
- 💥 崩盤模擬（雙崩盤疊圖，五個歷史事件預設）
- 💰 通膨購買力（實質 vs 名目，含保險侵蝕）
- 🏖️ 退休提領（4%法則，耗盡年數計算）
- 🎯 高股息ETF（0056/00878/00919，月曆式配息，目標反推）

---

## 部署到 Vercel（一次設定，之後自動更新）

### 第一步：上傳到 GitHub

1. 前往 [github.com](https://github.com) 並登入
2. 點擊右上角「+」→「New repository」
3. Repository name：`investment-calculator`（或任何名稱）
4. 選擇 Public，點擊「Create repository」
5. 把這個資料夾的所有檔案上傳（拖曳到頁面或用 GitHub Desktop）

### 第二步：部署到 Vercel

1. 前往 [vercel.com](https://vercel.com)，用 GitHub 帳號登入
2. 點擊「Add New Project」
3. 選擇剛才建立的 `investment-calculator` repository
4. Framework Preset 選「Vite」
5. 點擊「Deploy」，等待約 1 分鐘
6. 完成後取得你的網址（如 `investment-calculator-xxx.vercel.app`）

### 之後更新

每次有新版本，只需把更新的檔案上傳到 GitHub，
Vercel 會自動在幾分鐘內完成重新部署，所有人打開同一個網址即是最新版本。

---

## 本地開發

```bash
npm install
npm run dev
```

---

## 技術說明

- React 18 + Vite
- Recharts（圖表）
- 無任何後端，純前端計算
- 支援 Dark Mode
- 響應式設計，手機/平板/桌面皆可使用
