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

// 崩盤歷史事件（含歷史恢復模型對應）
export const CRASH_EVENTS = [
  { name: '1987 黑色星期一', drop: 34, rec: 24, model: 'V', modelNote: '快速V型反彈，約2年回高點'       },
  { name: '2000 科網泡沫',   drop: 49, rec: 86, model: 'U', modelNote: 'U型盤整，完整恢復長達15年'      },
  { name: '2008 金融海嘯',   drop: 57, rec: 65, model: 'U', modelNote: 'U型，低點盤整1-2年後緩慢爬升'   },
  { name: '2020 疫情崩盤',   drop: 34, rec:  6, model: 'V', modelNote: '教科書V型，6個月閃回歷史新高'   },
  { name: '2022 暴力升息',   drop: 28, rec: 24, model: 'V', modelNote: '偏V型緩步回升，約2年完整恢復'   },
]

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
      gap = v * drop / 100; v *= (1 - drop / 100)
      if (recMo === 0) { boost = 0 }
      else if (model === 'V') { boost = gap / recMo; flatEnd = 0 }
      else { flatEnd = Math.floor(recMo * 0.5); boost = recMo - flatEnd > 0 ? gap / (recMo - flatEnd) : 0 }
    } else {
      v = mo <= per ? (v + amt) * (1 + mr) : v * (1 + mr)
      const ms = mo - crashMo
      if (ms <= recMo && !(model === 'U' && ms <= flatEnd)) v += boost
    }
    out[mo] = Math.max(0, v)
  }
  return out
}

// 建立多次崩盤序列（最多3次，傳入陣列）
export function buildCrashN(amt, per, annR, crashes) {
  // crashes: [{ when(年), drop, rec, model, enabled }]
  const mr = annR / 12
  const out = new Float64Array(241)
  let v = 0

  // 依發生時間排序，只取 enabled 的
  const active = crashes
    .filter(c => c.enabled && c.drop > 0)
    .map(c => ({ ...c, mo: c.when * 12 }))
    .sort((a, b) => a.mo - b.mo)

  // 每個崩盤的恢復狀態
  const states = active.map(c => {
    let boost = 0, flatEnd = 0
    return { ...c, boost, flatEnd, triggered: false }
  })

  for (let mo = 1; mo <= 240; mo++) {
    v = mo <= per ? (v + amt) * (1 + mr) : v * (1 + mr)

    for (const s of states) {
      if (mo === s.mo && !s.triggered) {
        const gap = v * s.drop / 100
        v *= (1 - s.drop / 100)
        s.triggered = true
        if (s.rec === 0) { s.boost = 0 }
        else if (s.model === 'V') { s.boost = gap / s.rec; s.flatEnd = 0 }
        else { s.flatEnd = Math.floor(s.rec * 0.5); s.boost = s.rec - s.flatEnd > 0 ? gap / (s.rec - s.flatEnd) : 0 }
      }
      if (s.triggered && mo > s.mo) {
        const ms = mo - s.mo
        if (ms <= s.rec && !(s.model === 'U' && ms <= s.flatEnd)) v += s.boost
      }
    }

    out[mo] = Math.max(0, v)
  }
  return out
}
