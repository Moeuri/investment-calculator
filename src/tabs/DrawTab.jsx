import { useMemo } from 'react'
import { Card, Note, Slider, SectionTitle, InvestChart, Legend, Divider } from '../components'
import { buildNorm, fmtM, fmtPA, EXP1 } from '../utils'

// 年金現值公式反推退休本金
// PV = PMT × [1 - (1+r)^-n] / r
function calcRetirementPV(monthlyDraw, drawRate, years) {
  const mr = drawRate / 12
  const n  = years * 12
  if (mr === 0) return monthlyDraw * n
  return monthlyDraw * (1 - Math.pow(1 + mr, -n)) / mr
}

export default function DrawTab({ state, set }) {
  const { amt, per, dr, lumpSum, drawMo, drawRate, retireAfter, drawYears, infl } = state
  const r1 = dr + 0.01 - EXP1
  const ls = lumpSum || 0

  // 定期定額結束月份
  const dcaEndMo     = per
  const dcaEndYr     = per / 12
  const retireEndMo  = (retireAfter || 20) * 12

  // 衝突偵測：退休時間早於定期定額結束
  const hasConflict = retireAfter < dcaEndYr

  // 退休時的帳上資產（陣列延伸至最大退休月份，修正 >20年時取到 undefined 的 Bug）
  const maxMo   = Math.max(240, retireEndMo)
  const norm    = useMemo(() => buildNorm(ls, amt, per, r1, maxMo), [ls, amt, per, r1, maxMo])
  const startV  = norm[retireEndMo]

  // 提領模擬
  const { chartData, drawExhaust } = useMemo(() => {
    const mr = drawRate / 12
    let v = startV, exhaust = null
    const pts = []
    const maxYrs = 50
    for (let y = 1; y <= maxYrs; y++) {
      for (let m = 0; m < 12; m++) {
        v = v * (1 + mr) - drawMo
        if (v <= 0 && !exhaust) { exhaust = y; v = 0 }
      }
      pts.push({ year: `${y}年`, '資產': Math.round(Math.max(0, v)), '零線': 0 })
      if (v <= 0) break
    }
    while (pts.length < 30) pts.push({ year: `${pts.length+1}年`, '資產': 0, '零線': 0 })
    return { chartData: pts, drawExhaust: exhaust }
  }, [startV, drawMo, drawRate])

  // 反推退休本金需求
  const targetYears   = drawYears || 25
  const nominalPV     = calcRetirementPV(drawMo, drawRate, targetYears)
  const inflAdj       = infl || 0.02
  const retireInYrs   = retireAfter || 20
  const inflatedPV    = nominalPV * Math.pow(1 + inflAdj, retireInYrs)
  const gap           = nominalPV - startV
  const annualDraw    = drawMo * 12
  const drawPct       = startV > 0 ? annualDraw / startV : 0

  return (
    <div>
      <SectionTitle>退休時間設定</SectionTitle>

      <Slider label="退休時間（從今日起幾年）" min={1} max={40} step={1}
        value={retireAfter || 20} onChange={v => set('retireAfter', v)}
        fmt={v => `第 ${v} 年退休`} />

      {hasConflict && (
        <Note type="red" mt={0}>
          ⚠️ 設定衝突：退休時間（第{retireAfter}年）早於定期定額結束時間（第{dcaEndYr.toFixed(1)}年），
          代表退休後仍在繼續定期投入。請重新檢視投資方案，調大退休年份或縮短定期定額期數。
        </Note>
      )}

      <Note type="info" mt={8}>
        定期定額 {per} 期（{dcaEndYr.toFixed(1)}年）結束後，持有至第{retireAfter || 20}年退休，
        屆時帳上預估約 <strong>{fmtM(startV)}</strong>，開始每月提領。
      </Note>

      <Divider />
      <SectionTitle>提領參數</SectionTitle>

      <Slider label="每月提領金額" min={5000} max={300000} step={1000}
        value={drawMo} onChange={v => set('drawMo', v)}
        fmt={v => v.toLocaleString() + ' 元'} />
      <Slider label="提領後剩餘年化報酬" min={2} max={15} step={0.5}
        value={drawRate * 100} onChange={v => set('drawRate', v / 100)}
        fmt={v => v.toFixed(1) + '%'} />

      <div className="grid3" style={{ gap: 8, margin: '10px 0' }}>
        <Card label="退休時總資產" value={fmtM(startV)} sub={`第${retireAfter || 20}年退休`} />
        <Card label="每年提領" value={fmtM(annualDraw)} sub={`佔起始資產 ${fmtPA(drawPct)}`} />
        <Card label="資產耗盡年數"
          value={drawExhaust ? `退休後第 ${drawExhaust} 年` : '永續'}
          sub={drawExhaust ? '報酬不足以覆蓋提領' : '報酬率持續覆蓋'}
          accent={drawExhaust ? 'var(--c-red)' : 'var(--c-green)'} />
      </div>

      <InvestChart data={chartData} series={[
        { key: '資產', label: '提領後資產', color: '#1D9E75', width: 2.5 },
        { key: '零線', label: '歸零線',     color: '#E24B4A', dash: '4 3', width: 1.5 },
      ]} height={210}
        refLines={drawExhaust ? [{ x: `${drawExhaust}年`, label: '資產耗盡', color: 'var(--c-red)' }] : []} />
      <Legend items={[
        { color: '#1D9E75', label: '提領後資產' },
        { color: '#E24B4A', label: '歸零線', dash: true },
      ]} />

      {!drawExhaust
        ? <Note type="suc" mt={8}>月提領 {drawMo.toLocaleString()} 元可永久持續，資產不歸零。</Note>
        : <Note type="warn" mt={8}>
            以目前提領速度，資產將在退休後第{drawExhaust}年耗盡。
            安全月提領上限約 {fmtM(startV * drawRate / 12)}/月（4%法則）。
          </Note>}

      <Divider />
      <SectionTitle>退休本金反推</SectionTitle>
      <Note type="info" mt={0}>
        設定想要的月領金額與希望撐幾年，反推需要多少退休本金。採年金現值公式計算（資產在提領期間仍持續複利）。
      </Note>

      <Slider label="希望提領撐幾年" min={10} max={40} step={1}
        value={drawYears || 25} onChange={v => set('drawYears', v)}
        fmt={v => `${v} 年`} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, margin: '10px 0' }}>
        <Card label={`月領 ${fmtM(drawMo)} 撐 ${drawYears||25} 年所需退休本金`}
          value={fmtM(nominalPV)}
          sub="今日幣值（名目）"
          accent="var(--c-blue)" />
        <Card label={`通膨調整後（${(inflAdj*100).toFixed(1)}%，${retireInYrs}年後）`}
          value={fmtM(inflatedPV)}
          sub={`退休當日幣值`}
          accent="var(--c-orange)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, margin: '10px 0' }}>
        <Card label="你的預估退休資產"
          value={fmtM(startV)}
          sub={`第${retireInYrs}年，依目前定期定額估算`}
          accent={startV >= nominalPV ? 'var(--c-green)' : 'var(--c-red)'} />
        <Card label="與目標缺口（名目）"
          value={gap <= 0 ? `超過 ${fmtM(-gap)}` : `尚缺 ${fmtM(gap)}`}
          sub={gap <= 0 ? '✅ 已達標，可提早退休或增加提領' : '建議增加每月投入或延後退休'}
          accent={gap <= 0 ? 'var(--c-green)' : 'var(--c-red)'} />
      </div>

      {gap > 0 && (
        <Note type="warn">
          距離退休目標尚缺 {fmtM(gap)}（今日幣值）。建議回到「定期定額」分頁，
          嘗試增加每月投入金額、延長投入期數、或調整退休時間點，直到預估退休資產超過 {fmtM(nominalPV)}。
        </Note>
      )}
      {gap <= 0 && (
        <Note type="suc">
          以目前設定，退休資產 {fmtM(startV)} 已超過目標 {fmtM(nominalPV)}，
          超出 {fmtM(-gap)}。你可以考慮提早退休、增加月提領金額，或延長提領年數。
        </Note>
      )}

      <Note mt={8}>
        通膨設定來自「通膨購買力」分頁（目前 {(inflAdj*100).toFixed(1)}%）。
        名目退休本金指以今日購買力計算；通膨調整後為退休當日實際需要的金額。
        4%法則：年提領不超過退休本金4%，歷史上可支撐30年以上。
      </Note>
    </div>
  )
}
