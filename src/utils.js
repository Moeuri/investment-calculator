// 常數：集中於 config.js，此處 re-export 維持既有 import 路徑
export {
  EXP0, EXP1, DIV, TH, MONTH_VOL,
  SAFE_WITHDRAWAL_RATE, COMPARE_DATE,
  ETF_DATA, CRASH_EVENTS,
} from './config'

export const MONTH_NAMES = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']

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

// 名目→實質：扣除通膨後的「今日購買力」。
//   nominal：第 years 年的名目值；infl：年通膨率；years：距今年數。
//   各分頁的「實質購買力」切換統一呼叫此函數，集中口徑。
export function toReal(nominal, infl, years) {
  return nominal / Math.pow(1 + (infl || 0), years)
}

// ─────────────────────────────────────────────────────────────────
// 正常複利序列（含一次性投入）
// 用於基準線、DCA分頁、通膨分頁等
//
// 時點假設：每月於「月初」投入並立即享當月複利
//   （v = (v + amt) × (1 + mr)）。此為刻意設計，較「月底投入」
//   略偏樂觀（約高 0.5~1%）。各分頁說明已標明。
// index 0 = 第0月（起點），等於一次性投入本金。
// ─────────────────────────────────────────────────────────────────
export function buildNorm(lumpSum, amt, per, annR, months = 240) {
  const mr = annR / 12
  const out = new Float64Array(months + 1)
  let v = lumpSum || 0
  out[0] = v                         // 起點 = 一次性投入本金
  for (let mo = 1; mo <= months; mo++) {
    v = mo <= per ? (v + amt) * (1 + mr) : v * (1 + mr)
    out[mo] = v
  }
  return out
}

// ─────────────────────────────────────────────────────────────────
// 演算法 A：結構重置型（衰減成長，從底部重新出發）
//   底部震盪期 = -ln(1-drop) × 24 個月
//   線性恢復年限 T_decay = -ln(1-drop) × 15（年）
//   成長率隨時間「線性」從衰減態恢復；T_decay 年後完全回到正常年化。
//   （註：此處為線性恢復，非指數半衰期。）
// ─────────────────────────────────────────────────────────────────
function algoAmonthly(bottomVal, drop, annR, monthsAfter) {
  const shakeMo  = Math.round(-Math.log(1 - drop / 100) * 24)
  const T_decay  = -Math.log(1 - drop / 100) * 15  // 年
  const mr = annR / 12
  let v = bottomVal
  for (let m = 1; m <= monthsAfter; m++) {
    const tYr = m / 12
    const decayFactor = Math.max(0, 1 - tYr / T_decay)
    const decayedR = annR * (1 - (1 - Math.pow(1 - drop / 100, 0.5)) * decayFactor)
    const mr_eff = decayedR / 12
    if (m <= shakeMo) {
      // 震盪期：極低成長
      v *= (1 + mr_eff * 0.1)
    } else {
      v *= (1 + mr_eff)
    }
  }
  return v
}

// ─────────────────────────────────────────────────────────────────
// 演算法 B：流動性危機型（趨向趨勢線）
//   趨勢線 = 崩盤前資產在崩盤月的正常複利延伸
//   恢復函數：指數飽和
// ─────────────────────────────────────────────────────────────────
function algoBmonthly(bottomVal, drop, annR, monthsAfter, trendAtMonth) {
  const lambda = Math.log(2) / (-Math.log(1 - drop / 100) * 6)
  const mr = annR / 12
  const progress = 1 - Math.exp(-lambda * monthsAfter)
  const grownBottom = bottomVal * Math.pow(1 + mr, monthsAfter)
  return grownBottom + (trendAtMonth - grownBottom) * progress
}

// ─────────────────────────────────────────────────────────────────
// 主崩盤函數（混合批次追蹤法）— 對外入口
//
// 核心邏輯（實作於 buildCrashClean）：
//   每次崩盤發生時，把「目前所有持有資產」合計為一個「持有池」
//   持有池乘以(1-drop)後，用A/B加權融合路徑恢復
//   崩盤後新投入的每一筆資金，各自按正常年化獨立追蹤
//   下次崩盤時，把「持有池當前恢復值」+「崩後新投入合計」再合併成新持有池
//
// 參數：
//   lumpSum: 第0月一次性投入
//   amt: 每月定期定額
//   per: 定期定額總期數
//   annR: 正常年化報酬率
//   crashes: [{ when(年), drop, type, enabled }]
//
// 回傳：{ vals: Float64Array(months+1), fanStart: number }
//   months 預設 240（20年），可傳入更長觀察年限。
// ─────────────────────────────────────────────────────────────────
export function buildCrashN(lumpSum, amt, per, annR, crashes, months = 240) {
  const ls = lumpSum || 0

  // 篩選出啟用且跌幅>0的崩盤，依時間排序
  const sorted = crashes
    .filter(c => c.enabled && c.drop > 0)
    .map(c => ({ ...c, mo: c.when * 12 }))
    .sort((a, b) => a.mo - b.mo)

  // 合併同月崩盤：避免同月多筆造成 crashIdx 卡死、後續崩盤不觸發。
  //   合成跌幅 = 1 - ∏(1 - dropᵢ)；type 取原始跌幅較大者。
  const active = []
  for (const c of sorted) {
    const last = active[active.length - 1]
    if (last && last.mo === c.mo) {
      const combined = 1 - (1 - last.drop / 100) * (1 - c.drop / 100)
      last.drop = combined * 100
      if (c.drop > last._maxDrop) { last.type = c.type; last._maxDrop = c.drop }
    } else {
      active.push({ ...c, _maxDrop: c.drop })
    }
  }

  // 沒有崩盤：直接回傳正常複利
  if (active.length === 0) {
    return { vals: buildNorm(ls, amt, per, annR, months), fanStart: -1 }
  }

  return buildCrashClean(ls, amt, per, annR, active, months)
}

// ─────────────────────────────────────────────────────────────────
// 乾淨的逐月遞推版本
// ─────────────────────────────────────────────────────────────────
function buildCrashClean(ls, amt, per, annR, active, months = 240) {
  const mr = annR / 12

  const out = new Float64Array(months + 1)

  // 狀態
  let holdPool       = ls          // 持有池（含一次性投入，從第0月開始）
  let holdPoolBottom = 0
  let holdPoolTrend  = 0
  let holdPoolCrashMo = -1
  let holdPoolDrop   = 0
  let holdPoolType   = 'structural'

  // 崩後批次：每個元素 { value: 當前值 }（每月更新）
  let postBatches = []

  let crashIdx = 0

  out[0] = ls                       // 起點 = 一次性投入本金

  for (let mo = 1; mo <= months; mo++) {
    // ── Step 1：先對持有池和崩後批次執行這個月的複利 ──
    holdPool = holdPool * (1 + mr)
    for (const b of postBatches) {
      b.value = b.value * (1 + mr)
    }

    // ── Step 2：這個月如果在投入期，加入新資金 ──
    //   如果還沒崩盤 → 加到持有池
    //   如果已崩盤   → 加入崩後批次（低點進場，獨立追蹤）
    if (mo <= per) {
      if (holdPoolCrashMo < 0) {
        // 還沒崩盤，新投入直接加到持有池
        holdPool += amt
      } else {
        // 已崩盤，新投入加入崩後批次（不受衰減影響）
        postBatches.push({ value: amt })
      }
    }

    // ── Step 3：檢查這個月是否發生崩盤 ──
    if (crashIdx < active.length && mo === active[crashIdx].mo) {
      const crash = active[crashIdx]
      const drop  = crash.drop / 100
      const type  = crash.type

      // 把崩後批次也合入持有池（它們也要承受這次崩盤）
      let totalPool = holdPool
      for (const b of postBatches) totalPool += b.value
      postBatches = []  // 清空，全部合入

      // 崩盤衝擊
      const bottomVal    = totalPool * (1 - drop)
      const preCrashVal  = totalPool  // 崩盤前的資產值（趨勢線起點）

      // 更新持有池狀態
      holdPool        = bottomVal
      holdPoolBottom  = bottomVal
      holdPoolTrend   = preCrashVal
      holdPoolCrashMo = mo
      holdPoolDrop    = crash.drop
      holdPoolType    = type

      out[mo] = Math.max(0, bottomVal)
      crashIdx++
      continue
    }

    // ── Step 4：如果已崩盤，用融合演算法覆蓋持有池的值 ──
    //   持有池的複利（Step 1）是個粗估，用融合演算法替換掉
    if (holdPoolCrashMo >= 0) {
      const moSince = mo - holdPoolCrashMo
      const wA = holdPoolType === 'structural' ? 0.7 : 0.3
      const wB = holdPoolType === 'structural' ? 0.3 : 0.7

      const aVal     = algoAmonthly(holdPoolBottom, holdPoolDrop, annR, moSince)
      const trendNow = holdPoolTrend * Math.pow(1 + mr, moSince)
      const bVal     = algoBmonthly(holdPoolBottom, holdPoolDrop, annR, moSince, trendNow)

      holdPool = Math.max(0, wA * aVal + wB * bVal)
    }

    // ── Step 5：總資產 = 持有池 + 所有崩後批次 ──
    let total = holdPool
    for (const b of postBatches) total += b.value
    out[mo] = Math.max(0, total)
  }

  // 扇形從最後一次崩盤開始
  const fanStart = active.length > 0 ? active[active.length - 1].mo : -1

  return { vals: out, fanStart }
}

// ─────────────────────────────────────────────────────────────────
// 計算扇形上下緣（對數常態，±1σ，從崩盤點出發）
// ─────────────────────────────────────────────────────────────────
export function calcFan(centralVals, fanStartMo, annVol, months = 240) {
  const upper = new Float64Array(months + 1)
  const lower = new Float64Array(months + 1)
  const start = Math.min(fanStartMo, months)
  for (let mo = 0; mo <= months; mo++) {
    const c = centralVals[mo]
    if (mo <= start || !isFinite(c)) {
      upper[mo] = c
      lower[mo] = c
    } else {
      const t     = (mo - start) / 12
      const sigma = annVol * Math.sqrt(t)
      upper[mo]   = c * Math.exp(sigma)
      lower[mo]   = c * Math.exp(-sigma)
    }
  }
  return { upper, lower }
}
