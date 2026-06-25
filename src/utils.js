// 常數
export const EXP0 = 0.0043
export const EXP1 = 0.00097
export const DIV  = 0.027
export const TH   = 0.0211

// 高股息 ETF 資料
export const ETF_DATA = [
  { code: '0056',  name: '元大高股息',     freq: '季配', yield10yr: 0.065, divMonths: [1,4,7,10], color: '#378ADD' },
  { code: '00878', name: '國泰永續高股息', freq: '季配', yield10yr: 0.07,  divMonths: [3,6,9,12], color: '#1D9E75' },
  { code: '00919', name: '群益精選高息',   freq: '季配', yield10yr: 0.10,  divMonths: [2,5,8,11], color: '#BA7517' },
]

export const MONTH_NAMES = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']

// 崩盤歷史事件（含建議類型）
export const CRASH_EVENTS = [
  { name: '1987 黑色星期一', drop: 34, type: 'liquidity', note: '程式交易觸發的連鎖拋售，企業基本面未受影響，屬流動性危機' },
  { name: '2000 科網泡沫',   drop: 49, type: 'structural', note: '網路公司估值嚴重泡沫化，大量公司缺乏獲利基礎，屬結構重置' },
  { name: '2008 金融海嘯',   drop: 57, type: 'structural', note: '金融衍生品槓桿結構崩潰，系統性風險蔓延全球，屬結構重置' },
  { name: '2020 疫情崩盤',   drop: 34, type: 'liquidity', note: '疫情引發恐慌性拋售，企業長期競爭力未受影響，屬流動性危機' },
  { name: '2022 暴力升息',   drop: 28, type: 'liquidity', note: '貨幣政策緊縮造成資金重新定價，偏流動性危機（含部分結構影響）' },
]

export const MONTH_VOL = 0.18  // 台股年化波動率估算

// 格式化
export function fmtM(n) {
  if (!isFinite(n)) return '—'
  const a = Math.abs(n)
  if (a >= 1e8) return (n / 1e8).toFixed(2) + '億'
  if (a >= 1e4) return (n / 1e4).toFixed(1) + '萬'
  return Math.round(n).toLocaleString()
}
export function fmtF(n)  { return Math.round(n).toLocaleString() + ' 元' }
export function fmtPA(r) { return (r * 100).toFixed(2) + '%' }
export function fmtP1(r) { return (r * 100).toFixed(1) + '%' }

// 正常複利序列（含一次性投入）
export function buildNorm(lumpSum, amt, per, annR) {
  const mr = annR / 12
  const out = new Float64Array(241)
  let v = lumpSum || 0
  for (let mo = 1; mo <= 240; mo++) {
    v = mo <= per ? (v + amt) * (1 + mr) : v * (1 + mr)
    out[mo] = v
  }
  return out
}

// ─────────────────────────────────────────────
// 演算法 A：結構重置型
//   底部震盪期 = -ln(1-drop) × 24 個月
//   震盪後成長率衰減 = 正常年化 × (1-drop)^0.5
//   目標：無前高，從底部新趨勢線出發
// ─────────────────────────────────────────────
function algoA(bottomVal, drop, annR, monthsAfter) {
  const shakeMo = Math.round(-Math.log(1 - drop / 100) * 24)
  const decayedR = annR * Math.pow(1 - drop / 100, 0.5)
  const mr = decayedR / 12
  if (monthsAfter <= shakeMo) return bottomVal
  return bottomVal * Math.pow(1 + mr, monthsAfter - shakeMo)
}

// ─────────────────────────────────────────────
// 演算法 B：流動性危機型
//   目標趨勢線 = 投入起點開始的正常複利線
//   恢復函數：指數飽和趨向趨勢線
//   λ = ln(2) / (-ln(1-drop) × 6)
// ─────────────────────────────────────────────
function algoB(bottomVal, drop, annR, monthsAfter, trendAtTarget) {
  const lambda = Math.log(2) / (-Math.log(1 - drop / 100) * 6)
  const progress = 1 - Math.exp(-lambda * monthsAfter)
  const mr = annR / 12
  const grownBottom = bottomVal * Math.pow(1 + mr, monthsAfter)
  return grownBottom + (trendAtTarget - bottomVal * Math.pow(1 + mr, monthsAfter)) * progress
}

// ─────────────────────────────────────────────
// 多次崩盤主函數（新版：結構/流動性加權融合）
// crashes: [{ when(年), drop, type('structural'|'liquidity'), enabled }]
// ─────────────────────────────────────────────
export function buildCrashN(lumpSum, amt, per, annR, crashes) {
  const mr = annR / 12
  const norm = buildNorm(lumpSum, amt, per, annR)

  // 只取啟用且跌幅>0的崩盤，依時間排序
  const active = crashes
    .filter(c => c.enabled && c.drop > 0)
    .map(c => ({ ...c, mo: c.when * 12 }))
    .sort((a, b) => a.mo - b.mo)

  if (active.length === 0) return { vals: norm, fanStart: -1 }

  // 加權設定
  const WEIGHTS = {
    structural: { wA: 0.7, wB: 0.3 },
    liquidity:  { wA: 0.3, wB: 0.7 },
  }

  const out = new Float64Array(241)
  // 崩盤前跟著正常複利走
  for (let mo = 0; mo <= active[0].mo; mo++) out[mo] = norm[mo]

  let currentVals = new Float64Array(241)
  for (let mo = 0; mo <= 240; mo++) currentVals[mo] = norm[mo]

  // 逐次套用崩盤
  for (let ci = 0; ci < active.length; ci++) {
    const c = active[ci]
    const crashMo = c.mo
    const drop = c.drop
    const { wA, wB } = WEIGHTS[c.type] || WEIGHTS.liquidity

    // 崩盤當月：資產乘以 (1-drop%)
    const precrash = currentVals[crashMo]
    const bottom   = precrash * (1 - drop / 100)

    const next = new Float64Array(241)
    for (let mo = 0; mo <= crashMo; mo++) next[mo] = currentVals[mo]
    next[crashMo] = bottom

    // 崩盤後逐月計算融合值
    for (let mo = crashMo + 1; mo <= 240; mo++) {
      const moSince = mo - crashMo
      // 繼續扣款（若仍在投入期）
      const dcaAdd = mo <= per ? amt : 0

      // A演算法值（結構重置）
      const aVal = algoA(bottom, drop, annR, moSince) + dcaAdd * (moSince / 12)

      // B演算法值（流動性危機）：目標是趨勢線
      const trendNow = norm[mo]
      const bVal = algoB(bottom, drop, annR, moSince, trendNow) + dcaAdd * (moSince / 12) * 0.5

      next[mo] = Math.max(0, wA * aVal + wB * bVal)
    }

    currentVals = next
  }

  for (let mo = 0; mo <= 240; mo++) out[mo] = currentVals[mo]

  // 扇形從最後一次崩盤開始
  const fanStart = active[active.length - 1].mo

  return { vals: out, fanStart }
}

// 計算扇形上下緣（對數常態，±1σ）
export function calcFan(centralVals, fanStartMo, annVol) {
  const upper = new Float64Array(241)
  const lower = new Float64Array(241)
  for (let mo = 0; mo <= 240; mo++) {
    if (mo <= fanStartMo) {
      upper[mo] = centralVals[mo]
      lower[mo] = centralVals[mo]
    } else {
      const t = (mo - fanStartMo) / 12
      const sigma = annVol * Math.sqrt(t)
      upper[mo] = centralVals[mo] * Math.exp(sigma)
      lower[mo] = centralVals[mo] * Math.exp(-sigma)
    }
  }
  return { upper, lower }
}
