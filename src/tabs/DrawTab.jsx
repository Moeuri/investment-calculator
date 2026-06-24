import { useMemo } from 'react'
import { Card, Note, Slider, SectionTitle, InvestChart, Legend } from '../components'
import { buildNorm, fmtM, fmtPA, EXP1 } from '../utils'

export default function DrawTab({ state, set }) {
  const { amt, per, dr, drawMo, drawRate } = state
  const r1 = dr + 0.01 - EXP1

  const norm   = useMemo(() => buildNorm(amt, per, r1), [amt, per, r1])
  const startV = norm[per]

  const { chartData, drawExhaust } = useMemo(() => {
    const mr = drawRate / 12
    let v = startV, exhaust = null
    const pts = []
    for (let y = 1; y <= 40; y++) {
      for (let m = 0; m < 12; m++) {
        v = v * (1 + mr) - drawMo
        if (v <= 0 && !exhaust) { exhaust = y; v = 0 }
      }
      pts.push({ year: `${y}年`, '資產': Math.round(Math.max(0, v)), '零線': 0 })
      if (v <= 0) break
    }
    while (pts.length < 20) pts.push({ year: `${pts.length+1}年`, '資產': 0, '零線': 0 })
    return { chartData: pts, drawExhaust: exhaust }
  }, [startV, drawMo, drawRate])

  const annualDraw = drawMo * 12
  const drawPct    = annualDraw / startV

  return (
    <div>
      <SectionTitle>退休提領模擬</SectionTitle>
      <Note type="info" mt={0}>
        定期定額滿期後，帳上約 {fmtM(startV)}，停止投入、開始每月固定提領。
      </Note>

      <div style={{ marginTop: 12 }}>
        <Slider label="每月提領金額" min={5000} max={300000} step={1000}
          value={drawMo} onChange={v => set('drawMo', v)}
          fmt={v => v.toLocaleString() + ' 元'} />
        <Slider label="提領後剩餘年化報酬" min={2} max={15} step={0.5}
          value={drawRate * 100} onChange={v => set('drawRate', v / 100)}
          fmt={v => v.toFixed(1) + '%'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, margin: '10px 0' }}>
        <Card label="滿期時總資產（009816）" value={fmtM(startV)} sub="提領起始本金" />
        <Card label="每年提領" value={fmtM(annualDraw)} sub={`佔起始資產 ${fmtPA(drawPct)}`} />
        <Card label="資產耗盡年數"
          value={drawExhaust ? `約第 ${drawExhaust} 年` : '永續'}
          sub={drawExhaust ? '報酬不足以覆蓋提領' : '報酬率持續覆蓋'}
          accent={drawExhaust ? 'var(--c-red)' : 'var(--c-green)'} />
      </div>

      <InvestChart data={chartData} series={[
        { key: '資產', label: '提領後資產', color: '#1D9E75', width: 2.5 },
        { key: '零線', label: '歸零線',     color: '#E24B4A', dash: '4 3', width: 1.5 },
      ]} height={230} />
      <Legend items={[
        { color: '#1D9E75', label: '提領後資產' },
        { color: '#E24B4A', label: '歸零線', dash: true },
      ]} />

      {!drawExhaust
        ? <Note type="suc" mt={8}>
            報酬率 {fmtPA(drawRate)} 下，每月提領 {drawMo.toLocaleString()} 元可永久持續，資產不歸零。
            提領率 {fmtPA(drawPct)} 低於報酬率，符合4%法則建議。
          </Note>
        : <Note type="warn" mt={8}>
            以目前速度，資產將在約第{drawExhaust}年耗盡。
            安全月提領上限約 {fmtM(startV * drawRate / 12)}/月。
          </Note>}
      <Note mt={8}>
        4%法則：年提領不超過起始資產4%，歷史上可支撐30年以上。
        此計算安全月提領上限約 {fmtM(startV * 0.04 / 12)}/月。
      </Note>
    </div>
  )
}
