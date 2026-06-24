import { useState, useMemo } from 'react'
import { Card, Note, Slider, SectionTitle, SubTab, EventBtn, InvestChart, Divider } from '../components'
import { buildNorm, buildCrash1, buildCrash2, fmtM, fmtPA, CRASH_EVENTS, EXP1 } from '../utils'

const MODEL_OPTS = [
  { v: 'V', label: 'V型（直線反彈）' },
  { v: 'U', label: 'U型（低點盤整）' },
]

function CrashParams({ c, setC, activeEvt, setActiveEvt, prefix }) {
  function applyEvent(i) {
    setActiveEvt(i)
    setC({ ...c, drop: CRASH_EVENTS[i].drop, rec: CRASH_EVENTS[i].rec })
  }
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 5, marginBottom: 12 }}>
        {CRASH_EVENTS.map((ev, i) => (
          <EventBtn key={i} label={ev.name} sub={`-${ev.drop}%/${ev.rec}月`}
            active={activeEvt === i} onClick={() => applyEvent(i)} />
        ))}
      </div>
      <Slider label={`${prefix}崩盤發生（第幾年）`} min={1} max={19} step={1}
        value={c.when} onChange={v => setC({ ...c, when: v })} fmt={v => `第 ${v} 年`} />
      <Slider label="最大跌幅" min={0} max={99} step={1}
        value={c.drop} onChange={v => { setActiveEvt(null); setC({ ...c, drop: v }) }}
        fmt={v => v === 0 ? '0%（無崩跌）' : `-${v}%`} />
      <Slider label="恢復時間（月）" min={0} max={120} step={1}
        value={c.rec} onChange={v => { setActiveEvt(null); setC({ ...c, rec: v }) }}
        fmt={v => `${v} 個月（約${(v/12).toFixed(1)}年）`} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: 'var(--c-text2)', minWidth: 148, flexShrink: 0 }}>恢復模型</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {MODEL_OPTS.map(o => {
            const on = c.model === o.v
            return (
              <button key={o.v} onClick={() => setC({ ...c, model: o.v })} style={{
                padding: '5px 13px', borderRadius: 'var(--radius-sm)',
                border: `0.5px solid ${on ? 'var(--c-border2)' : 'var(--c-border)'}`,
                background: on ? 'var(--c-bg3)' : 'var(--c-bg)',
                color: on ? 'var(--c-text)' : 'var(--c-text3)',
                fontSize: 12, fontWeight: on ? 600 : 400, cursor: 'pointer',
              }}>{o.label}</button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function CrashTab({ state }) {
  const { amt, per, dr } = state
  const r1 = dr + 0.01 - EXP1

  const [subTab, setSubTab] = useState('c1')
  const [c1, setC1] = useState({ when: 5, drop: 57, rec: 65, model: 'V' })
  const [c2, setC2] = useState({ when: 12, drop: 34, rec: 24, model: 'V' })
  const [evt1, setEvt1] = useState(2)
  const [evt2, setEvt2] = useState(0)

  const c1Mo = c1.when * 12
  const c2Mo = c2.when * 12

  const { norm, crash1, crash2, chartData } = useMemo(() => {
    const norm   = buildNorm(amt, per, r1)
    const crash1 = buildCrash1(amt, per, r1, c1Mo, c1.drop, c1.rec, c1.model)
    const crash2 = buildCrash2(amt, per, r1,
      c1Mo, c1.drop, c1.rec, c1.model,
      c2Mo, c2.drop, c2.rec, c2.model)
    const cost = amt * per
    const data = Array.from({ length: 20 }, (_, i) => {
      const y = i + 1, mo = y * 12
      return {
        year: `${y}年`,
        '正常複利': Math.round(norm[mo]),
        '僅崩盤一': Math.round(crash1[mo]),
        '兩次崩盤': Math.round(crash2[mo]),
        '總投入':   Math.round(Math.min(cost, amt * mo)),
      }
    })
    return { norm, crash1, crash2, chartData: data }
  }, [amt, per, r1, c1Mo, c1.drop, c1.rec, c1.model, c2Mo, c2.drop, c2.rec, c2.model])

  const atC1 = norm[c1Mo]
  const botC1 = crash1[c1Mo]
  const atC2 = crash1[c2Mo > c1Mo ? c2Mo : c2Mo]
  const botC2 = crash2[c2Mo]

  let beC1 = '20年內未回到崩盤一前水位'
  for (let mo = c1Mo + 1; mo <= 240; mo++) {
    if (crash1[mo] >= atC1) { beC1 = `第${Math.ceil(mo/12)}年（崩後${mo-c1Mo}月）`; break }
  }
  let beC2 = '20年內未回到兩次崩盤前水位'
  const refVal = norm[c2Mo]
  for (let mo = c2Mo + 1; mo <= 240; mo++) {
    if (crash2[mo] >= refVal) { beC2 = `第${Math.ceil(mo/12)}年（崩後${mo-c2Mo}月）`; break }
  }

  const c2Invalid = c2.when <= c1.when

  return (
    <div>
      <SubTab
        tabs={[{ id: 'c1', label: '💥 崩盤一參數' }, { id: 'c2', label: '💥 崩盤二參數' }]}
        value={subTab} onChange={setSubTab}
      />

      {subTab === 'c1' && (
        <CrashParams c={c1} setC={setC1} activeEvt={evt1} setActiveEvt={setEvt1} prefix="崩盤一：" />
      )}
      {subTab === 'c2' && (
        <div>
          {c2Invalid && (
            <Note type="warn" mt={0}>崩盤二須晚於崩盤一（目前崩盤一第{c1.when}年），請將崩盤二設在第{c1.when+1}年以後。</Note>
          )}
          <CrashParams c={c2} setC={setC2} activeEvt={evt2} setActiveEvt={setEvt2} prefix="崩盤二：" />
        </div>
      )}

      <Divider />

      {/* 三卡摘要 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
        <Card label={`崩盤一：第${c1.when}年跌${c1.drop}%`} value={fmtM(botC1)} sub={`從${fmtM(atC1)}跌至此，${beC1}`} accent="#E24B4A" />
        <Card label={`崩盤二：第${c2.when}年跌${c2.drop}%`} value={fmtM(botC2)} sub={c2Invalid ? '⚠️ 需晚於崩盤一' : `兩次疊加，${beC2}`} accent="#BA7517" />
        <Card label="正常複利20年" value={fmtM(norm[240])} sub="無崩盤基準線" accent="#1D9E75" />
      </div>

      {/* 疊圖 */}
      <InvestChart data={chartData} series={[
        { key: '正常複利', label: '正常複利', color: '#1D9E75', width: 2.5 },
        { key: '僅崩盤一', label: '僅崩盤一', color: '#E24B4A', width: 2   },
        { key: '兩次崩盤', label: '兩次崩盤', color: '#BA7517', width: 2   },
        { key: '總投入',   label: '總投入',   color: '#888888', dash: '5 4', width: 1.5 },
      ]} height={260}
        refLines={[
          { x: `${c1.when}年`, color: '#E24B4A', label: '崩1' },
          ...(c2Invalid ? [] : [{ x: `${c2.when}年`, color: '#BA7517', label: '崩2' }]),
        ]}
      />

      <div style={{ display: 'flex', gap: 14, marginTop: 7, fontSize: 11, color: 'var(--c-text3)', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 3, background: '#1D9E75', display: 'inline-block' }} />正常複利</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 3, background: '#E24B4A', display: 'inline-block' }} />僅崩盤一</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 3, background: '#BA7517', display: 'inline-block' }} />兩次崩盤疊加</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 2, borderTop: '2px dashed #888', display: 'inline-block' }} />總投入</span>
      </div>

      <Note mt={8}>
        崩盤一（第{c1.when}年，-{c1.drop}%，{c1.model}型恢復{c1.rec}月）：{beC1}。
        {!c2Invalid && ` 崩盤二（第${c2.when}年，-${c2.drop}%，${c2.model}型恢復${c2.rec}月）在第一次尚未完全恢復時疊加衝擊：${beC2}。`}
      </Note>
      {c1.drop >= 50 && <Note type="warn">跌幅{c1.drop}%需反彈+{((1/(1-c1.drop/100)-1)*100).toFixed(0)}%才回本，屬極端壓力測試情境。</Note>}
    </div>
  )
}
