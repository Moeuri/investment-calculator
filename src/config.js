// ─────────────────────────────────────────────────────────────────
// 集中設定：市場假設、費率、ETF 資料、崩盤事件
// 單一事實來源（Single Source of Truth）。需更新數字時只改這裡。
// utils.js 會 re-export 以下常數，維持既有 import 路徑不變。
// ─────────────────────────────────────────────────────────────────

// ETF 費用率
export const EXP0 = 0.0043    // 0050 總費用率
export const EXP1 = 0.00097   // 009816 總費用率

// 0050 配息與稅務
export const DIV  = 0.027     // 0050 配息殖利率假設
export const TH   = 0.0211    // 二代健保補充費率（2.11%）

// 台股年化波動率（崩盤扇形分布用）
export const MONTH_VOL = 0.18

// 4% 安全提領率（退休提領分頁）
export const SAFE_WITHDRAWAL_RATE = 0.04

// 比較資料基準日（0050 vs 009816 分頁）
export const COMPARE_DATE = '2026/6/24'

// 高股息 ETF 資料（殖利率採10年歷史均值）
export const ETF_DATA = [
  { code: '0056',  name: '元大高股息',     freq: '季配', yield10yr: 0.065, divMonths: [1,4,7,10], color: '#378ADD' },
  { code: '00878', name: '國泰永續高股息', freq: '季配', yield10yr: 0.07,  divMonths: [3,6,9,12], color: '#1D9E75' },
  { code: '00919', name: '群益精選高息',   freq: '季配', yield10yr: 0.10,  divMonths: [2,5,8,11], color: '#BA7517' },
]

// 崩盤歷史事件
export const CRASH_EVENTS = [
  { name: '1987 黑色星期一', drop: 34, type: 'liquidity',  note: '程式交易觸發的連鎖拋售，企業基本面未受影響，屬流動性危機' },
  { name: '2000 科網泡沫',   drop: 49, type: 'structural', note: '網路公司估值嚴重泡沫化，大量公司缺乏獲利基礎，屬結構重置' },
  { name: '2008 金融海嘯',   drop: 57, type: 'structural', note: '金融衍生品槓桿結構崩潰，系統性風險蔓延全球，屬結構重置' },
  { name: '2020 疫情崩盤',   drop: 34, type: 'liquidity',  note: '疫情引發恐慌性拋售，企業長期競爭力未受影響，屬流動性危機' },
  { name: '2022 暴力升息',   drop: 28, type: 'liquidity',  note: '貨幣政策緊縮造成資金重新定價，偏流動性危機（含部分結構影響）' },
]
