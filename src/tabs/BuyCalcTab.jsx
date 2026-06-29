import { useState } from 'react'
import { Card, Note, SectionTitle, Divider } from '../components'

const FEE_RATE = 0.001425  // 手續費率
const MIN_FEE  = 20        // 最低手續費

// 台灣股票跳動級距
function getTickSize(price) {
  const p = Number(price) || 0
  if (p < 10)   return 0.01
  if (p < 50)   return 0.05
  if (p < 100)  return 0.1
  if (p < 500)  return 0.5
  if (p < 1000) return 1
  return 5
}

// 可點擊輸入的數字欄位
function NumInput({ label, value, onChange, placeholder, step, suffix }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 'var(--font-sm)', color: 'var(--c-text2)', marginBottom: 5 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="number"
          inputMode="decimal"
          step={step || 'any'}
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          style={{
            flex: 1, fontSize: 'var(--font-base)', fontWeight: 600,
            padding: '9px 12px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--c-border2)', background: 'var(--c-bg)',
            color: 'var(--c-text)', outline: 'none', width: '100%',
          }}
        />
        {suffix && <span style={{ fontSize: 'var(--font-sm)', color: 'var(--c-text3)', flexShrink: 0 }}>{suffix}</span>}
      </div>
    </div>
  )
}

export default function BuyCalcTab() {
  const [budget, setBudget] = useState('')
  const [price,  setPrice]  = useState('')

  const b = Number(budget) || 0
  const p = Number(price)  || 0
  const valid = b > 0 && p > 0
  const hasError = (budget !== '' && !(Number(budget) > 0)) || (price !== '' && !(Number(price) > 0))

  // 計算
  let lots = 0, lotAmt = 0, oddShares = 0, oddAmt = 0, used = 0, remain = 0, fee = 0, totalCost = 0, usedPct = 0
  if (valid) {
    const lotUnitPrice = p * 1000
    lots      = Math.floor(b / lotUnitPrice)
    lotAmt    = lots * lotUnitPrice
    const afterLot = b - lotAmt
    oddShares = Math.floor(afterLot / p)
    oddAmt    = oddShares * p
    used      = lotAmt + oddAmt
    remain    = b - used
    // 手續費（整張和零股合計股數 × 價格，再 × 費率，最低20元）
    const rawFee = used * FEE_RATE
    fee       = used > 0 ? Math.max(MIN_FEE, Math.round(rawFee)) : 0
    totalCost = used + fee
    usedPct   = b > 0 ? (used / b) * 100 : 0
  }

  const totalShares = lots * 1000 + oddShares

  return (
    <div>
      <SectionTitle>單期買入試算</SectionTitle>
      <Note type="info" mt={0}>
        輸入本期預算與目前股價，自動計算在預算內能買進的最大張數與零股數量。
        純試算工具，不記錄任何資料。適合定期定額扣款日當天，快速抓出該買多少。
      </Note>

      <div style={{ marginTop: 16 }}>
        <NumInput
          label="本次預算"
          value={budget}
          onChange={setBudget}
          placeholder="例：50000"
          suffix="元"
        />
        <NumInput
          label="現在整張參考價"
          value={price}
          onChange={setPrice}
          placeholder="例：107.15"
          step={getTickSize(price)}
          suffix="元/股"
        />
        {valid && (
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--c-text3)', marginTop: -4, marginBottom: 4 }}>
            目前股價的跳動級距為 {getTickSize(price)} 元；整張＝1,000 股，整張單價 {(p * 1000).toLocaleString()} 元。
          </div>
        )}
        {hasError && (
          <Note type="red" mt={4}>⚠️ 預算與股價必須為大於 0 的數字，請重新輸入。</Note>
        )}
      </div>

      {valid ? (
        <>
          <Divider />

          {/* 建議買入 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 8 }}>
            <Card label="建議買整張" value={`${lots} 張`} sub={`花費 ${lotAmt.toLocaleString()} 元`} accent="var(--c-blue)" />
            <Card label="剩餘買零股" value={`${oddShares} 股`} sub={`花費 ${oddAmt.toLocaleString()} 元`} accent="var(--c-green)" />
          </div>

          {/* 合計 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 12 }}>
            <Card label="合計買進股數" value={`${totalShares.toLocaleString()} 股`} sub={`${lots} 張 ${oddShares} 股`} />
            <Card label="預算使用率" value={`${usedPct.toFixed(1)}%`} sub={`剩餘 ${remain.toLocaleString()} 元未用`} />
          </div>

          {/* 預算分配堆疊條 */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 'var(--font-sm)', color: 'var(--c-text2)', marginBottom: 5 }}>預算分配</div>
            <div style={{ display: 'flex', height: 24, borderRadius: 'var(--radius)', overflow: 'hidden', fontSize: 'var(--font-2xs)', fontWeight: 600 }}>
              <div style={{ flex: used, background: 'var(--c-blue-bg)', color: 'var(--c-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0, overflow: 'hidden' }}>股票</div>
              {fee > 0 && <div style={{ flex: Math.max(fee, b * 0.02), background: 'var(--c-red-bg)', color: 'var(--c-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0, overflow: 'hidden' }}>費</div>}
              {remain > 0 && <div style={{ flex: remain, background: 'var(--c-bg3)', color: 'var(--c-text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0, overflow: 'hidden' }}>剩餘</div>}
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 'var(--font-xs)', color: 'var(--c-text3)', flexWrap: 'wrap' }}>
              <span>🟦 股票花費 {used.toLocaleString()} 元</span>
              <span>🟥 手續費 {fee.toLocaleString()} 元</span>
              <span>⬜ 剩餘 {remain.toLocaleString()} 元</span>
            </div>
          </div>

          {/* 費用明細 */}
          <div style={{ background: 'var(--c-bg2)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--c-text)', marginBottom: 8 }}>費用試算</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)', color: 'var(--c-text2)', marginBottom: 5 }}>
              <span>股票花費（整張＋零股）</span>
              <span style={{ fontWeight: 600 }}>{used.toLocaleString()} 元</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)', color: 'var(--c-text2)', marginBottom: 5 }}>
              <span>手續費（0.1425%，最低 20 元）</span>
              <span style={{ fontWeight: 600, color: 'var(--c-red)' }}>+{fee.toLocaleString()} 元</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-base)', color: 'var(--c-text)', fontWeight: 700, paddingTop: 6, borderTop: '1px solid var(--c-border)' }}>
              <span>合計實際支出</span>
              <span>{totalCost.toLocaleString()} 元</span>
            </div>
          </div>

          <Note type="warn" mt={12}>
            ⚠️ 實際成交價會因盤中波動而與參考價不同（尤其零股盤每3分鐘集合競價一次），建議零股部分預留約 1–2% 緩衝，避免下單時因價格跳動而超出預算。手續費以一般 0.1425% 計算，未計入券商折讓，實際以券商收費為準。
          </Note>
        </>
      ) : (
        <Note type="note" mt={16}>請輸入本次預算與整張參考價，即可看到試算結果。</Note>
      )}
    </div>
  )
}
