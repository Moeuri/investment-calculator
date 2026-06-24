import { useState, useMemo } from 'react'
import { Card, Note, Slider, SectionTitle, InvestChart, Legend } from '../components'
import { fmtM, fmtPA, EXP1 } from '../utils'

export default function InsTab({ state }) {
  const { dr } = state
  const r1 = dr + 0.01 - EXP1

  // 保險分頁有自己的獨立狀態
  const [insPrin, setInsPrin] = useState(7000000)
  const [insAnn,  setInsAnn]  = useState(150000)
  const [insPen,  setInsPen]  = useState(0)

  const netP = insPrin * (1 - insPen / 100)

  const { chartData, insCross } = useMemo(() => {
    let cross = null
    const data = Array.from({ length: 20 }, (_, i) => {
      const y    = i + 1
      const insT = insPrin + insAnn * y
      const mkt  = netP * Math.pow(1 + r1 / 12, y * 12)
      if (!cross && mkt > insT) cross = y
      return { year: `${y}年`, '保險總資產': Math.round(insT), '009816': Math.round(mkt) }
    })
    return { chartData: data, insCross: cross }
  }, [insPrin, insAnn, netP, r1])

  return (
    <div>
      <Note type="info" mt={0}>
        009816 報酬率與「定期定額」分頁設定同步（目前：{(dr*100).toFixed(1)}%，費後 {fmtPA(r1)}）。
        保險參數可在此頁獨立設定。
      </Note>

      <SectionTitle mt={14}>儲蓄型保險參數</SectionTitle>

      <Slider label="保險本金" min={300000} max={50000000} step={100000}
        value={insPrin} onChange={setInsPrin} fmt={v => fmtM(v)} />

      <Slider label="每年領回金額" min={10000} max={2000000} step={10000}
        value={insAnn} onChange={setInsAnn} fmt={v => fmtM(v)} />

      <Slider label="解約費用 %" min={0} max={10} step={0.5}
        value={insPen} onChange={setInsPen}
        fmt={v => v === 0 ? '0%（已過鎖定期）' : v.toFixed(1) + '%'} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, margin: '12px 0' }}>
        <Card label="隱含年化（單利）" value={fmtPA(insAnn / insPrin) + '/年'} />
        <Card label="20年累積領回" value={fmtM(insAnn * 20)} />
        <Card label="009816超越年份"
          value={insCross ? `第 ${insCross} 年` : '20年內未超越'}
          accent={insCross ? 'var(--c-green)' : 'var(--c-red)'} />
      </div>

      <InvestChart data={chartData} series={[
        { key: '保險總資產', label: '保險總資產', color: '#BA7517', width: 2   },
        { key: '009816',    label: '009816',    color: '#1D9E75', width: 2.5 },
      ]} height={230} />
      <Legend items={[
        { color: '#BA7517', label: '保險總資產' },
        { color: '#1D9E75', label: '解約轉009816' },
      ]} />

      <Note mt={8}>
        保險本金 {fmtM(insPrin)}，年領 {fmtM(insAnn)}（{fmtPA(insAnn/insPrin)} 單利）。
        {insPen > 0 ? `解約費 ${insPen}%，實際轉入 ${fmtM(netP)}。` : '已過鎖定期無費用。'}
        {insCross
          ? ` 009816 在第 ${insCross} 年超越保險總資產，之後差距持續擴大。`
          : ' 009816 在20年內未超越保險總資產，可嘗試調高報酬率情境。'}
      </Note>
    </div>
  )
}
