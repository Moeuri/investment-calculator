import { useState, useCallback } from 'react'
import DCATab     from './tabs/DCATab'
import CompareTab from './tabs/CompareTab'
import CrashTab   from './tabs/CrashTab'
import InflTab    from './tabs/InflTab'
import DrawTab    from './tabs/DrawTab'
import DivTab     from './tabs/DivTab'
import InsTab     from './tabs/InsTab'
import AboutTab   from './tabs/AboutTab'

const TABS = [
  { id: 'dca',     label: '📈 定期定額'        },
  { id: 'compare', label: '⚖️ 0050 vs 009816'  },
  { id: 'crash',   label: '💥 崩盤模擬'         },
  { id: 'infl',    label: '💰 通膨購買力'       },
  { id: 'draw',    label: '🏖️ 退休提領'         },
  { id: 'div',     label: '🎯 高股息ETF'        },
  { id: 'ins',     label: '🏦 儲蓄險 vs 股市'   },
  { id: 'about',   label: 'ℹ️ 關於'             },
]

const INIT = {
  // 定期定額
  amt:          200000,
  lumpSum:      0,
  per:          36,
  dr:           0.08,
  tax:          0,
  reinvestRate: 1,
  // 儲蓄險（全域，供通膨分頁讀取）
  insPrin:      7000000,
  insAnn:       150000,
  insPen:       0,
  // 通膨
  infl:         0.02,
  // 退休提領
  drawMo:       50000,
  drawRate:     0.08,
  retireAfter:  20,
  drawYears:    25,
  // 高股息
  dvTotal:      150000,
  dvW:          [40, 30, 30],
  dvTarget:     50000,
}

export default function App() {
  const [tab,   setTab]   = useState('dca')
  const [state, setState] = useState(INIT)

  const set = useCallback((key, val) => {
    setState(prev => ({ ...prev, [key]: val }))
  }, [])

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 16px 80px' }}>
      <div style={{
        padding: '16px 0 12px', borderBottom: '0.5px solid var(--c-border)',
        marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--c-text)' }}>大盤投資計算器</div>
          <div style={{ fontSize: 11, color: 'var(--c-text3)', marginTop: 2 }}>v1.7 · Huang Yen-han</div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--c-text3)', textAlign: 'right', lineHeight: 1.5 }}>
          每月投入 {(state.amt/10000).toFixed(1)}萬<br />
          年化 {(state.dr*100).toFixed(1)}%
        </div>
      </div>

      <div style={{
        display: 'flex', gap: 5, marginBottom: 18,
        overflowX: 'auto', paddingBottom: 2, WebkitOverflowScrolling: 'touch',
      }}>
        {TABS.map(t => {
          const on = t.id === tab
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '7px 13px', borderRadius: 'var(--radius-sm)',
              border: `0.5px solid ${on ? 'var(--c-border2)' : 'var(--c-border)'}`,
              background: on ? 'var(--c-bg3)' : 'var(--c-bg)',
              color: on ? 'var(--c-text)' : 'var(--c-text3)',
              fontSize: 12, fontWeight: on ? 600 : 400,
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            }}>{t.label}</button>
          )
        })}
      </div>

      {tab === 'dca'     && <DCATab     state={state} set={set} />}
      {tab === 'compare' && <CompareTab />}
      {tab === 'crash'   && <CrashTab   state={state} set={set} />}
      {tab === 'infl'    && <InflTab    state={state} set={set} />}
      {tab === 'draw'    && <DrawTab    state={state} set={set} />}
      {tab === 'div'     && <DivTab     state={state} set={set} />}
      {tab === 'ins'     && <InsTab     state={state} set={set} />}
      {tab === 'about'   && <AboutTab />}
    </div>
  )
}
