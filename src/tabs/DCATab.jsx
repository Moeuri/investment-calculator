import { useMemo } from 'react'
import { Card, Note, Slider, PhaseBar, SectionTitle, InvestChart, Legend } from '../components'
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
  {
    v: 0.04,
    label: '悲劇 4%',
    tag: '日本失落30年',
    note: '錨點：日本失落的30年（1990–2020）。日經225從1989年高點崩跌，花了30年才回到同等水位，期間含息年化約3–4%。代表「台灣走上日本老路」的極端悲觀情境。',
  },
  {
    v: 0.06,
    label: '悲觀 6%',
    tag: '台股橫盤20年',
    note: '錨點：台股橫盤期（1990–2010）。加權指數在12682點崩跌後，歷經20年反覆震盪，多次挑戰前高均失敗，含息年化約5–6%。代表「指數漲不動、只靠配息撐報酬」的本土悲觀情境。',
  },
  {
    v: 0.08,
    label: '全球保守 8%',
    tag: 'S&P500 百年均值',
    note: '錨點：S&P500從1928年至2024年完整96年含息年化約9.8%，扣除通膨後實質報酬約6.5–7%，加回台灣通膨（約1.5–2%）還原為名目值約8%。全球分散投資長期合理預期的中位值，最常被引用的保守大盤預期。',
  },
  {
    v: 0.105,
    label: '台股歷史 10.5%',
    tag: '0050上市完整歷史',
    note: '錨點：0050從2003年上市至2024年底，完整21年含息年化。已包含2008年-57%金融海嘯、2022年暴力升息等完整熊市週期，是台股ETF可追溯的最完整歷史紀錄。注意：含台積電崛起這個難以複製的結構性因素。',
  },
  {
    v: 0.13,
    label: '樂觀 13%',
    tag: '台股突破前高後多頭',
    note: '錨點：0050從2016年突破1990年前高後至2024年底，含息年化約13–14%。代表台灣科技業在全球供應鏈重組後持續受惠、AI應用加速滲透的樂觀延續情境，已比2020–2024實際數字保守下修。',
  },
  {
    v: 0.18,
    label: '賭性狂徒 18%',
    tag: '2020疫情低點後AI行情',
    note: '錨點：0050從2020年3月疫情低點至2024年底，含息年化約18–22%。疫情後流動性寬鬆、AI題材爆發、台積電全球定價權確立三重因素疊加的歷史最強多頭區段。幾乎不可能長期持續，僅供壓力測試的極端樂觀情境。',
  },
]

export default function DCATab({ state, set }) {
  const { amt, per, dr, tax } = state
  const r1  = dr + 0.01 - EXP1
  const r0t = dr - EXP0 - DIV * (tax + TH)
  const cost = amt * per

  const activePreset = DR_PRESETS.find(p => p.v === dr)

  const { norm, norm0 } = useMemo(() => ({
    norm:  buildNorm(amt, per, r1),
    norm0: buildNorm(amt, per, r0t),
  }), [amt, per, r1, r0t])

  const chartData = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => {
      const y = i + 1, mo = y * 12
      return {
        year:    `${y}年`,
        '0050':   Math.round(norm0[mo]),
        '009816': Math.round(norm[mo]),
        '總投入': Math.round(Math.min(cost, amt * mo)),
      }
    }), [norm, norm0, cost, amt])

  const perLabel = per % 12 === 0
    ? `${per}期（${per / 12}年）`
    : `${per}期（${Math.floor(per / 12)}年${per % 12}個月）`

  return (
    <div>
      <SectionTitle>投入參數</SectionTitle>

      <Slider label="每月投入金額" min={1000} max={500000} step={1000}
        value={amt} onChange={v => set('amt', v)}
        fmt={v => v.toLocaleString() + ' 元'} />

      <Slider label="定期定額期數" min={6} max={72} step={1}
        value={per} onChange={v => set('per', v)}
        fmt={v => v % 12 === 0 ? `${v}期（${v/12}年）` : `${v}期（${Math.floor(v/12)}年${v%12}個月）`} />

      {/* 報酬率六檔 */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: 'var(--c-text2)', marginBottom: 8 }}>年化報酬率情境</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
          {DR_PRESETS.map(p => {
            const on = dr === p.v
            return (
              <button key={p.v} onClick={() => set('dr', p.v)} style={{
                padding: '9px 10px', borderRadius: 'var(--radius-sm)', textAlign: 'left',
                border: `0.5px solid ${on ? 'var(--c-green)' : 'var(--c-border)'}`,
                background: on ? 'var(--c-green-bg)' : 'var(--c-bg)',
                cursor: 'pointer',
              }}>
                <div style={{ fontSize: 13, fontWeight: on ? 700 : 500, color: on ? 'var(--c-green)' : 'var(--c-text)' }}>
                  {p.label}
                </div>
                <div style={{ fontSize: 10, color: on ? 'var(--c-green)' : 'var(--c-text3)', marginTop: 3, lineHeight: 1.3 }}>
                  {p.tag}
                </div>
              </button>
            )
          })}
        </div>

        {/* 歷史錨點說明 */}
        {activePreset && (
          <Note type="info" mt={8}>
            📖 {activePreset.note}
          </Note>
        )}
      </div>

      {/* 所得稅率 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: 'var(--c-text2)', minWidth: 148, flexShrink: 0 }}>所得稅率（0050配息）</span>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', flex: 1 }}>
          {TAX_OPTS.map(o => {
            const on = tax === o.v
            return (
              <button key={o.v} onClick={() => set('tax', o.v)} style={{
                padding: '5px 11px', borderRadius: 'var(--radius-sm)',
                border: `0.5px solid ${on ? 'transparent' : 'var(--c-border2)'}`,
                background: on ? 'var(--c-blue-bg)' : 'var(--c-bg)',
                color: on ? 'var(--c-blue)' : 'var(--c-text2)',
                fontSize: 12, fontWeight: on ? 600 : 400, cursor: 'pointer',
              }}>{o.label}</button>
            )
          })}
        </div>
      </div>

      <PhaseBar per={per} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, margin: '10px 0' }}>
        <Card label="總投入本金" value={fmtM(cost)} sub={perLabel} />
        <Card label="0050（稅後20年）" value={fmtM(norm0[240])} sub={`稅後年化 ${fmtPA(r0t)}`} />
        <Card label="009816（20年）" value={fmtM(norm[240])} sub="不配息，無稅摩擦" />
      </div>

      <InvestChart data={chartData} series={[
        { key: '0050',   label: '0050（稅後）', color: '#378ADD', width: 2   },
        { key: '009816', label: '009816',       color: '#1D9E75', width: 2.5 },
        { key: '總投入',  label: '總投入',       color: '#888888', dash: '5 4', width: 1.5 },
      ]} height={220} />
      <Legend items={[
        { color: '#378ADD', label: '0050（稅後）' },
        { color: '#1D9E75', label: '009816'       },
        { color: '#888888', label: '總投入', dash: true },
      ]} />

      <Note mt={8}>
        009816費後年化 {fmtPA(r1)}，0050費後稅後 {fmtPA(r0t)}。
        20年後差距 {fmtM(norm[240] - norm0[240])}。
        {tax > 0 && ` 稅率 ${fmtPA(tax)} 造成配息摩擦 ${fmtPA(DIV*(tax+TH))}/年。`}
      </Note>
    </div>
  )
}
