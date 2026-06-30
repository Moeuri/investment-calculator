import { useMemo, useState } from 'react'
import { Card, Note, Slider, PhaseBar, SectionTitle, InvestChart, Legend, Divider } from '../components'
import { buildNorm, fmtM, fmtPA, EXP0, EXP1, DIV, TH } from '../utils'

const TAX_OPTS = [
  { v: 0,    label: '免稅' },
  { v: 0.05, label: '5%'  },
  { v: 0.12, label: '12%' },
  { v: 0.20, label: '20%' },
  { v: 0.30, label: '30%' },
  { v: 0.40, label: '40%' },
]

const DR_PRESETS = [
  { v: 0.04,  label: '悲劇 4%',        tag: '日本失落30年',         note: '錨點：日本失落的30年（1990–2020）。日經225從1989年高點崩跌，花了30年才回到同等水位，期間含息年化約3–4%。代表「台灣走上日本老路」的極端悲觀情境。' },
  { v: 0.06,  label: '悲觀 6%',        tag: '台股橫盤20年',         note: '錨點：台股橫盤期（1990–2010）。加權指數在12682點崩跌後，歷經20年反覆震盪，多次挑戰前高均失敗，含息年化約5–6%。代表「指數漲不動、只靠配息撐報酬」的本土悲觀情境。' },
  { v: 0.08,  label: '全球保守 8%',    tag: 'S&P500 百年均值',      note: '錨點：S&P500從1928年至2024年完整96年含息年化約9.8%，扣除通膨後實質報酬約6.5–7%，加回台灣通膨（約1.5–2%）還原為名目值約8%。全球分散投資長期合理預期的中位值。' },
  { v: 0.105, label: '台股歷史 10.5%', tag: '0050上市完整歷史',      note: '錨點：0050從2003年上市至2024年底，完整21年含息年化。已包含2008年-57%金融海嘯、2022年暴力升息等完整熊市週期。注意：含台積電崛起這個難以複製的結構性因素。' },
  { v: 0.13,  label: '樂觀 13%',       tag: '台股突破前高後多頭',   note: '錨點：0050從2016年突破1990年前高後至2024年底，含息年化約13–14%。代表台灣科技業在全球供應鏈重組後持續受惠、AI應用加速滲透的樂觀延續情境，已比2020–2024實際數字保守下修。' },
  { v: 0.18,  label: '賭性狂徒 18%',   tag: '2020疫情低點後AI行情', note: '錨點：0050從2020年3月疫情低點至2024年底，含息年化約18–22%。疫情後流動性寬鬆、AI題材爆發、台積電全球定價權確立三重因素疊加的歷史最強多頭區段。幾乎不可能長期持續，僅供極端樂觀壓力測試。' },
]

// 0050 配息現金流累積（不再投入）
function build0050CashFlow(lumpSum, amt, per, annR, reinvestRate, months = 240) {
  const mr = annR / 12
  const divYield = DIV  // 年化配息率
  const out = new Float64Array(months + 1)  // 帳面資產（不含已領配息）
  const cashOut = new Float64Array(months + 1) // 累積已領出配息
  let v = lumpSum || 0
  let totalCash = 0

  for (let mo = 1; mo <= months; mo++) {
    if (mo <= per) v = (v + amt) * (1 + mr)
    else v = v * (1 + mr)

    // 每半年配息（1月=第1,13,25...月，7月=第7,19,31...月 → 簡化為每6個月）
    if (mo % 6 === 0) {
      const divAmt = v * (divYield / 2)
      const netDiv = divAmt * (1 - reinvestRate)  // 未再投入的部分領出
      const reinvest = divAmt * reinvestRate       // 再投入的部分
      totalCash += netDiv
      v -= divAmt   // 除息
      v += reinvest // 再投入部分買回
    }
    out[mo] = v
    cashOut[mo] = totalCash
  }
  return { asset: out, cash: cashOut }
}

export default function DCATab({ state, set }) {
  const { amt, dr, tax, lumpSum, reinvestRate } = state
  const years  = state.years ?? 20            // 觀察年限
  const months = years * 12
  const infl   = state.infl ?? 0.02           // 年通膨率（沿用全域，於通膨分頁設定）
  const perMax = months                        // 扣款期數上限＝觀察年限
  const per    = Math.min(state.per, perMax)   // 有效扣款期數（不超過觀察年限）
  const r1   = dr + 0.01 - EXP1
  const r0t  = dr - EXP0 - DIV * (tax + TH)
  const ls   = lumpSum || 0
  const rr   = reinvestRate !== undefined ? reinvestRate : 1  // 預設100%再投入
  const cost = ls + amt * per

  const [realMode, setRealMode] = useState(false)  // 實質購買力（扣通膨）切換
  // 折現因子：第 y 年的名目值除以此值＝今日購買力
  const realDiv = y => realMode ? Math.pow(1 + infl, y) : 1

  const activePreset = DR_PRESETS.find(p => p.v === dr)

  const { norm9816, norm0050, cash0050 } = useMemo(() => {
    const norm9816 = buildNorm(ls, amt, per, r1, months)
    const { asset: norm0050, cash: cash0050 } = build0050CashFlow(ls, amt, per, r0t, rr, months)
    return { norm9816, norm0050, cash0050 }
  }, [ls, amt, per, r1, r0t, rr, months])

  const modeDesc = (() => {
    if (ls === 0 && amt > 0)  return `純定期定額：每月 ${fmtM(amt)}，共 ${per} 期，總投入 ${fmtM(amt * per)}`
    if (ls > 0  && amt === 0) return `純一次性投入：今日投入 ${fmtM(ls)}，之後持有複利，無定期扣款`
    if (ls > 0  && amt > 0)   return `今日投入 ${fmtM(ls)}，第1至${per}個月每月追加 ${fmtM(amt)}，總投入 ${fmtM(cost)}`
    return '請設定投入金額'
  })()

  const showCashFlow = rr < 1  // 只有部分再投入時才顯示現金流線

  const chartData = useMemo(() => {
    return Array.from({ length: years }, (_, i) => {
      const y = i + 1, mo = y * 12
      const d = realDiv(y)
      const row = {
        year:     `${y}年`,
        '009816': Math.round(norm9816[mo] / d),
        '0050帳面資產': Math.round(norm0050[mo] / d),
        '總投入': Math.round(Math.min(cost, ls + amt * mo) / d),
      }
      if (showCashFlow) {
        row['0050累積已領配息'] = Math.round(cash0050[mo] / d)
      }
      return row
    })
  }, [norm9816, norm0050, cash0050, cost, ls, amt, showCashFlow, years, realMode, infl])

  const perLabel = per % 12 === 0
    ? `${per}期（${per/12}年）`
    : `${per}期（${Math.floor(per/12)}年${per%12}個月）`

  // 觀察年限末的折現因子（套用於摘要卡）
  const endDiv = realDiv(years)
  // 觀察年限末累積已領配息
  const totalCashReceived = cash0050[months] / endDiv
  // 0050「總回報」= 帳面資產 + 累積已領配息
  const norm0050End = norm0050[months] / endDiv
  const norm9816End = norm9816[months] / endDiv
  const total0050 = norm0050End + totalCashReceived

  return (
    <div>
      <SectionTitle>投入參數</SectionTitle>

      <Slider label="一次性投入金額" min={0} max={10000000} step={10000}
        value={ls} onChange={v => set('lumpSum', v)}
        fmt={v => v === 0 ? '0（不啟用）' : fmtM(v)} />

      <Slider label="每月定期定額" min={0} max={500000} step={1000}
        value={amt} onChange={v => set('amt', v)}
        fmt={v => v === 0 ? '0（純一次性）' : v.toLocaleString() + ' 元'} />

      <div style={{ fontSize: 'var(--font-sm)', color: 'var(--c-text3)', background: 'var(--c-bg2)', borderRadius: 6, padding: '7px 10px', marginBottom: 10 }}>
        📋 {modeDesc}
      </div>

      {amt > 0 && (
        <Slider label="定期定額期數" min={6} max={perMax} step={1}
          value={per} onChange={v => set('per', v)}
          fmt={v => v % 12 === 0 ? `${v}期（${v/12}年）` : `${v}期（${Math.floor(v/12)}年${v%12}個月）`} />
      )}

      <Slider label="觀察年限" min={10} max={40} step={1}
        value={years} onChange={v => set('years', v)}
        fmt={v => `${v} 年`} />

      <Divider />

      {/* 報酬率六檔 */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 'var(--font-md)', color: 'var(--c-text2)', marginBottom: 8 }}>年化報酬率情境</div>
        <div className="grid3" style={{ gap: 6 }}>
          {DR_PRESETS.map(p => {
            const on = dr === p.v
            return (
              <button key={p.v} onClick={() => set('dr', p.v)} style={{
                padding: '9px 10px', borderRadius: 'var(--radius-sm)', textAlign: 'left',
                border: `0.5px solid ${on ? 'var(--c-green)' : 'var(--c-border)'}`,
                background: on ? 'var(--c-green-bg)' : 'var(--c-bg)', cursor: 'pointer',
              }}>
                <div style={{ fontSize: 'var(--font-md)', fontWeight: on ? 700 : 500, color: on ? 'var(--c-green)' : 'var(--c-text)' }}>{p.label}</div>
                <div style={{ fontSize: 'var(--font-2xs)', color: on ? 'var(--c-green)' : 'var(--c-text3)', marginTop: 3, lineHeight: 1.3 }}>{p.tag}</div>
              </button>
            )
          })}
        </div>
        {activePreset && <Note type="info" mt={8}>📖 {activePreset.note}</Note>}
        <div style={{ marginTop: 10 }}>
          <Slider label="自訂年化（覆蓋預設）" min={4} max={20} step={0.5}
            value={Math.round(dr * 1000) / 10}
            onChange={v => set('dr', v / 100)}
            fmt={v => `${v}%`} />
          {!activePreset && (
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--c-text3)', marginTop: -4 }}>
              目前為自訂年化 {(dr * 100).toFixed(1)}%，未對應任一歷史錨點情境。
            </div>
          )}
        </div>
      </div>

      {/* 稅率 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 'var(--font-md)', color: 'var(--c-text2)', minWidth: 148, flexShrink: 0 }}>所得稅率（0050配息）</span>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', flex: 1 }}>
          {TAX_OPTS.map(o => {
            const on = tax === o.v
            return (
              <button key={o.v} onClick={() => set('tax', o.v)} style={{
                padding: '5px 11px', borderRadius: 'var(--radius-sm)',
                border: `0.5px solid ${on ? 'transparent' : 'var(--c-border2)'}`,
                background: on ? 'var(--c-blue-bg)' : 'var(--c-bg)',
                color: on ? 'var(--c-blue)' : 'var(--c-text2)',
                fontSize: 'var(--font-sm)', fontWeight: on ? 600 : 400, cursor: 'pointer',
              }}>{o.label}</button>
            )
          })}
        </div>
      </div>

      {/* 0050 再投入效率 */}
      <Slider label="0050配息再投入效率" min={0} max={100} step={5}
        value={Math.round(rr * 100)} onChange={v => set('reinvestRate', v / 100)}
        fmt={v => v === 100 ? '100%（完美再投入）' : v === 0 ? '0%（配息全部領出）' : `${v}%（部分再投入）`} />
      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--c-text3)', marginBottom: 10, marginTop: -4 }}>
        現實中多數投資人無法做到100%即時再投入，建議設定60–80%較貼近實際情況
      </div>

      {amt > 0 && <PhaseBar per={per} years={years} />}

      {/* 實質購買力切換 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, margin: '10px 0 2px' }}>
        <button onClick={() => setRealMode(v => !v)} style={{
          padding: '5px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
          border: `0.5px solid ${realMode ? 'var(--c-green)' : 'var(--c-border2)'}`,
          background: realMode ? 'var(--c-green-bg)' : 'var(--c-bg)',
          color: realMode ? 'var(--c-green)' : 'var(--c-text2)',
          fontSize: 'var(--font-sm)', fontWeight: realMode ? 600 : 400,
        }}>{realMode ? '✓ 實質購買力（已扣通膨）' : '顯示實質購買力（扣通膨）'}</button>
        {realMode && (
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--c-text3)' }}>
            以年通膨 {(infl * 100).toFixed(1)}% 折現為今日購買力（通膨率於「💰通膨購買力」分頁調整）
          </span>
        )}
      </div>

      <div className="grid3" style={{ gap: 8, margin: '8px 0 10px' }}>
        <Card label="總投入" value={fmtM(cost)} sub={amt > 0 ? perLabel : '一次性'} />
        <Card label={`0050（帳面+已領配息，${years}年${realMode ? '·實質' : ''}）`}
          value={fmtM(total0050)}
          sub={`帳面 ${fmtM(norm0050End)} + 配息 ${fmtM(totalCashReceived)}`} />
        <Card label={`009816（${years}年${realMode ? '·實質' : ''}）`} value={fmtM(norm9816End)} sub="不配息，無稅摩擦" />
      </div>

      <InvestChart data={chartData} series={[
        { key: '009816',       label: '009816',           color: '#1D9E75', width: 2.5 },
        { key: '0050帳面資產', label: '0050帳面資產',     color: '#378ADD', width: 2   },
        ...(showCashFlow ? [{ key: '0050累積已領配息', label: '0050累積已領配息', color: '#7BAFD4', dash: '4 3', width: 1.5 }] : []),
        { key: '總投入',       label: '總投入',           color: '#888888', dash: '5 4', width: 1.5 },
      ]} height={230} />
      <Legend items={[
        { color: '#1D9E75', label: '009816' },
        { color: '#378ADD', label: '0050帳面資產' },
        ...(showCashFlow ? [{ color: '#7BAFD4', label: '0050累積已領配息', dash: true }] : []),
        { color: '#888888', label: '總投入', dash: true },
      ]} />

      <Note mt={8}>
        009816費後年化 {fmtPA(r1)}，0050費後稅後年化 {fmtPA(r0t)}（再投入效率 {Math.round(rr*100)}%）。
        {realMode && ` 以下數字已扣除年通膨 ${(infl*100).toFixed(1)}%，為今日購買力。`}
        {years}年後 009816 共 {fmtM(norm9816End)}，
        0050帳面 {fmtM(norm0050End)} + 累積配息 {fmtM(totalCashReceived)} = 總回報 {fmtM(total0050)}。
        {norm9816End > total0050
          ? ` 009816 總回報多出 ${fmtM(norm9816End - total0050)}。`
          : ` 0050 總回報多出 ${fmtM(total0050 - norm9816End)}。`}
        {rr < 1 && ` 其中 ${fmtM(totalCashReceived)} 為已領出的配息現金（可用於其他投資或生活費）。`}
      </Note>
    </div>
  )
}
