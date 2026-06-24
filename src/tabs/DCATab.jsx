import { useMemo } from 'react'
import { Card, Note, Slider, BtnGroup, PhaseBar, SectionTitle, InvestChart } from '../components'
import { buildNorm, fmtM, fmtPA, EXP0, EXP1, DIV, TH } from '../utils'

const TAX_OPTS = [
  { v: 0,    label: '免稅'  },
  { v: 0.05, label: '5%'   },
  { v: 0.12, label: '12%'  },
  { v: 0.20, label: '20%'  },
  { v: 0.30, label: '30%'  },
  { v: 0.40, label: '40%'  },
]

export default function DCATab({ state, set }) {
  const { amt, per, dr, tax } = state
  const r1   = dr + 0.01 - EXP1
  const r0t  = dr - EXP0 - DIV * (tax + TH)
  const cost = amt * per

  const { norm, norm0 } = useMemo(() => ({
    norm:  buildNorm(amt, per, r1),
    norm0: buildNorm(amt, per, r0t),
  }), [amt, per, r1, r0t])

  const chartData = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => {
      const y = i + 1, mo = y * 12
      return {
        year: `${y}年`,
        '0050':   Math.round(norm0[mo]),
        '009816': Math.round(norm[mo]),
        '總投入':  Math.round(Math.min(cost, amt * mo)),
      }
    }), [norm, norm0, cost, amt])

  const perLabel = per % 12 === 0
    ? `${per}期（${per / 12}年）`
    : `${per}期（${Math.floor(per / 12)}年${per % 12}個月）`

  return (
    <div>
      <SectionTitle>投入參數</SectionTitle>
      <Slider label="每月投入金額" min={50000} max={500000} step={10000} value={amt}
        onChange={v => set('amt', v)} fmt={v => v.toLocaleString() + ' 元'} />
      <Slider label="定期定額期數" min={24} max={48} step={1} value={per}
        onChange={v => set('per', v)}
        fmt={v => v % 12 === 0 ? `${v}期（${v/12}年）` : `${v}期（${Math.floor(v/12)}年${v%12}個月）`} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: 'var(--c-text2)', minWidth: 148, flexShrink: 0 }}>年化報酬率</span>
        <BtnGroup value={dr} onChange={v => set('dr', v)} options={[
          { v: 0.06,  label: '悲觀 6%'     },
          { v: 0.08,  label: '保守 8%'     },
          { v: 0.105, label: '基準 10.5%'  },
          { v: 0.13,  label: '樂觀 13%'    },
        ]} />
        <span style={{ fontSize: 13, fontWeight: 600, minWidth: 112, textAlign: 'right' }}>
          {(dr * 100).toFixed(1)}%
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: 'var(--c-text2)', minWidth: 148, flexShrink: 0 }}>所得稅率（0050配息）</span>
        <BtnGroup value={tax} onChange={v => set('tax', v)} options={TAX_OPTS} />
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

      <div style={{ display: 'flex', gap: 14, marginTop: 7, fontSize: 11, color: 'var(--c-text3)', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 3, background: '#378ADD', display: 'inline-block' }} />0050（稅後）</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 3, background: '#1D9E75', display: 'inline-block' }} />009816</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 2, borderTop: '2px dashed #888', display: 'inline-block' }} />總投入</span>
      </div>

      <Note>
        009816費後年化 {fmtPA(r1)}，0050費後稅後 {fmtPA(r0t)}。
        20年後差距 {fmtM(norm[240] - norm0[240])}。
        {tax > 0 && ` 稅率 ${fmtPA(tax)} 造成配息摩擦 ${fmtPA(DIV * (tax + TH))} /年，長期複利損耗可觀。`}
      </Note>
    </div>
  )
}
