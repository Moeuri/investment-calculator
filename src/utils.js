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

// 崩盤歷史事件
export const CRASH_EVENTS = [
  { name: '1987 黑色星期一', drop: 34, type: 'liquidity',  note: '程式交易觸發的連鎖拋售，企業基本面未受影響，屬流動性危機' },
  { name: '2000 科網泡沫',   drop: 49, type: 'structural', note: '網路公司估值嚴重泡沫化，大量公司缺乏獲利基礎，屬結構重置' },
  { name: '2008 金融海嘯',   drop: 57, type: 'structural', note: '金融衍生品槓桿結構崩潰，系統性風險蔓延全球，屬結構重置' },
  { name: '2020 疫情崩盤',   drop: 34, type: 'liquidity',  note: '疫情引發恐慌性拋售，企業長期競爭力未受影響，屬流動性危機' },
  { name: '2022 暴力升息',   drop: 28, type: 'liquidity',  note: '貨幣政策緊縮造成資金重新定價，偏流動性危機（含部分結構影響）' },
]

export const MONTH_VOL = 0.18  // 台股年化波動率

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

// ─────────────────────────────────────────────────────────────────
// 正常複利序列（含一次性投入）
// 用於基準線、DCA分頁、通膨分頁等
// ─────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────
// 演算法 A：結構重置型（衰減成長，從底部重新出發）
//   底部震盪期 = -ln(1-drop) × 24 個月
//   衰減消退年限 T_decay = -ln(1-drop) × 15
//   衰減係數隨時間線性消退，T_decay後完全恢復正常年化
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
// 主崩盤函數 v2（混合批次追蹤法）
//
// 核心邏輯：
//   每次崩盤發生時，把「目前所有持有資產」合計為一個「持有池」
//   持有池乘以(1-drop)後，用A/B加權融合路徑恢復
//   崩盤後新投入的每一筆資金，各自按正常年化獨立追蹤
//   第二次崩盤時，把「持有池的當前恢復值」+「第一次崩盤後至今的新投入合計」
//   再次合併成新的持有池，重新走融合恢復路徑
//
// 參數：
//   lumpSum: 第0月一次性投入
//   amt: 每月定期定額
//   per: 定期定額總期數
//   annR: 正常年化報酬率
//   crashes: [{ when(年), drop, type, enabled }]，已排序
//
// 回傳：{ vals: Float64Array(241), fanStart: number }
// ─────────────────────────────────────────────────────────────────
export function buildCrashN(lumpSum, amt, per, annR, crashes) {
  const mr = annR / 12
  const ls = lumpSum || 0

  // 篩選出啟用且跌幅>0的崩盤，依時間排序
  const active = crashes
    .filter(c => c.enabled && c.drop > 0)
    .map(c => ({ ...c, mo: c.when * 12 }))
    .sort((a, b) => a.mo - b.mo)

  // 沒有崩盤：直接回傳正常複利
  if (active.length === 0) {
    return { vals: buildNorm(ls, amt, per, annR), fanStart: -1 }
  }

  const out = new Float64Array(241)

  // ── 狀態變數 ──────────────────────────────────────────
  // holdPool: 持有池的當前值（崩前資產合計，已承受崩盤衝擊，正在恢復中）
  // holdPool_bottom: 持有池在最近一次崩盤時的底部值（用於計算恢復進度）
  // holdPool_trend: 持有池對應的趨勢線起點（崩盤前的正常複利值）
  // holdPool_crashMo: 最近一次崩盤的月份
  // holdPool_type: 最近一次崩盤的類型
  // holdPool_drop: 最近一次崩盤的跌幅
  // postCrashBatches: 崩後投入的批次 [{investMo, value}]
  //   每個批次獨立複利，遇到新崩盤時合入持有池

  let holdPool         = 0   // 持有池當前值
  let holdPool_bottom  = 0   // 持有池底部值
  let holdPool_trend   = 0   // 持有池趨勢線起點
  let holdPool_crashMo = -1  // 上次崩盤月
  let holdPool_type    = 'structural'
  let holdPool_drop    = 0

  // 崩後投入批次：{ investMo, amt, crashCount }
  // crashCount 記錄這個批次已承受幾次崩盤（用於後續崩盤的合併）
  let postBatches = []

  let crashIdx = 0  // 下一個要處理的崩盤索引

  // 第0月：一次性投入放入「待持有」（尚未崩盤前視為正常資產）
  // 我們用一個「pre-crash 正常複利累積值」來追蹤崩盤前的資產
  // 崩盤發生時再合入 holdPool

  // ── 逐月推進 ──────────────────────────────────────────
  for (let mo = 1; mo <= 240; mo++) {

    // ── 1. 檢查這個月是否發生崩盤 ──
    if (crashIdx < active.length && mo === active[crashIdx].mo) {
      const crash = active[crashIdx]
      const drop  = crash.drop
      const type  = crash.type
      const wA    = type === 'structural' ? 0.7 : 0.3
      const wB    = type === 'structural' ? 0.3 : 0.7

      // 1a. 計算崩盤前這個月的正常資產值（先計算當月投入和複利）
      //     這月如果還在投入期，先扣款再崩盤
      let precrashVal = 0

      // 持有池在崩盤前這個月的值
      if (holdPool_crashMo < 0) {
        // 還沒有崩過：持有池就是從第0月開始的正常複利
        const moFromStart = mo
        let normalVal = ls * Math.pow(1 + mr, moFromStart)
        // 加上之前每月定期定額的累積
        for (let k = 1; k < mo && k <= per; k++) {
          normalVal += amt * Math.pow(1 + mr, mo - k)
        }
        // 這個月如果在投入期，加上當月扣款
        if (mo <= per) normalVal += amt
        precrashVal = normalVal
      } else {
        // 已經崩過：持有池 + 崩後批次 + 當月扣款
        const moSince = mo - holdPool_crashMo
        // 持有池當前恢復值
        const aVal = algoAmonthly(holdPool_bottom, holdPool_drop, annR, moSince)
        const trendNow = holdPool_trend * Math.pow(1 + mr, moSince)
        const bVal = algoBmonthly(holdPool_bottom, holdPool_drop, annR, moSince, trendNow)
        const poolVal = wA * aVal + wB * bVal  // 用上一次崩盤的權重

        // 崩後批次各自的正常複利值
        let batchesVal = 0
        for (const b of postBatches) {
          const age = mo - b.investMo
          batchesVal += b.amt * Math.pow(1 + mr, age)
        }

        // 當月扣款（如果在投入期）
        const thisMonthAmt = mo <= per ? amt : 0

        precrashVal = poolVal + batchesVal + thisMonthAmt
      }

      // 1b. 崩盤衝擊：整體資產乘以(1-drop%)
      const bottomVal = precrashVal * (1 - drop / 100)

      // 1c. 更新持有池狀態
      holdPool         = bottomVal
      holdPool_bottom  = bottomVal
      holdPool_trend   = precrashVal  // 趨勢線起點 = 崩盤前資產值
      holdPool_crashMo = mo
      holdPool_type    = type
      holdPool_drop    = drop

      // 1d. 清空崩後批次（已合入持有池）
      postBatches = []

      out[mo] = Math.max(0, bottomVal)
      crashIdx++
      continue
    }

    // ── 2. 非崩盤月：正常計算 ──
    if (holdPool_crashMo < 0) {
      // 還未發生任何崩盤：正常複利
      let v = ls * Math.pow(1 + mr, mo)
      for (let k = 1; k < mo && k <= per; k++) {
        v += amt * Math.pow(1 + mr, mo - k)
      }
      if (mo <= per) v += amt * Math.pow(1 + mr, 0)  // 當月投入，還沒複利
      // 修正：當月投入就算當月複利
      // 實際上每月初投入，月底結算
      out[mo] = Math.max(0, v)
    } else {
      // 已發生崩盤：持有池恢復 + 崩後批次各自複利
      const lastCrash = active[crashIdx - 1]
      const wA = lastCrash.type === 'structural' ? 0.7 : 0.3
      const wB = lastCrash.type === 'structural' ? 0.3 : 0.7
      const moSince = mo - holdPool_crashMo

      // 持有池融合恢復
      const aVal = algoAmonthly(holdPool_bottom, holdPool_drop, annR, moSince)
      const trendNow = holdPool_trend * Math.pow(1 + mr, moSince)
      const bVal = algoBmonthly(holdPool_bottom, holdPool_drop, annR, moSince, trendNow)
      const poolVal = wA * aVal + wB * bVal

      // 崩後批次各自正常複利（低點進場，不受衰減影響）
      let batchesVal = 0
      for (const b of postBatches) {
        const age = mo - b.investMo
        batchesVal += b.amt * Math.pow(1 + mr, age)
      }

      // 當月新投入（如果在投入期），加入崩後批次
      if (mo <= per) {
        postBatches.push({ investMo: mo, amt: amt })
        batchesVal += amt  // 當月投入，當月算起
      }

      out[mo] = Math.max(0, poolVal + batchesVal)
    }
  }

  // ── 第0月的一次性投入沒有計入崩盤前的正常複利計算 ──
  // 修正：用更乾淨的方式重算崩盤前的序列
  // 上面的非崩盤月計算用了 O(N^2) 的方式，改用遞推

  // 重新整理：用乾淨的逐月遞推替代上面的計算
  return buildCrashClean(ls, amt, per, annR, active)
}

// ─────────────────────────────────────────────────────────────────
// 乾淨的逐月遞推版本（替代上面有 O(N^2) 問題的版本）
// ─────────────────────────────────────────────────────────────────
function buildCrashClean(ls, amt, per, annR, active) {
  const mr = annR / 12

  const out = new Float64Array(241)

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

  for (let mo = 1; mo <= 240; mo++) {
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
export function calcFan(centralVals, fanStartMo, annVol) {
  const upper = new Float64Array(241)
  const lower = new Float64Array(241)
  for (let mo = 0; mo <= 240; mo++) {
    if (mo <= fanStartMo) {
      upper[mo] = centralVals[mo]
      lower[mo] = centralVals[mo]
    } else {
      const t     = (mo - fanStartMo) / 12
      const sigma = annVol * Math.sqrt(t)
      upper[mo]   = centralVals[mo] * Math.exp(sigma)
      lower[mo]   = centralVals[mo] * Math.exp(-sigma)
    }
  }
  return { upper, lower }
}
