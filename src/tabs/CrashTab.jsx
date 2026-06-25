import { useState, useMemo } from 'react'
import { Card, Note, SectionTitle, SubTab, InvestChart, Legend, Divider } from '../components'
import { buildNorm, buildCrashN, calcFan, fmtM, CRASH_EVENTS, EXP1, MONTH_VOL } from '../utils'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, ComposedChart,
} from 'recharts'

function TypeBtn({ value, onChange }) {
  const opts = [
    { v: 'liquidity',  label: '流動性危機', sub: '資金停泊調整，企業基本面未受結構性破壞', weight: '演算法：0.3×結構 ＋ 0.7×流動性', color: 'var(--c-blue)', bg: 'var(--c-blue-bg)' },
    { v: 'structural', label: '結構重置',   sub: '估值體系或金融結構崩潰，難以回到前高',  weight: '演算法：0.7×結構 ＋ 0.3×流動性', color: 'var(--c-red)',  bg: 'var(--c-red-bg)'  },
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
            <div style={{ fontSize: 13, fontWeight: on ? 700 : 500, color: on ? o.color : 'var(--c-text)', marginBottom: 3 }}>{o.label}</div>
            <div style={{ fontSize: 11, color: 'var(--c-text3)', lineHeight: 1.4, marginBottom: 4 }}>{o.sub}</div>
            <div style={{ fontSize: 10, color: on ? o.color : 'var(--c-text3)', opacity: 0.8 }}>{o.weight}</div>
          </button>
        )
      })}
    </div>
  )
}

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
  when, drop: CRASH_EVENTS[evtIdx].drop, type: CRASH_EVENTS[evtIdx].type, evtIdx, enabled: true,
})

function CrashParamPanel({ c, setC, label }) {
  function applyEvent(i) {
    setC({ ...c, drop: CRASH_EVENTS[i].drop, type: CRASH_EVENTS[i].type, evtIdx: i })
  }
  const note = c.evtIdx !== null ? CRASH_EVENTS[c.evtIdx]?.note : null
  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, marginBottom: 12 }}>
        <input type="checkbox" checked={c.enabled} onChange={e => setC({ ...c, enabled: e.target.checked })}
          style={{ width: 16, height: 16, accentColor: 'var(--c-red)', cursor: 'pointer' }} />
        <span style={{ fontWeight: 600, color: c.enabled ? 'var(--c-text)' : 'var(--c-text3)' }}>
          {label}　{c.enabled ? '（啟用）' : '（停用）'}
        </span>
      </label>
      {c.enabled && (
        <>
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
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 13, color: 'var(--c-text2)', marginBottom: 8 }}>崩盤性質</div>
            <TypeBtn value={c.type} onChange={v => setC({ ...c, type: v, evtIdx: null })} />
          </div>
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

// 極端情境說明（可展開）
function ExtremeSection() {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginBottom: 16 }}>
      <button onClick={() => setOpen(v => !v)} style={{
        width: '100%', textAlign: 'left', padding: '10px 14px',
        borderRadius: open ? 'var(--radius) var(--radius) 0 0' : 'var(--radius)',
        cursor: 'pointer',
        border: '1px solid #C0392B',
        background: open ? '#1a0805' : 'transparent',
        color: '#E24B4A',
        fontSize: 13, fontWeight: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span>📚 超出模型範圍的三種歷史極端情境</span>
        <span style={{ fontSize: 14 }}>{open ? '▲ 收合' : '▼ 展開'}</span>
      </button>
      {open && (
        <div style={{
          border: '1px solid #C0392B', borderTop: 'none',
          borderRadius: '0 0 var(--radius) var(--radius)',
          padding: '14px 16px', fontSize: 12, lineHeight: 1.8,
          background: 'var(--c-bg2)',
        }}>
          <div style={{ fontSize: 12, color: 'var(--c-text3)', marginBottom: 14 }}>
            以下三個歷史事件的實際走勢超出本模型的設計範圍。了解它們「為什麼特殊」，有助於理解模型邊界在哪裡，以及為什麼本模型的中央預測通常比實際歷史更保守——歷史上大多數崩盤的實際恢復速度快於模型預期，主要原因見各條說明。
          </div>

          {/* 大蕭條 */}
          <div style={{ marginBottom: 16, paddingLeft: 12, borderLeft: '3px solid #E24B4A' }}>
            <div style={{ fontWeight: 700, color: 'var(--c-text)', marginBottom: 6, fontSize: 13 }}>
              💀 1929年美國大蕭條：跌89%，名目指數花了25年才回到前高
            </div>
            <div style={{ color: 'var(--c-text2)', marginBottom: 6 }}>
              這是有完整數據的歷史最嚴重崩盤。它之所以超出現代模型，是因為當時的制度環境完全不同——美元受金本位約束，美聯儲不只沒有護盤，反而在恐慌中<strong>升息</strong>，直接加速通縮螺旋。約9,000家銀行相繼倒閉，貨幣供給萎縮約三分之一，整個信用體系瓦解。疊加斯姆特—霍利關稅引發的貿易崩潰，以及隨後的二戰，最終名目指數等待25年才回到1929年高點。但含息後，有研究指出實際上7年左右投資人就已回本（因為1930年代是通縮期，現金購買力在升值）。
            </div>
            <div style={{ color: 'var(--c-text3)', fontSize: 11, padding: '6px 10px', background: 'var(--c-bg3)', borderRadius: 4 }}>
              現代適用性：金本位已廢除（1971年），現代央行的工具箱截然不同，FDIC存款保險制度防止了銀行連鎖倒閉。2008年時，柏南克正是大蕭條研究專家，他以「不重蹈1930年代錯誤」為政策準則，避免了更糟的結果。現代版「大蕭條式崩盤」在制度上有足夠多的防火牆，但不代表不可能，只是機率極低。
            </div>
          </div>

          {/* 日本 */}
          <div style={{ marginBottom: 16, paddingLeft: 12, borderLeft: '3px solid #BA7517' }}>
            <div style={{ fontWeight: 700, color: 'var(--c-text)', marginBottom: 6, fontSize: 13 }}>
              🇯🇵 1989年日本資產泡沫：跌82%，已知唯一「現代央行介入仍長期無效」的案例
            </div>
            <div style={{ color: 'var(--c-text2)', marginBottom: 6 }}>
              日本案例是所有已開發市場中唯一的異例——股市與房市泡沫同時破裂，留下銀行體系龐大壞帳，但真正讓它無法恢復的是<strong>三重結構問題同時疊加</strong>：第一，少子化與人口老化加速，勞動力萎縮使長期成長引擎熄火；第二，通縮螺旋讓「降息刺激消費」機制完全失效——利率已降至零，但「明天東西更便宜」的心態讓消費者持續延後支出；第三，政策時機失誤——1997年在經濟尚未復甦時提高消費稅，直接引發第二次衰退。「殭屍企業」問題讓銀行不敢認列壞帳，阻礙了正常的創造性破壞。
            </div>
            <div style={{ color: 'var(--c-text3)', fontSize: 11, padding: '6px 10px', background: 'var(--c-bg3)', borderRadius: 4 }}>
              台灣適用性：台灣同樣面臨低生育率問題，但台積電等企業的全球競爭力提供強勁外需支撐，與日本1990年代後的內需依賴結構不同。此情境作為「極端悲觀壓力測試」有參考價值，但直接套用需謹慎。
            </div>
          </div>

          {/* 2020 */}
          <div style={{ paddingLeft: 12, borderLeft: '3px solid #1D9E75' }}>
            <div style={{ fontWeight: 700, color: 'var(--c-text)', marginBottom: 6, fontSize: 13 }}>
              🚀 2020年疫情崩盤：跌34%，4個月回本，史上最快V型反彈
            </div>
            <div style={{ color: 'var(--c-text2)', marginBottom: 6 }}>
              這是歷史上恢復最快的系統性崩盤，快到本模型根本無法模擬。關鍵在於政策響應的<strong>速度與規模都是史無前例</strong>。美聯儲比正式開會時間提前兩天緊急降息至零，並以每天最高1,250億美元的速度購買資產，資產負債表在兩個月內從4.5兆暴增至7兆美元。美國國會同步通過約5.8兆美元財政刺激，約佔GDP的28%。更關鍵的是，這次崩盤的原因（病毒）和解藥（疫苗、封控解除）清晰可見，企業競爭力與金融結構完好無損，市場在「等待解藥」的共識下快速重建信心。
            </div>
            <div style={{ color: 'var(--c-text3)', fontSize: 11, padding: '6px 10px', background: 'var(--c-bg3)', borderRadius: 4 }}>
              代表意義：2020年是「現代央行工具箱在最有利條件下的最佳表現」。它說明了為什麼歷史上實際走勢往往比保守模型更樂觀。但這個條件組合（原因清晰、工具齊備、企業基本面未受損、各國同步刺激）並非每次崩盤都具備，不能作為「崩跌後必然快速恢復」的保證。
            </div>
            <div style={{ marginTop: 8, padding: '7px 10px', background: '#1a2e1a', border: '1px solid #2d5a2d', borderRadius: 4, fontSize: 11, color: '#7ec87e', lineHeight: 1.6 }}>
              ⚠️ 模型套用提醒：本計算器的歷史事件選單包含「2020疫情崩盤」選項，但套用後的中央預測與分布範圍<strong>無法反映4個月閃回這個現實</strong>。若選用此事件，後續的扇形分布區間將嚴重低估上行可能性，請將此情境理解為「如果這次崩跌沒有史無前例的政策介入會怎樣」的壓力測試，而非對2020年實際情況的模擬。
            </div>
          </div>
        </div>
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
  const c3Invalid = c3.enabled && ((c1.enabled && c3.when <= c1.when) || (c2.enabled && c3.when <= c2.when))

  const { chartData, summaryCards } = useMemo(() => {
    const norm = buildNorm(ls, amt, per, r1)
    const cost = ls + amt * per
    const crashes = [c1, c2, c3]
    const { vals: crashVals, fanStart } = buildCrashN(ls, amt, per, r1, crashes)
    const { upper, lower } = calcFan(crashVals, fanStart, MONTH_VOL)

    const data = Array.from({ length: 20 }, (_, i) => {
      const y = i + 1, mo = y * 12
      const cv = crashVals[mo]
      const isAfterFan = mo >= fanStart && fanStart >= 0
      const upperVal = isAfterFan ? Math.round(upper[mo]) : null
      const lowerVal = isAfterFan ? Math.round(lower[mo]) : null
      return {
        year: `${y}年`,
        '正常複利': Math.round(norm[mo]),
        '中央預測': Math.round(cv),
        'fanBase':  lowerVal,
        'fanRange': (upperVal !== null && lowerVal !== null) ? upperVal - lowerVal : null,
        '分布上緣': upperVal,
        '分布下緣': lowerVal,
        '總投入':   Math.round(Math.min(cost, ls + amt * mo)),
      }
    })

    const activeCrashes = crashes.filter(c => c.enabled && c.drop > 0)
    const lastCrash = activeCrashes[activeCrashes.length - 1]
    const lastCrashMo = lastCrash ? lastCrash.when * 12 : 0
    const assetAtLastCrash  = lastCrash ? norm[lastCrashMo] : 0
    const bottomAtLastCrash = lastCrash ? crashVals[lastCrashMo] : 0
    const finalCrash  = crashVals[240]
    const finalNorm   = norm[240]
    const finalUpper  = upper[240]
    const finalLower  = lower[240]

    return {
      chartData: data,
      summaryCards: { assetAtLastCrash, bottomAtLastCrash, finalCrash, finalNorm, finalUpper, finalLower, lastCrash },
    }
  }, [ls, amt, per, r1, c1, c2, c3])

  return (
    <div>
      {/* ── 頂部紅色警告 ── */}
      <div style={{ background: '#C0392B', color: '#fff', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>⚠️ 此模擬不是走勢預測，請先閱讀</div>
        <div style={{ fontSize: 12, lineHeight: 1.7 }}>
          本頁面的唯一目的是幫助你評估：如果發生某種崩盤情境，你的資產會變成什麼樣子，以及你是否能在心理和財務上承受這個過程而不提前出場。
          崩盤的發生時機、深度和恢復路徑在事前都無法預測。<b>提前在低點賣出才是定期定額投資者面臨崩盤時最大的風險，而不是帳面虧損本身。</b><br />
          分布區間（扇形）代表最後一次崩盤後的統計不確定性（±1σ，約68%機率），時間越遠分布越寬。
        </div>
      </div>

      {/* ── 衝突警告 ── */}
      {(c2Invalid || c3Invalid) && (
        <Note type="warn" mt={0}>
          ⚠️ 崩盤時間順序衝突：{c2Invalid ? `崩盤兩次（第${c2.when}年）須晚於崩盤一次（第${c1.when}年）。` : ''}
          {c3Invalid ? `崩盤三次須晚於前兩次崩盤。` : ''}
        </Note>
      )}

      {/* ── 子Tab ── */}
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

      {/* ── 摘要卡片 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
        <Card label="正常複利20年（無崩盤）" value={fmtM(summaryCards.finalNorm)} sub="基準線" accent="#1D9E75" />
        <Card label="最後崩盤當下底部資產"
          value={summaryCards.lastCrash ? fmtM(summaryCards.bottomAtLastCrash) : '—'}
          sub={summaryCards.lastCrash ? `第${summaryCards.lastCrash.when}年，跌${summaryCards.lastCrash.drop}%` : '無啟用崩盤'}
          accent="#E24B4A" />
        <Card label="崩盤情境20年後（68%分布區間）"
          value={`${fmtM(summaryCards.finalLower)} ~ ${fmtM(summaryCards.finalUpper)}`}
          sub={`vs 正常複利差 ${fmtM(summaryCards.finalNorm - summaryCards.finalUpper)} ~ ${fmtM(summaryCards.finalNorm - summaryCards.finalLower)}`}
          accent="#BA7517" />
      </div>

      {/* ── 扇形疊圖 ── */}
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--c-text3)' }} tickLine={false} />
          <YAxis tickFormatter={v => fmtM(v)} tick={{ fontSize: 11, fill: 'var(--c-text3)' }} tickLine={false} axisLine={false} width={52} />
          <Tooltip
            formatter={(v, name) => {
              if (['fanBase','fanRange'].includes(name)) return null
              return v !== null ? [fmtM(v), name] : null
            }}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '0.5px solid var(--c-border)', background: 'var(--c-bg)' }}
          />
          <Area type="monotone" dataKey="fanBase"  stackId="fan" stroke="none" fill="transparent" fillOpacity={0} legendType="none" tooltipType="none" />
          <Area type="monotone" dataKey="fanRange" stackId="fan" stroke="none" fill="#E24B4A" fillOpacity={0.15} legendType="none" tooltipType="none" />
          <Line type="monotone" dataKey="正常複利" name="正常複利" stroke="#1D9E75" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="分布上緣" name="分布上緣" stroke="#E24B4A" strokeWidth={1} strokeDasharray="3 3" dot={false} />
          <Line type="monotone" dataKey="中央預測" name="中央預測" stroke="#E24B4A" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="分布下緣" name="分布下緣" stroke="#E24B4A" strokeWidth={1} strokeDasharray="3 3" dot={false} />
          <Line type="monotone" dataKey="總投入"   name="總投入"   stroke="#888888" strokeWidth={1.5} strokeDasharray="5 4" dot={false} />
        </ComposedChart>
      </ResponsiveContainer>

      <div style={{ display: 'flex', gap: 14, marginTop: 7, fontSize: 11, color: 'var(--c-text3)', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 3, background: '#1D9E75', display: 'inline-block' }} />正常複利</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 2, borderTop: '1px dashed #E24B4A', display: 'inline-block' }} />分布上緣</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 3, background: '#E24B4A', display: 'inline-block' }} />中央預測</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 2, borderTop: '1px dashed #E24B4A', display: 'inline-block' }} />分布下緣</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 20, height: 8, background: 'rgba(226,75,74,0.15)', border: '1px dashed #E24B4A', display: 'inline-block', borderRadius: 2 }} />68% 分布區間</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 2, borderTop: '2px dashed #888', display: 'inline-block' }} />總投入</span>
      </div>

      <Divider />

      {/* ── 可展開：極端情境說明 ── */}
      <ExtremeSection />

      {/* ── 底部計算邏輯說明 ── */}
      <div style={{ background: 'var(--c-bg2)', borderRadius: 'var(--radius)', padding: '14px 16px', fontSize: 12, color: 'var(--c-text2)', lineHeight: 1.8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)', marginBottom: 8 }}>關於本模擬的計算邏輯</div>
        <div style={{ marginBottom: 8 }}>本模擬將股市崩盤分為兩種性質，但實際上兩者往往相互影響、同時發生，只是比例不同。</div>
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontWeight: 600, color: 'var(--c-blue)' }}>流動性危機型</span>：成因是資金在不同資產之間的快速移動，例如央行升降息改變資金的停泊成本、地緣政治衝突引發恐慌性拋售。這種情況下，多數企業的實際獲利能力和競爭地位並未受到根本破壞。資金重新找到定價共識後，市場有較大機率回到原有的成長趨勢線。
        </div>
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontWeight: 600, color: 'var(--c-red)' }}>結構重置型</span>：成因是市場估值體系本身的崩潰，或金融系統槓桿結構的瓦解。這種崩盤代表舊有的「合理價格」是錯的，市場不是在等待回到前高，而是在重新尋找新的均衡點。恢復期遠比流動性危機漫長，前高可能很多年甚至永遠不會被回測。
        </div>
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontWeight: 600 }}>加權融合</span>：本模型承認現實中兩種類型幾乎不會純粹獨立發生。流動性危機也會造成部分結構傷害，結構重置同時引發資金大規模移動。因此兩個按鈕對應的是不同的加權比例，而非非此即彼的二元選擇。
        </div>
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontWeight: 600 }}>為什麼歷史上實際走勢常在中央預測以上</span>：本模型是基於「市場自行運作」的保守估算。實際崩盤後，通常有三股力量同時拉升恢復速度：第一，<strong>政府貨幣政策護盤</strong>——系統性崩盤後，央行幾乎必然採取寬鬆措施，這是一個不對稱的安全網（市場跌20%央行不一定介入，但跌50%幾乎必然介入）；第二，<strong>機構投資人逢低加注</strong>——大型退休基金、主權財富基金的資產配置義務會在股市大跌時觸發強制性買入，這些機構管理的資金規模在過去50年持續增加；第三，<strong>通膨環境的名目抬升</strong>——在正常通膨環境下，企業獲利和股市名目指數會隨物價上升而被抬高，這也是「含息後的實質恢復」往往比名目指數快得多的原因。這三個因素讓歷史上的實際恢復速度，往往優於只靠市場自行復原的模型預測。
        </div>
        <div>
          <span style={{ fontWeight: 600 }}>分布區間與分布上緣超過正常複利線</span>：分布區間（扇形）代表最後一次崩盤後的統計不確定性，採對數常態分佈、±1σ（約68%機率）。時間越遠分布越寬。分布上緣有時會超過正常複利線，這在統計學上完全合理——樂觀情境下，崩後低點累積的定期定額單位數、政策刺激帶來的超額報酬、或指數估值的修復，確實可能讓資產超越「沒有崩盤的假設路徑」，2020年疫情後的走勢就是真實案例。<strong>使用這個模擬的正確方式：專注於分布下緣——「如果是最悲觀的情境，我能不能撐住不在低點賣出？」能夠回答「是」，才算通過了這個壓力測試。</strong>
        </div>
      </div>
    </div>
  )
}
