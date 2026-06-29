# 大盤投資計算器 — Claude Code 專案說明

## 專案定位

供製作人 Huang Yen-han 及少數朋友使用的台灣大盤投資輔助試算工具。
部署於 Vercel（GitHub 連動自動部署），網址固定，所有人打開同一網址即為最新版本。

**核心定位**：個人財務規劃輔助，不構成投資建議。工具的重點是讓使用者「感受可能性」，而非「預測未來」。

---

## 技術架構

```
React 18 + Vite + Recharts
├── 無後端，純前端計算
├── 支援 Dark Mode（prefers-color-scheme）
├── 響應式設計（手機 / 平板 / 桌面）
└── 部署：Vercel（buildCommand: npm install && npm run build）
```

### 檔案結構

```
investment-calc/
├── index.html              ← <title> 含版本號，每次發版必須更新
├── package.json            ← version 欄位，每次發版必須更新
├── vite.config.js
├── vercel.json
├── .gitignore
├── README.md               ← 版本 LOG，每次發版必須更新
├── CLAUDE.md               ← 本檔案，Claude Code 專案說明
├── public/favicon.svg
└── src/
    ├── main.jsx
    ├── App.jsx             ← 主框架：Tab bar、全域狀態、字體切換
    ├── index.css           ← CSS 變數（含三檔字體大小）
    ├── components.jsx      ← 共用元件（含 MiniPie / MiniBar 圖表）
    ├── config.js           ← 集中常數（費率、ETF、崩盤事件）v2.0 新增
    ├── utils.js            ← 核心計算函數（re-export config 常數）
    └── tabs/
        ├── DCATab.jsx      ← 定期定額
        ├── BuyCalcTab.jsx  ← 買入試算（純無狀態輔助計算）
        ├── CompareTab.jsx  ← 0050 vs 009816 靜態說明
        ├── CrashTab.jsx    ← 崩盤模擬（最複雜）
        ├── InflTab.jsx     ← 通膨購買力
        ├── DrawTab.jsx     ← 退休提領
        ├── DivTab.jsx      ← 高股息 ETF
        ├── InsTab.jsx      ← 儲蓄險 vs 股市
        └── AboutTab.jsx    ← 關於 / 版本紀錄 / 版權
```

---

## 版本管理規則（重要）

每次發版必須同步更新以下四個地方，**缺一不可**：

1. `index.html` — `<title>` 標籤
2. `package.json` — `version` 欄位
3. `src/App.jsx` — Header 版本號顯示
4. `src/tabs/AboutTab.jsx` — 版本更新紀錄陣列
5. `README.md` — 版本更新紀錄

版本號規則：
- 大功能新增 → x.y（如 v1.8 → v1.9）
- 小修正 / 小調整 → x.y.z（如 v1.8.0 → v1.8.1）

---

## 全域狀態（App.jsx INIT）

所有分頁透過 `state` / `set(key, val)` 共用以下狀態：

```js
{
  // 定期定額
  amt:          0,        // 每月投入金額
  lumpSum:      0,        // 一次性投入
  per:          36,       // 定期定額期數（月）
  dr:           0.08,     // 年化報酬率（預設全球保守 8%）
  tax:          0,        // 所得稅率（0050 配息）
  reinvestRate: 1,        // 0050 配息再投入效率（0-1）

  // 儲蓄險（全域，供通膨分頁讀取）
  insPrin:      0,        // 保險本金
  insAnn:       0,        // 每年領回
  insPen:       0,        // 解約費用 %

  // 通膨
  infl:         0.02,     // 年通膨率

  // 退休提領
  drawMo:       50000,    // 每月提領金額
  drawRate:     0.08,     // 提領後年化報酬
  retireAfter:  20,       // 幾年後退休
  drawYears:    25,       // 希望提領撐幾年

  // 高股息 ETF
  dvTotal:      150000,   // 總投入金額
  dvW:          [40,30,30], // 0056/00878/00919 比例
  dvTarget:     50000,    // 目標月領金額
}
```

---

## 核心常數（src/config.js）

> v2.0 起，以下市場假設/費率集中於 `src/config.js`（單一事實來源）。`utils.js` re-export 維持既有 import 路徑不變，分頁仍可 `from '../utils'` 取用。需更新數字時只改 `config.js`。

```js
EXP0 = 0.0043   // 0050 費用率
EXP1 = 0.00097  // 009816 費用率
DIV  = 0.027    // 0050 配息殖利率假設
TH   = 0.0211   // 二代健保補充費率
MONTH_VOL = 0.18 // 台股年化波動率（扇形計算用）
SAFE_WITHDRAWAL_RATE = 0.04  // 4% 法則
COMPARE_DATE = '2026/6/24'   // 比較資料基準日
// ETF_DATA / CRASH_EVENTS 亦在 config.js
```

### 報酬率計算

```js
009816 費後年化 = dr + 0.01 - EXP1
0050 費後稅後   = dr - EXP0 - DIV * (tax + TH)
```

---

## 核心計算函數（utils.js）

### buildNorm(lumpSum, amt, per, annR)
正常複利序列，回傳 Float64Array(241)，index 0-240 對應第 0-240 個月。

### buildCrashN(lumpSum, amt, per, annR, crashes)
**v1.8.0 重構版**，混合批次追蹤演算法：
- 崩盤前累積資產合為「持有池」承受跌幅
- 崩盤後新投入資金各自按正常年化複利獨立追蹤
- 確保崩後投入本金不被衰減侵蝕
- 回傳 `{ vals: Float64Array(241), fanStart: number }`

crashes 格式：`[{ when(年), drop(%), type('structural'|'liquidity'), enabled }]`

### calcFan(centralVals, fanStartMo, annVol)
對數常態分佈 ±1σ 扇形，從 fanStartMo 開始展開。
回傳 `{ upper: Float64Array(241), lower: Float64Array(241) }`

---

## 崩盤模擬演算法細節

### 兩種崩盤類型的加權

| 類型 | wA（結構重置） | wB（流動性危機） |
|---|---|---|
| 結構重置 | 0.7 | 0.3 |
| 流動性危機 | 0.3 | 0.7 |

### 演算法 A（結構重置）
- 底部震盪期 = `-ln(1-drop) × 24` 個月
- 衰減消退年限 T_decay = `-ln(1-drop) × 15` 年
- 成長率隨時間從衰減態線性恢復到正常年化

### 演算法 B（流動性危機）
- 目標趨勢線 = 崩盤前資產的正常複利延伸
- 指數飽和函數恢復：`1 - e^(-λt)`
- λ = `ln(2) / (-ln(1-drop) × 6)`

---

## 高股息 ETF 資料

```js
0056  殖利率 6.5%  配息月：1/4/7/10
00878 殖利率 7.0%  配息月：3/6/9/12
00919 殖利率10.0%  配息月：2/5/8/11
```
三檔季配，配息月剛好錯開，1-12月每月皆有一檔配息。

---

## 分頁說明

| 分頁 | 說明 | 狀態來源 |
|---|---|---|
| 定期定額 | 009816 vs 0050，一次性+定期定額，六檔報酬率 | 全域 |
| 買入試算 | 台灣股票整張+零股試算，純無狀態 | 無 |
| 0050 vs 009816 | 靜態說明頁，無互動 | 無 |
| 崩盤模擬 | 三次崩盤，扇形分布，心理承受力測試 | 全域 |
| 通膨購買力 | 名目 vs 實質，引用儲蓄險年領數字 | 全域 |
| 退休提領 | 退休時間、衝突偵測、年金現值反推 | 全域 |
| 高股息ETF | 三檔配置、月曆配息、目標月領反推 | 全域 |
| 儲蓄險 vs 股市 | 優缺點比較 + 解約轉投資試算 | 全域 |
| 關於 | 版本紀錄、版權、免責聲明 | 無 |

---

## 字體大小系統

透過 `html[data-font]` 屬性切換，CSS 變數定義於 `index.css`：

```css
--font-base: 14px  /* 內文 */
--font-sm:   12px  /* 次要文字 */
--font-xs:   11px  /* 標籤、備註 */
--font-lg:   16px  /* 小標題 */
--font-xl:   18px  /* 大標題 */
```

三檔（小/中/大）在 App.jsx Header 右上角切換。

---

## 設計原則與禁止事項

### 必須遵守
- 所有計算純前端，**無後端、無資料庫、無任何使用者資料上傳**
- 版本號四個檔案同步更新（index.html / package.json / App.jsx / AboutTab.jsx / README.md）
- 保險相關數字（insPrin / insAnn / insPen）必須存在全域 state，供通膨分頁讀取
- 崩盤模擬的正常複利基準線統一使用 009816（`dr + 0.01 - EXP1`）
- Dark Mode 支援（所有顏色使用 CSS 變數 `var(--c-*)`，不得寫死顏色值）

### 製作人偏好
- 語言：繁體中文介面
- 風格：資訊密度高但不雜亂，卡片式佈局
- 崩盤模擬是整個工具的重點功能，演算法正確性優先於簡潔性
- 說明文字要誠實，不過度樂觀，不迴避不確定性
- 儲蓄險 vs ETF 的比較要中立，不能完全漠視保守型投資者的需求

### 禁止事項
- 不加入任何需要記錄、儲存、登入的功能
- 不使用 localStorage（會在 Claude.ai artifact 環境失效）
- 不引入除 recharts 以外的新圖表套件（避免版本衝突）
- 不更改 vercel.json 的基本設定（已驗證可正常部署）

---

## v2.0 改進方案（2026-06-29 完成）

依「計算正確性 → 重構 → UI/UX → 圖表」四階段一次性實作，已發版 v2.0：

- **計算正確性（最高優先）**
  - 移除 `buildCrashN` 內約 140 行死碼（原本就由 `buildCrashClean` 產生結果，輸出不變）
  - 同月多次崩盤改為合成跌幅 `1-∏(1-dropᵢ)`，修正 `crashIdx` 卡死、後續崩盤不觸發的 bug
  - `buildNorm` / `buildCrashClean` 補 `out[0] = 本金`；`buildNorm` 新增 `months` 參數
  - `calcFan` 加入 `fanStartMo` 邊界與非有限值防呆
  - 註解修正：`algoAmonthly` 標明為「線性恢復」（非半衰期）；`buildNorm` 標明「月初投入」假設
- **重構**：新增 `src/config.js` 集中常數，`utils.js` re-export；合併 DCA/Infl/Draw 重複的複利函數為 `buildNorm`；CrashTab 跌幅/年份滑桿改用共用 `Slider`
- **UI/UX**：`index.css` 新增 `.grid2/3/4/5`、`.cmp-row/.cmp-head` 響應式 class（≤560px 重排），Header `flexWrap`，`:focus-visible`，`--font-2xs` 提至 11px，`Slider` 加 `aria-label`，Crash/Draw/BuyCalc 輸入防呆
- **深色模式**：CrashTab 寫死深色塊改用 `--c-danger*` / `--c-suc*` 變數
- **新圖表**：`MiniPie` / `MiniBar`（components.jsx）；CompareTab 集中度+費用率長條、DivTab 配置圓餅+預設殖利率長條、BuyCalcTab 預算分配條、Draw/Ins 用 `InvestChart` refLines 標註耗盡點/黃金交叉

## 已知待辦 / 未來方向

- 崩盤演算法可選將 `algoAmonthly` 線性恢復改為指數恢復（會改變所有崩盤數字，屬模型決策，暫不動）
- 報酬率六檔的歷史錨點數字，若有更精確的資料來源可更新
- 高股息ETF殖利率採10年歷史均值，COMPARE_DATE（config.js）為最後更新基準日

---

## 版權

© 2026 Huang Yen-han. All rights reserved.
