import { useState, useMemo } from 'react'
import { Card, Note, SectionTitle, SubTab, InvestChart, Legend, Divider } from '../components'
import { buildNorm, buildCrashN, calcFan, fmtM, CRASH_EVENTS, EXP1, MONTH_VOL } from '../utils'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, ComposedChart,
} from 'recharts'

// 崩盤類型按鈕
function TypeBtn({ value, onChange }) {
  const opts = [
    {
      v: 'liquidity',
      label: '流動性危機',
      sub: '資金停泊調整，企業基本面未受結構性破壞',
      weight: '演算法：0.3×結構 ＋ 0.7×流動性',
      color: 'var(--c-blue)',
      bg: 'var(--c-blue-bg)',
    },
    {
      v: 'structural',
      label: '結構重置',
      sub: '估值體系或金融結構崩潰，難以回到前高',
      weight: '演算法：0.7×結構 ＋ 0.3×流動性',
      color: 'var(--c-red)',
      bg: 'var(--c-red-bg)',
    },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
      {opts.map(o => {
        const on = value === o.v
        return (
          <button key={o.v} onClick={() => onChange(o.v)} style={{
            padding: '10px 12px', borderRadius: 'var(--radius-sm)', textAlign: 'left',
            border: `1.5px solid ${on ? o.color : 'var(--c-border)'}`,
            background: on ? o.bg : 'var(--c-bg)', cursor: 'pointer',
          }}>
            <div style={{ fontSize: 13, fontWeight: on ? 700 : 500, color: on ? o.color : 'var(--c-text)', marginBottom: 3 }}>
              {o.label}
            </div>
            <div style={{ fontSize: 11, color: 'var(--c-text3)', lineHeight: 1.4, marginBottom: 4 }}>{o.sub}</div>
            <div style={{ fontSize: 10, color: on ? o.color : 'var(--c-text3)', opacity: 0.8 }}>{o.weight}</div>
          </button>
        )
      })}
    </div>
  )
}

// 跌幅滑桿（可點擊輸入）
function DropSlider({ value, onChange }) {
  const [editing, setEditing] = useState(false)
  const [raw, setRaw] = useState('')
  function commit() {
    const n = parseFloat(raw)
    if (!isNaN(n)) onChange(Math.min(99, Math.max(0, Math.round(n))))
    setEditing(false)
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <span style={{ fontSize: 13, color: 'var(--c-text2)', minWidth: 148, flexShrink: 0 }}>最大跌幅</span>
      <input type="range" min={0} max={99} step={1} value={value}
        onChange={e => onChange(Number(e.target.value))} style={{ flex: 1 }} />
      {editing
        ? <input autoFocus value={raw} onChange={e => setRaw(e.target.value)}
            onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
            style={{ width: 80, fontSize: 13, fontWeight: 600, textAlign: 'right', border: '1.5px solid var(--c-blue)', borderRadius: 4, padding: '2px 6px', background: 'var(--c-bg)', color: 'var(--c-text)', outline: 'none' }} />
        : <span onClick={() => { setRaw(String(value)); setEditing(true) }}
            style={{ fontSize: 13, fontWeight: 600, minWidth: 80, textAlign: 'right', cursor: 'text', borderBottom: '1px dashed var(--c-border2)', paddingBottom: 1 }}>
            {value === 0 ? '0%（無崩跌）' : `-${value}%`}
          </span>}
    </div>
  )
}

const DEFAULT_CRASH = (when, evtIdx) => ({
  when,
  drop: CRASH_EVENTS[evtIdx].drop,
  type: CRASH_EVENTS[evtIdx].type,
  evtIdx,
  enabled: true,
})

function CrashParamPanel({ c, setC, label }) {
  function applyEvent(i) {
    setC({ ...c, drop: CRASH_EVENTS[i].drop, type: CRASH_EVENTS[i].type, evtIdx: i })
  }
  const note = c.evtIdx !== null ? CRASH_EVENTS[c.evtIdx]?.note : null

  return (
    <div>
      {/* 啟用勾選 */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, marginBottom: 12 }}>
        <input type="checkbox" checked={c.enabled} onChange={e => setC({ ...c, enabled: e.target.checked })}
          style={{ width: 16, height: 16, accentColor: 'var(--c-red)', cursor: 'pointer' }} />
        <span style={{ fontWeight: 600, color: c.enabled ? 'var(--c-text)' : 'var(--c-text3)' }}>
          {label}　{c.enabled ? '（啟用）' : '（停用）'}
        </span>
      </label>

      {c.enabled && (
        <>
          {/* 歷史事件 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 5, marginBottom: 10 }}>
            {CRASH_EVENTS.map((ev, i) => (
              <button key={i} onClick={() => applyEvent(i)} style={{
                padding: '6px 3px', borderRadius: 'var(--radius-sm)', textAlign: 'center',
                border: `0.5px solid ${c.evtIdx === i ? 'transparent' : 'var(--c-border)'}`,
                background: c.evtIdx === i ? 'var(--c-red-bg)' : 'var(--c-bg)',
                color: c.evtIdx === i ? 'var(--c-red)' : 'var(--c-text2)',
                fontSize: 11, cursor: 'pointer', lineHeight: 1.4,
              }}>
                <div>{ev.name.split(' ')[0]}</div>
                <div style={{ fontSize: 10, marginTop: 2 }}>{ev.name.split(' ').slice(1).join(' ')}</div>
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>-{ev.drop}%</div>
              </button>
            ))}
          </div>

          {note && <Note type="info" mt={0}>{note}</Note>}

          {/* 崩盤類型 */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 13, color: 'var(--c-text2)', marginBottom: 8 }}>崩盤性質</div>
            <TypeBtn value={c.type} onChange={v => setC({ ...c, type: v, evtIdx: null })} />
          </div>

          {/* 發生年份 + 跌幅 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--c-text2)', minWidth: 148, flexShrink: 0 }}>崩盤發生（第幾年）</span>
            <input type="range" min={1} max={19} step={1} value={c.when}
              onChange={e => setC({ ...c, when: Number(e.target.value) })} style={{ flex: 1 }} />
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 80, textAlign: 'right' }}>第 {c.when} 年</span>
          </div>
          <DropSlider value={c.drop} onChange={v => setC({ ...c, drop: v, evtIdx: null })} />
        </>
      )}
    </div>
  )
}

export default function CrashTab({ state }) {
  const { amt, per, dr, lumpSum } = state
  const r1 = dr + 0.01 - EXP1
  const ls = lumpSum || 0

  const [subTab, setSubTab] = useState('c1')
  const [c1, setC1] = useState(DEFAULT_CRASH(3,  2))
  const [c2, setC2] = useState({ ...DEFAULT_CRASH(8,  3), enabled: false })
  const [c3, setC3] = useState({ ...DEFAULT_CRASH(13, 4), enabled: false })

  const c2Invalid = c2.enabled && c1.enabled && c2.when <= c1.when
  const c3Invalid = c3.enabled && (
    (c1.enabled && c3.when <= c1.when) ||
    (c2.enabled && c3.when <= c2.when)
  )

  const { chartData, summaryCards } = useMemo(() => {
    const norm = buildNorm(ls, amt, per, r1)
    const cost = ls + amt * per
    const crashes = [c1, c2, c3]
    const { vals: crashVals, fanStart } = buildCrashN(ls, amt, per, r1, crashes)
    const { upper, lower } = calcFan(crashVals, fanStart, MONTH_VOL)

    const data = Array.from({ length: 20 }, (_, i) => {
      const y = i + 1, mo = y * 12
      const cv = crashVals[mo]
      const isAfterFan = mo >= fanStart && fanStart >= 0  // 從崩盤月開始（含），確保起點接續中央線
      const upperVal = isAfterFan ? Math.round(upper[mo]) : null
      const lowerVal = isAfterFan ? Math.round(lower[mo]) : null
      return {
        year: `${y}年`,
        '正常複利':  Math.round(norm[mo]),
        '崩盤中央':  Math.round(cv),
        // stackId 技巧：fanBase 從 0 到下緣（透明），fanRange 從下緣到上緣（半透明紅）
        'fanBase':  lowerVal,
        'fanRange': (upperVal !== null && lowerVal !== null) ? upperVal - lowerVal : null,
        '扇形上緣': upperVal,
        '扇形下緣': lowerVal,
        '總投入':   Math.round(Math.min(cost, ls + amt * mo)),
      }
    })

    // 摘要卡片
    const activeCrashes = crashes.filter(c => c.enabled && c.drop > 0)
    const lastCrash = activeCrashes[activeCrashes.length - 1]
    const lastCrashMo = lastCrash ? lastCrash.when * 12 : 0
    const assetAtLastCrash = lastCrash ? norm[lastCrashMo] : 0
    const bottomAtLastCrash = lastCrash ? crashVals[lastCrashMo] : 0
    const finalCrash = crashVals[240]
    const finalNorm  = norm[240]

    return {
      chartData: data,
      summaryCards: { assetAtLastCrash, bottomAtLastCrash, finalCrash, finalNorm, lastCrash },
    }
  }, [ls, amt, per, r1, c1, c2, c3])

  return (
    <div>
      {/* 頂部警告 */}
      <div style={{
        background: '#C0392B', color: '#fff',
        borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 16,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
          ⚠️ 此模擬不是走勢預測，請先閱讀
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.7 }}>
          本頁面的唯一目的是幫助你評估：如果發生某種崩盤情境，你的資產會變成什麼樣子，以及你是否能在心理和財務上承受這個過程而不提前出場。<br />
          崩盤的發生時機、深度和恢復路徑在事前都無法預測。<b>提前在低點賣出才是定期定額投資者面臨崩盤時最大的風險，而不是帳面虧損本身。</b><br />
          扇形區域代表最後一次崩盤後的統計不確定性（±1個標準差，約68%機率區間），時間越遠不確定性越大。
        </div>
      </div>

      {/* 衝突警告 */}
      {(c2Invalid || c3Invalid) && (
        <Note type="warn" mt={0}>
          ⚠️ 崩盤時間順序衝突：{c2Invalid ? `崩盤二（第${c2.when}年）須晚於崩盤一（第${c1.when}年）。` : ''}
          {c3Invalid ? `崩盤三須晚於前兩次崩盤。` : ''}
        </Note>
      )}

      {/* 子Tab */}
      <SubTab
        tabs={[
          { id: 'c1', label: `💥 崩盤一次 ${c1.enabled ? '✓' : '○'}` },
          { id: 'c2', label: `💥 崩盤兩次 ${c2.enabled ? '✓' : '○'}` },
          { id: 'c3', label: `💥 崩盤三次 ${c3.enabled ? '✓' : '○'}` },
        ]}
        value={subTab} onChange={setSubTab}
      />

      <div style={{ marginBottom: 12 }}>
        {subTab === 'c1' && <CrashParamPanel c={c1} setC={setC1} label="崩盤一次" />}
        {subTab === 'c2' && <CrashParamPanel c={c2} setC={setC2} label="崩盤兩次" />}
        {subTab === 'c3' && <CrashParamPanel c={c3} setC={setC3} label="崩盤三次" />}
      </div>

      <Divider />

      {/* 摘要卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
        <Card label="正常複利20年（無崩盤）" value={fmtM(summaryCards.finalNorm)} sub="基準線" accent="#1D9E75" />
        <Card label="最後崩盤當下底部資產"
          value={summaryCards.lastCrash ? fmtM(summaryCards.bottomAtLastCrash) : '—'}
          sub={summaryCards.lastCrash ? `第${summaryCards.lastCrash.when}年，跌${summaryCards.lastCrash.drop}%` : '無啟用崩盤'}
          accent="#E24B4A" />
        <Card label="崩盤情境20年後（中央值）"
          value={fmtM(summaryCards.finalCrash)}
          sub={`vs 正常複利差 ${fmtM(summaryCards.finalNorm - summaryCards.finalCrash)}`}
          accent="#BA7517" />
      </div>

      {/* 扇形疊圖 */}
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--c-text3)' }} tickLine={false} />
          <YAxis tickFormatter={v => fmtM(v)} tick={{ fontSize: 11, fill: 'var(--c-text3)' }} tickLine={false} axisLine={false} width={52} />
          <Tooltip formatter={(v, name) => v !== null ? [fmtM(v), name] : null}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '0.5px solid var(--c-border)', background: 'var(--c-bg)' }} />
          {/* 扇形填色區：stackId 技巧，fanBase 透明（佔位到下緣），fanRange 半透明紅（下緣到上緣） */}
          <Area type="monotone" dataKey="fanBase" stackId="fan" stroke="none" fill="transparent" fillOpacity={0} legendType="none" />
          <Area type="monotone" dataKey="fanRange" stackId="fan" stroke="none" fill="#E24B4A" fillOpacity={0.15} legendType="none" />
          {/* 主線 */}
          <Line type="monotone" dataKey="正常複利" stroke="#1D9E75" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="崩盤中央" stroke="#E24B4A" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="扇形上緣" stroke="#E24B4A" strokeWidth={1} strokeDasharray="3 3" dot={false} />
          <Line type="monotone" dataKey="扇形下緣" stroke="#E24B4A" strokeWidth={1} strokeDasharray="3 3" dot={false} />
          <Line type="monotone" dataKey="總投入" stroke="#888888" strokeWidth={1.5} strokeDasharray="5 4" dot={false} />
        </ComposedChart>
      </ResponsiveContainer>

      <div style={{ display: 'flex', gap: 14, marginTop: 7, fontSize: 11, color: 'var(--c-text3)', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 12, height: 3, background: '#1D9E75', display: 'inline-block' }} />正常複利
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 12, height: 3, background: '#E24B4A', display: 'inline-block' }} />崩盤中央值
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 20, height: 8, background: 'rgba(226,75,74,0.15)', border: '1px dashed #E24B4A', display: 'inline-block', borderRadius: 2 }} />±1σ 扇形（68%區間）
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 12, height: 2, borderTop: '2px dashed #888', display: 'inline-block' }} />總投入
        </span>
      </div>

      <Divider />

      {/* 底部說明 */}
      <div style={{
        background: 'var(--c-bg2)', borderRadius: 'var(--radius)',
        padding: '14px 16px', fontSize: 12, color: 'var(--c-text2)', lineHeight: 1.8,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)', marginBottom: 8 }}>
          關於本模擬的計算邏輯
        </div>
        <div style={{ marginBottom: 8 }}>
          本模擬將股市崩盤分為兩種性質，但實際上兩者往往相互影響、同時發生，只是比例不同。
        </div>
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontWeight: 600, color: 'var(--c-blue)' }}>流動性危機型</span>：成因是資金在不同資產之間的快速移動，例如央行升降息改變資金的停泊成本、地緣政治衝突引發恐慌性拋售。這種情況下，多數企業的實際獲利能力和競爭地位並未受到根本破壞。資金重新找到定價共識後，市場有較大機率回到原有的成長趨勢線。
        </div>
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontWeight: 600, color: 'var(--c-red)' }}>結構重置型</span>：成因是市場估值體系本身的崩潰，或金融系統槓桿結構的瓦解。這種崩盤代表舊有的「合理價格」是錯的，市場不是在等待回到前高，而是在重新尋找新的均衡點。恢復期遠比流動性危機漫長，前高可能很多年甚至永遠不會被回測。
        </div>
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontWeight: 600 }}>加權融合</span>：本模型承認現實中兩種類型幾乎不會純粹獨立發生。流動性危機也會造成部分結構傷害，結構重置同時引發資金大規模移動。因此兩個按鈕對應的是不同的加權比例，而非非此即彼的二元選擇。
        </div>
        <div>
          <span style={{ fontWeight: 600 }}>扇形區間</span>：代表最後一次崩盤發生後，未來路徑的統計不確定性。採對數常態分佈，以台股歷史年化波動率約18%估算±1個標準差，時間越遠扇形越寬，反映「預測越遠越不確定」的現實。扇形的上下緣不是最好和最壞的情境，而是統計上約68%機率會落在其中的範圍。
        </div>
      </div>
    </div>
  )
}
