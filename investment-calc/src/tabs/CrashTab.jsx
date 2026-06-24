import { useState, useMemo } from 'react'
import { Card, Note, Slider, SectionTitle, SubTab, EventBtn, InvestChart, Legend, Divider } from '../components'
import { buildNorm, buildCrashN, fmtM, CRASH_EVENTS, EXP1 } from '../utils'

const MODEL_OPTS = [
  { v: 'V', label: 'V型（直線反彈）' },
  { v: 'U', label: 'U型（低點盤整）' },
]

const DEFAULT_CRASH = (when, evtIdx) => ({
  when,
  drop: CRASH_EVENTS[evtIdx].drop,
  rec:  CRASH_EVENTS[evtIdx].rec,
  model: CRASH_EVENTS[evtIdx].model,
  evtIdx,
  enabled: true,
})

function CrashParamPanel({ c, setC, label }) {
  function applyEvent(i) {
    setC({ ...c, drop: CRASH_EVENTS[i].drop, rec: CRASH_EVENTS[i].rec, model: CRASH_EVENTS[i].model, evtIdx: i })
  }

  const modelNote = c.evtIdx !== null ? CRASH_EVENTS[c.evtIdx]?.modelNote : null

  return (
    <div>
      {/* 啟用開關 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
          <input type="checkbox" checked={c.enabled} onChange={e => setC({ ...c, enabled: e.target.checked })}
            style={{ width: 16, height: 16, accentColor: 'var(--c-red)', cursor: 'pointer' }} />
          <span style={{ fontWeight: 600, color: c.enabled ? 'var(--c-text)' : 'var(--c-text3)' }}>
            {label} {c.enabled ? '（啟用）' : '（停用）'}
          </span>
        </label>
      </div>

      {c.enabled && (
        <>
          {/* 歷史事件 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 5, marginBottom: 12 }}>
            {CRASH_EVENTS.map((ev, i) => (
              <EventBtn key={i}
                label={ev.name.replace(' ', '\n')}
                sub={`-${ev.drop}%/${ev.rec}月`}
                modelNote={ev.modelNote}
                active={c.evtIdx === i}
                onClick={() => applyEvent(i)} />
            ))}
          </div>

          {/* 恢復模型說明 */}
          {modelNote && (
            <Note type="info" mt={0}>
              📖 歷史恢復模式：{modelNote}
            </Note>
          )}

          <div style={{ marginTop: 10 }}>
            <Slider label="崩盤發生（第幾年）" min={1} max={19} step={1}
              value={c.when} onChange={v => setC({ ...c, when: v })} fmt={v => `第 ${v} 年`} />
            <Slider label="最大跌幅" min={0} max={99} step={1}
              value={c.drop} onChange={v => setC({ ...c, drop: v, evtIdx: null })}
              fmt={v => v === 0 ? '0%（無崩跌）' : `-${v}%`} />
            <Slider label="恢復時間（月）" min={0} max={120} step={1}
              value={c.rec} onChange={v => setC({ ...c, rec: v, evtIdx: null })}
              fmt={v => `${v} 個月（約${(v/12).toFixed(1)}年）`} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--c-text2)', minWidth: 148, flexShrink: 0 }}>恢復模型</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {MODEL_OPTS.map(o => {
                  const on = c.model === o.v
                  return (
                    <button key={o.v} onClick={() => setC({ ...c, model: o.v, evtIdx: null })} style={{
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
        </>
      )}
    </div>
  )
}

export default function CrashTab({ state }) {
  const { amt, per, dr } = state
  const r1 = dr + 0.01 - EXP1

  const [subTab, setSubTab] = useState('c1')
  const [c1, setC1] = useState(DEFAULT_CRASH(3,  2))  // 金融海嘯
  const [c2, setC2] = useState(DEFAULT_CRASH(8,  3))  // 疫情
  const [c3, setC3] = useState({ ...DEFAULT_CRASH(13, 4), enabled: false })  // 升息，預設停用

  const crashes = [c1, c2, c3]

  // 驗證：後面的崩盤必須晚於前面
  const c2Invalid = c2.enabled && c1.enabled && c2.when <= c1.when
  const c3Invalid = c3.enabled && (
    (c1.enabled && c3.when <= c1.when) ||
    (c2.enabled && c3.when <= c2.when)
  )
  const hasError = c2Invalid || c3Invalid

  const { norm, crashSeries, chartData } = useMemo(() => {
    const norm = buildNorm(amt, per, r1)
    const cost = amt * per

    // 三條崩盤線：只有崩盤1、1+2、1+2+3
    const crash1only = buildCrashN(amt, per, r1, [c1])
    const crash12    = buildCrashN(amt, per, r1, [c1, c2])
    const crash123   = buildCrashN(amt, per, r1, [c1, c2, c3])

    const data = Array.from({ length: 20 }, (_, i) => {
      const y = i + 1, mo = y * 12
      const row = {
        year: `${y}年`,
        '正常複利': Math.round(norm[mo]),
        '總投入':   Math.round(Math.min(cost, amt * mo)),
      }
      if (c1.enabled) row['崩盤一'] = Math.round(crash1only[mo])
      if (c1.enabled && c2.enabled && !c2Invalid) row['崩盤一＋二'] = Math.round(crash12[mo])
      if (c1.enabled && c2.enabled && c3.enabled && !c2Invalid && !c3Invalid) row['三次崩盤'] = Math.round(crash123[mo])
      return row
    })
    return { norm, crashSeries: { crash1only, crash12, crash123 }, chartData: data }
  }, [amt, per, r1, c1, c2, c3, c2Invalid, c3Invalid])

  const refLines = [
    ...(c1.enabled ? [{ x: `${c1.when}年`, color: '#E24B4A', label: '崩1' }] : []),
    ...(c2.enabled && !c2Invalid ? [{ x: `${c2.when}年`, color: '#BA7517', label: '崩2' }] : []),
    ...(c3.enabled && !c3Invalid ? [{ x: `${c3.when}年`, color: '#9B59B6', label: '崩3' }] : []),
  ]

  const activeSeries = [
    { key: '正常複利',   label: '正常複利',   color: '#1D9E75', width: 2.5 },
    ...(c1.enabled ? [{ key: '崩盤一', label: '崩盤一', color: '#E24B4A', width: 2 }] : []),
    ...(c1.enabled && c2.enabled && !c2Invalid ? [{ key: '崩盤一＋二', label: '崩盤一＋二', color: '#BA7517', width: 2 }] : []),
    ...(c1.enabled && c2.enabled && c3.enabled && !c2Invalid && !c3Invalid ? [{ key: '三次崩盤', label: '三次崩盤', color: '#9B59B6', width: 2 }] : []),
    { key: '總投入', label: '總投入', color: '#888888', dash: '5 4', width: 1.5 },
  ]

  return (
    <div>
      <SubTab
        tabs={[
          { id: 'c1', label: `💥 崩盤一 ${c1.enabled ? '✓' : '○'}` },
          { id: 'c2', label: `💥 崩盤二 ${c2.enabled ? '✓' : '○'}` },
          { id: 'c3', label: `💥 崩盤三 ${c3.enabled ? '✓' : '○'}` },
        ]}
        value={subTab} onChange={setSubTab}
      />

      {hasError && (
        <Note type="warn" mt={0}>
          ⚠️ 崩盤時間順序有衝突：{c2Invalid ? `崩盤二（第${c2.when}年）須晚於崩盤一（第${c1.when}年）` : ''}
          {c3Invalid ? `崩盤三（第${c3.when}年）須晚於前兩次崩盤` : ''}
        </Note>
      )}

      <div style={{ marginTop: 8 }}>
        {subTab === 'c1' && <CrashParamPanel c={c1} setC={setC1} label="崩盤一" />}
        {subTab === 'c2' && <CrashParamPanel c={c2} setC={setC2} label="崩盤二" />}
        {subTab === 'c3' && <CrashParamPanel c={c3} setC={setC3} label="崩盤三" />}
      </div>

      <Divider />

      {/* 三卡摘要 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
        <Card label="正常複利20年" value={fmtM(norm[240])} sub="無崩盤基準" accent="#1D9E75" />
        <Card label={`崩盤一後20年 ${!c1.enabled?'（停用）':''}`}
          value={c1.enabled ? fmtM(crashSeries.crash1only[240]) : '—'}
          sub={c1.enabled ? `第${c1.when}年跌${c1.drop}%` : '勾選啟用崩盤一'}
          accent={c1.enabled ? '#E24B4A' : undefined} />
        <Card label={`全部崩盤後20年`}
          value={c1.enabled && c2.enabled && !c2Invalid && !c3Invalid ? fmtM(crashSeries.crash123[240]) : '—'}
          sub="所有啟用的崩盤疊加"
          accent="#9B59B6" />
      </div>

      <InvestChart data={chartData} series={activeSeries} height={260} refLines={refLines} />
      <Legend items={[
        { color: '#1D9E75', label: '正常複利' },
        ...(c1.enabled ? [{ color: '#E24B4A', label: '崩盤一' }] : []),
        ...(c1.enabled && c2.enabled && !c2Invalid ? [{ color: '#BA7517', label: '崩盤一＋二' }] : []),
        ...(c1.enabled && c2.enabled && c3.enabled && !c2Invalid && !c3Invalid ? [{ color: '#9B59B6', label: '三次崩盤' }] : []),
        { color: '#888888', label: '總投入', dash: true },
      ]} />

      <Note mt={8}>
        圖表同時顯示正常複利、各次崩盤疊加效果。每條線的差距代表對應崩盤造成的長期損失。
        勾選/取消各崩盤可即時比較有無該次崩盤的影響。
      </Note>
    </div>
  )
}
