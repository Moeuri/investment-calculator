// 常數
export const EXP0 = 0.0043   // 0050 費用率
export const EXP1 = 0.00097  // 009816 費用率
export const DIV  = 0.027    // 0050 配息殖利率假設
export const TH   = 0.0211   // 二代健保補充費

// 高股息 ETF 資料
export const ETF_DATA = [
  {
    code: '0056', name: '元大高股息',
    freq: '季配', yield10yr: 0.065,
    divMonths: [1, 4, 7, 10],
    color: '#378ADD',
  },
  {
    code: '00878', name: '國泰永續高股息',
    freq: '季配', yield10yr: 0.07,
    divMonths: [3, 6, 9, 12],
    color: '#1D9E75',
  },
  {
    code: '00919', name: '群益精選高息',
    freq: '季配', yield10yr: 0.10,
    divMonths: [2, 5, 8, 11],
    color: '#BA7517',
  },
]

export const MONTH_NAMES = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']

// 崩盤歷史事件
export const CRASH_EVENTS = [
  { name: '1987 黑色星期一', drop: 34, rec: 24 },
  { name: '2000 科網泡沫',   drop: 49, rec: 86 },
  { name: '2008 金融海嘯',   drop: 57, rec: 65 },
  { name: '2020 疫情崩盤',   drop: 34, rec:  6 },
  { name: '2022 暴力升息',   drop: 28, rec: 24 },
]

// 格式化
export function fmtM(n) {
  if (!isFinite(n)) return '—'
  const a = Math.abs(n)
  if (a >= 1e8) return (n / 1e8).toFixed(2) + '億'
  if (a >= 1e4) return (n / 1e4).toFixed(1) + '萬'
  return Math.round(n).toLocaleString()
}
export function fmtF(n) { return Math.round(n).toLocaleString() + ' 元' }
export function fmtPA(r) { return (r * 100).toFixed(2) + '%' }
export function fmtP1(r) { return (r * 100).toFixed(1) + '%' }

// 建立正常複利月度序列（240個月）
export function buildNorm(amt, per, annR) {
  const mr = annR / 12
  const out = new Float64Array(241)
  let v = 0
  for (let mo = 1; mo <= 240; mo++) {
    v = mo <= per ? (v + amt) * (1 + mr) : v * (1 + mr)
    out[mo] = v
  }
  return out
}

// 建立單次崩盤序列
export function buildCrash1(amt, per, annR, crashMo, drop, recMo, model) {
  const mr = annR / 12
  const out = new Float64Array(241)
  let v = 0, gap = 0, boost = 0, flatEnd = 0
  for (let mo = 1; mo <= 240; mo++) {
    if (mo < crashMo) {
      v = mo <= per ? (v + amt) * (1 + mr) : v * (1 + mr)
    } else if (mo === crashMo) {
      v = mo <= per ? (v + amt) * (1 + mr) : v * (1 + mr)
      gap = v * drop / 100
      v *= (1 - drop / 100)
      if (recMo === 0) { boost = 0 }
      else if (model === 'V') { boost = gap / recMo; flatEnd = 0 }
      else { flatEnd = Math.floor(recMo * 0.5); boost = recMo - flatEnd > 0 ? gap / (recMo - flatEnd) : 0 }
    } else {
      v = mo <= per ? (v + amt) * (1 + mr) : v * (1 + mr)
      const ms = mo - crashMo
      if (ms <= recMo && !(model === 'U' && ms <= flatEnd)) v += boost
    }
    out[mo] = v
  }
  return out
}

// 建立兩次崩盤序列（在第一次崩盤序列基礎上疊加第二次）
export function buildCrash2(amt, per, annR, c1Mo, c1Drop, c1Rec, c1Model, c2Mo, c2Drop, c2Rec, c2Model) {
  const mr = annR / 12
  const out = new Float64Array(241)
  let v = 0
  // 崩盤1狀態
  let g1 = 0, b1 = 0, f1 = 0, crash1done = false
  // 崩盤2狀態
  let g2 = 0, b2 = 0, f2 = 0, crash2done = false

  for (let mo = 1; mo <= 240; mo++) {
    // 正常月增長 + 扣款
    v = mo <= per ? (v + amt) * (1 + mr) : v * (1 + mr)

    // 崩盤1衝擊
    if (mo === c1Mo) {
      g1 = v * c1Drop / 100; v *= (1 - c1Drop / 100)
      if (c1Rec === 0) { b1 = 0 }
      else if (c1Model === 'V') { b1 = g1 / c1Rec; f1 = 0 }
      else { f1 = Math.floor(c1Rec * 0.5); b1 = c1Rec - f1 > 0 ? g1 / (c1Rec - f1) : 0 }
      crash1done = true
    }
    // 崩盤2衝擊
    if (mo === c2Mo && c2Mo > c1Mo) {
      g2 = v * c2Drop / 100; v *= (1 - c2Drop / 100)
      if (c2Rec === 0) { b2 = 0 }
      else if (c2Model === 'V') { b2 = g2 / c2Rec; f2 = 0 }
      else { f2 = Math.floor(c2Rec * 0.5); b2 = c2Rec - f2 > 0 ? g2 / (c2Rec - f2) : 0 }
      crash2done = true
    }

    // 崩盤1恢復補償
    if (crash1done && mo > c1Mo) {
      const ms1 = mo - c1Mo
      if (ms1 <= c1Rec && !(c1Model === 'U' && ms1 <= f1)) v += b1
    }
    // 崩盤2恢復補償
    if (crash2done && mo > c2Mo) {
      const ms2 = mo - c2Mo
      if (ms2 <= c2Rec && !(c2Model === 'U' && ms2 <= f2)) v += b2
    }

    out[mo] = Math.max(0, v)
  }
  return out
}
