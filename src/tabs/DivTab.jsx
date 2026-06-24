import { useMemo } from 'react'
import { Card, Note, Slider, SectionTitle, BtnGroup, Divider } from '../components'
import { fmtM, fmtPA, ETF_DATA, MONTH_NAMES } from '../utils'

const RATIO_PRESETS = [
  { v: '40,30,30', label: '每月領息均衡',   desc: '三檔錯開季配，每月皆有一檔配息' },
  { v: '20,30,50', label: '全年總領息最大', desc: '00919佔比最高，加權殖利率最大化' },
  { v: '50,30,20', label: '波動最低優先',   desc: '0056佔比最高，歷史最久最穩定'   },
]

// 月曆式配息時間軸
function DivCalendar({ weights, total }) {
  const wNorm = (() => {
    const sum = weights.reduce((a, b) => a + b, 0)
    return sum > 0 ? weights.map(w => w / sum) : weights.map(() => 1 / 3)
  })()
  const amts  = wNorm.map((w, i) => total * w)
  const yields = ETF_DATA.map(e => e.yield10yr)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, margin: '10px 0' }}>
      {MONTH_NAMES.map((mo, idx) => {
        const month = idx + 1
        const etfIdx = ETF_DATA.findIndex(e => e.divMonths.includes(month))
        const etf    = etfIdx >= 0 ? ETF_DATA[etfIdx] : null
        const divAmt = etf ? amts[etfIdx] * yields[etfIdx] / 4 : 0
        return (
          <div key={month} style={{
            borderRadius: 'var(--radius-sm)', padding: '8px 10px',
            background: etf ? ETF_DATA[etfIdx].color + '18' : 'var(--c-bg2)',
            border: `0.5px solid ${etf ? ETF_DATA[etfIdx].color + '55' : 'var(--c-border)'}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: etf ? ETF_DATA[etfIdx].color : 'var(--c-text3)' }}>
              {mo}
            </div>
            {etf ? (
              <>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text)', marginTop: 2 }}>
                  {etf.code}
                </div>
                <div style={{ fontSize: 11, color: 'var(--c-text2)', marginTop: 1 }}>
                  配息約 {fmtM(divAmt)}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 11, color: 'var(--c-text3)', marginTop: 2 }}>—</div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function DivTab({ state, set }) {
  const { amt, dvTotal, dvW, dvTarget } = state

  const wNorm = useMemo(() => {
    const sum = dvW.reduce((a, b) => a + b, 0)
    return sum > 0 ? dvW.map(w => w / sum) : dvW.map(() => 1/3)
  }, [dvW])

  const dvAmts    = wNorm.map(w => dvTotal * w)
  const dvYrArr   = dvAmts.map((a, i) => a * ETF_DATA[i].yield10yr)
  const dvYrTotal = dvYrArr.reduce((a, b) => a + b, 0)
  const dvAvgYield = wNorm.reduce((acc, w, i) => acc + w * ETF_DATA[i].yield10yr, 0)
  const dvNeed    = dvTarget * 12 / dvAvgYield
  const dvDiff    = dvNeed - dvTotal

  const presetVal = RATIO_PRESETS.find(p => {
    const [a, b, c] = p.v.split(',').map(Number)
    return a === dvW[0] && b === dvW[1] && c === dvW[2]
  })?.v || 'custom'

  function applyPreset(v) {
    const [a, b, c] = v.split(',').map(Number)
    set('dvW', [a, b, c])
  }

  return (
    <div>
      <SectionTitle>高股息ETF配置試算</SectionTitle>
      <Note mt={0}>
        三檔均為季配息，但配息月份剛好錯開，合計1–12月每月皆有一檔配息。
        0056（1/4/7/10月）、00878（3/6/9/12月）、00919（2/5/8/11月）。
        殖利率採歷史均值：0056 ~6.5%、00878 ~7%、00919 ~10%。
      </Note>

      <div style={{ marginTop: 12 }}>
        <Slider label="總投入金額" min={500000} max={30000000} step={100000}
          value={dvTotal} onChange={v => set('dvTotal', v)} fmt={v => fmtM(v)} />
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: 'var(--c-text2)', minWidth: 148, flexShrink: 0, paddingTop: 5 }}>推薦配置</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          {RATIO_PRESETS.map(p => {
            const on = presetVal === p.v
            const [a, b, c] = p.v.split(',').map(Number)
            return (
              <button key={p.v} onClick={() => applyPreset(p.v)} style={{
                padding: '8px 12px', borderRadius: 'var(--radius-sm)', textAlign: 'left',
                border: `0.5px solid ${on ? 'var(--c-green)' : 'var(--c-border)'}`,
                background: on ? 'var(--c-green-bg)' : 'var(--c-bg)',
                cursor: 'pointer',
              }}>
                <div style={{ fontSize: 13, fontWeight: on ? 600 : 400, color: on ? 'var(--c-green)' : 'var(--c-text)' }}>
                  {p.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--c-text3)', marginTop: 2 }}>
                  {p.desc}　0056:{a}% / 00878:{b}% / 00919:{c}%
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {ETF_DATA.map((etf, i) => (
        <Slider key={etf.code} label={`${etf.code} ${etf.name} 比例`}
          min={0} max={100} step={5} value={dvW[i]}
          onChange={v => { const w = [...dvW]; w[i] = v; set('dvW', w) }}
          fmt={v => v + '%'} />
      ))}

      {/* 三檔個別資訊 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, margin: '10px 0' }}>
        {ETF_DATA.map((etf, i) => (
          <div key={etf.code} style={{
            borderRadius: 'var(--radius)', padding: '10px 12px',
            border: `0.5px solid var(--c-border)`,
            borderTop: `3px solid ${etf.color}`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text)', marginBottom: 2 }}>{etf.code}</div>
            <div style={{ fontSize: 11, color: 'var(--c-text3)', marginBottom: 8 }}>{etf.name}｜{etf.freq}｜殖利率{(etf.yield10yr*100).toFixed(0)}%</div>
            <div style={{ fontSize: 11, color: 'var(--c-text3)' }}>配息月：{etf.divMonths.join('/')月</div>
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 11, color: 'var(--c-text3)' }}>投入</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{fmtM(dvAmts[i])}</div>
            </div>
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 11, color: 'var(--c-text3)' }}>年配息估算</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: etf.color }}>{fmtM(dvYrArr[i])}/年</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7, margin: '10px 0' }}>
        <Card label="加權平均殖利率" value={fmtPA(dvAvgYield)} />
        <Card label="年總配息（稅前）" value={fmtM(dvYrTotal) + '/年'} />
        <Card label="每季配息（平均）" value={fmtM(dvYrTotal / 4) + '/季'} />
        <Card label="月均等效" value={fmtM(dvYrTotal / 12) + '/月'} />
      </div>

      <Divider />
      <SectionTitle>配息月曆（各月實際配息ETF）</SectionTitle>
      <DivCalendar weights={dvW} total={dvTotal} />

      <Divider />
      <SectionTitle>目標月領反推</SectionTitle>
      <Slider label="目標月領金額" min={10000} max={200000} step={5000}
        value={dvTarget} onChange={v => set('dvTarget', v)}
        fmt={v => v.toLocaleString() + ' 元'} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, margin: '10px 0' }}>
        <Card label="需要投入總金額" value={fmtM(dvNeed)} sub="以加權殖利率反推" />
        <Card label={`vs 現有 ${fmtM(dvTotal)}`}
          value={dvDiff > 0 ? `尚缺 ${fmtM(dvDiff)}` : `超過 ${fmtM(-dvDiff)}`}
          sub={dvDiff > 0 ? '需追加本金' : '✅ 已達標'}
          accent={dvDiff > 0 ? 'var(--c-orange)' : 'var(--c-green)'} />
        <Card label="達標尚需追加月數"
          value={dvDiff > 0 ? `約 ${Math.ceil(dvDiff / amt)} 個月` : '已達標'}
          sub={`以每月 ${fmtM(amt)} 估算`} />
      </div>

      {dvDiff > 0
        ? <Note type="warn">距離月領 {dvTarget.toLocaleString()} 元的目標，尚缺 {fmtM(dvDiff)} 本金。以定期定額每月 {fmtM(amt)} 速度，約需 {Math.ceil(dvDiff / amt)} 個月補足。</Note>
        : <Note type="suc">以目前 {fmtM(dvTotal)} 投入，加權殖利率 {fmtPA(dvAvgYield)}，年配息 {fmtM(dvYrTotal)}，月均 {fmtM(dvYrTotal/12)}，已超過月領目標 {dvTarget.toLocaleString()} 元！</Note>}

      <Note mt={8}>
        注意：三檔為季配而非月配，月均為年配息÷12的等效數字。實際每次配息約為月均的3倍，集中在各自的季配月份。
        配息稅前計算，實際扣除配息稅（依個人稅率）及健保補充費2.11%後，實拿金額會減少。
      </Note>
    </div>
  )
}
