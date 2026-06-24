import { useMemo } from 'react'
import { Card, Note, SectionTitle, BtnGroup, InvestChart, Legend, Divider } from '../components'
import { buildNorm, fmtM, fmtPA, EXP1 } from '../utils'

const INFL_OPTS = [
  { v: 0.015, label: '台灣低 1.5%' },
  { v: 0.02,  label: '基準 2%'     },
  { v: 0.03,  label: '中等 3%'     },
  { v: 0.05,  label: '高通膨 5%'   },
]

function buildWithLumpSum(lumpSum, amt, per, annR) {
  const mr = annR / 12
  const out = new Float64Array(241)
  let v = lumpSum || 0
  for (let mo = 1; mo <= 240; mo++) {
    v = mo <= per ? (v + amt) * (1 + mr) : v * (1 + mr)
    out[mo] = v
  }
  return out
}

export default function InflTab({ state, set }) {
  const { amt, per, dr, lumpSum, infl, insAnn } = state
  const r1 = dr + 0.01 - EXP1
  const ls = lumpSum || 0

  const { norm, chartData, insRealTotal } = useMemo(() => {
    const norm = buildWithLumpSum(ls, amt, per, r1)
    let insRealTotal = 0
    const data = Array.from({ length: 20 }, (_, i) => {
      const y = i + 1
      const nv = norm[y * 12]
      const rv = nv / Math.pow(1 + infl, y)
      const insReal = insAnn / Math.pow(1 + infl, y)
      insRealTotal += insReal
      return {
        year: `${y}年`,
        '009816名目': Math.round(nv),
        '009816實質': Math.round(rv),
        '儲蓄險實質累積': Math.round(insRealTotal),
      }
    })
    return { norm, chartData: data, insRealTotal }
  }, [ls, amt, per, r1, infl, insAnn])

  return (
    <div>
      <SectionTitle>通膨調整：實質購買力</SectionTitle>
      <Note type="info" mt={0}>
        以今日物價為基準，換算未來各年資產「等同今日多少購買力」。
        009816名目、009816實質、儲蓄險年領實質累積三條線同時比較。
      </Note>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0' }}>
        <span style={{ fontSize: 13, color: 'var(--c-text2)', minWidth: 148, flexShrink: 0 }}>年通膨率</span>
        <BtnGroup value={infl} onChange={v => set('infl', v)} options={INFL_OPTS} />
        <span style={{ fontSize: 13, fontWeight: 600, minWidth: 60, textAlign: 'right' }}>{(infl*100).toFixed(1)}%</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7, margin: '10px 0' }}>
        {[5, 10, 15, 20].map(y => (
          <Card key={y} label={`${y}年後`}
            value={fmtM(norm[y * 12])}
            sub={`實質：${fmtM(norm[y * 12] / Math.pow(1 + infl, y))}`} />
        ))}
      </div>

      <Divider />
      <SectionTitle>
        儲蓄險年領 {fmtM(insAnn)} 的實質購買力侵蝕
        {insAnn === 150000 && <span style={{ fontSize: 11, color: 'var(--c-text3)', fontWeight: 400, marginLeft: 6 }}>（可在「儲蓄險 vs 股市」分頁調整）</span>}
      </SectionTitle>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, margin: '10px 0' }}>
        <Card label={`第10年的${fmtM(insAnn)}等同今日`}
          value={fmtM(insAnn / Math.pow(1 + infl, 10))} sub="購買力縮水" />
        <Card label={`第20年的${fmtM(insAnn)}等同今日`}
          value={fmtM(insAnn / Math.pow(1 + infl, 20))} sub="購買力縮水" />
        <Card label="20年總領回實質價值"
          value={fmtM(insRealTotal)} sub={`vs 名目 ${fmtM(insAnn * 20)}`} />
      </div>

      <InvestChart data={chartData} series={[
        { key: '009816名目',      label: '009816名目',      color: '#1D9E75', width: 2.5 },
        { key: '009816實質',      label: '009816實質購買力', color: '#5DCAA5', dash: '4 3', width: 2 },
        { key: '儲蓄險實質累積',  label: '儲蓄險實質累積',  color: '#BA7517', width: 1.5 },
      ]} height={230} />
      <Legend items={[
        { color: '#1D9E75', label: '009816名目' },
        { color: '#5DCAA5', label: '009816實質購買力', dash: true },
        { color: '#BA7517', label: '儲蓄險實質累積' },
      ]} />

      <Note mt={8}>
        通膨率 {fmtPA(infl)} 下，009816 20年後名目 {fmtM(norm[240])}，
        實質購買力約 {fmtM(norm[240] / Math.pow(1 + infl, 20))}。
        儲蓄險20年名目總領 {fmtM(insAnn * 20)}，
        實質僅 {fmtM(insRealTotal)}，
        縮水 {(100 - insRealTotal / (insAnn * 20) * 100).toFixed(0)}%。
      </Note>
    </div>
  )
}
