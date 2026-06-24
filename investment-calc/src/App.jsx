import { useState, useCallback } from 'react'
import DCATab   from './tabs/DCATab'
import InsTab   from './tabs/InsTab'
import CrashTab from './tabs/CrashTab'
import InflTab  from './tabs/InflTab'
import DrawTab  from './tabs/DrawTab'
import DivTab   from './tabs/DivTab'

const TABS = [
  { id: 'dca',   label: '📈 定期定額'    },
  { id: 'ins',   label: '🏦 保險 vs 股市' },
  { id: 'crash', label: '💥 崩盤模擬'    },
  { id: 'infl',  label: '💰 通膨購買力'  },
  { id: 'draw',  label: '🏖️ 退休提領'    },
  { id: 'div',   label: '🎯 高股息ETF'   },
]

// 全域共用狀態（各分頁共用 dr、amt、per、tax）
const INIT = {
  // 定期定額
  amt:      200000,
  per:      36,
  dr:       0.105,
  tax:      0,
  // 保險
  insPrin:  7000000,
  insAnn:   150000,
  insPen:   0,
  // 通膨
  infl:     0.02,
  // 提領
  drawMo:   50000,
  drawRate: 0.08,
  // 高股息
  dvTotal:  7000000,
  dvW:      [40, 30, 30],
  dvTarget: 50000,
}

export default function App() {
  const [tab, setTab]     = useState('dca')
  const [state, setState] = useState(INIT)

  const set = useCallback((key, val) => {
    setState(prev => ({ ...prev, [key]: val }))
  }, [])

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 16px 80px' }}>
      {/* Header */}
      <div style={{
        padding: '16px 0 12px',
        borderBottom: '0.5px solid var(--c-border)',
        marginBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--c-text)' }}>大盤投資計算器</div>
          <div style={{ fontSize: 11, color: 'var(--c-text3)', marginTop: 2 }}>v1.1 · 009816 / 0050 / 高股息ETF</div>
        </div>
        <div style={{
          fontSize: 11, color: 'var(--c-text3)', textAlign: 'right', lineHeight: 1.5,
        }}>
          每月投入 {(state.amt / 10000).toFixed(0)}萬<br />
          年化 {(state.dr * 100).toFixed(1)}%
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{
        display: 'flex', gap: 5, marginBottom: 18,
        overflowX: 'auto', paddingBottom: 2,
        WebkitOverflowScrolling: 'touch',
      }}>
        {TABS.map(t => {
          const on = t.id === tab
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '7px 13px',
              borderRadius: 'var(--radius-sm)',
              border: `0.5px solid ${on ? 'var(--c-border2)' : 'var(--c-border)'}`,
              background: on ? 'var(--c-bg3)' : 'var(--c-bg)',
              color: on ? 'var(--c-text)' : 'var(--c-text3)',
              fontSize: 12, fontWeight: on ? 600 : 400,
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            }}>{t.label}</button>
          )
        })}
      </div>

      {/* Tab Content */}
      {tab === 'dca'   && <DCATab   state={state} set={set} />}
      {tab === 'ins'   && <InsTab   state={state} set={set} />}
      {tab === 'crash' && <CrashTab state={state} set={set} />}
      {tab === 'infl'  && <InflTab  state={state} set={set} />}
      {tab === 'draw'  && <DrawTab  state={state} set={set} />}
      {tab === 'div'   && <DivTab   state={state} set={set} />}

      {/* Footer */}
      <div style={{
        marginTop: 32, paddingTop: 12,
        borderTop: '0.5px solid var(--c-border)',
        fontSize: 11, color: 'var(--c-text3)', lineHeight: 1.6,
      }}>
        本計算器僅供個人試算參考，不構成投資建議。報酬率均為歷史估算，未來不保證相同。
        高股息ETF殖利率採歷史均值，實際配息依各投信公告為準。
      </div>
    </div>
  )
}
