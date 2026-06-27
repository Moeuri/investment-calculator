import { useState, useCallback, useEffect } from 'react'
import DCATab      from './tabs/DCATab'
import CompareTab  from './tabs/CompareTab'
import CrashTab    from './tabs/CrashTab'
import InflTab     from './tabs/InflTab'
import DrawTab     from './tabs/DrawTab'
import DivTab      from './tabs/DivTab'
import InsTab      from './tabs/InsTab'
import BuyCalcTab  from './tabs/BuyCalcTab'
import AboutTab    from './tabs/AboutTab'

const TABS = [
  { id: 'dca',     label: '📈 定期定額'        },
  { id: 'buycalc', label: '📐 買入試算'         },
  { id: 'compare', label: '⚖️ 0050 vs 009816'  },
  { id: 'crash',   label: '💥 崩盤模擬'         },
  { id: 'infl',    label: '💰 通膨購買力'       },
  { id: 'draw',    label: '🏖️ 退休提領'         },
  { id: 'div',     label: '🎯 高股息ETF'        },
  { id: 'ins',     label: '🏦 儲蓄險 vs 股市'   },
  { id: 'about',   label: 'ℹ️ 關於'             },
]

const INIT = {
  amt:          0,
  lumpSum:      0,
  per:          36,
  dr:           0.08,
  tax:          0,
  reinvestRate: 1,
  insPrin:      0,
  insAnn:       0,
  insPen:       0,
  infl:         0.02,
  drawMo:       50000,
  drawRate:     0.08,
  retireAfter:  20,
  drawYears:    25,
  dvTotal:      150000,
  dvW:          [40, 30, 30],
  dvTarget:     50000,
}

const FONT_SIZES = [
  { v: 'small',  label: '小' },
  { v: 'medium', label: '中' },
  { v: 'large',  label: '大' },
]

export default function App() {
  const [tab,      setTab]      = useState('dca')
  const [state,    setState]    = useState(INIT)
  const [fontSize, setFontSize] = useState('medium')

  useEffect(() => {
    document.documentElement.setAttribute('data-font', fontSize)
  }, [fontSize])

  const set = useCallback((key, val) => {
    setState(prev => ({ ...prev, [key]: val }))
  }, [])

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 16px 80px' }}>
      {/* Header */}
      <div style={{
        padding: '16px 0 12px', borderBottom: '0.5px solid var(--c-border)',
        marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--c-text)' }}>大盤投資計算器</div>
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--c-text3)', marginTop: 2 }}>v1.8.1 · Huang Yen-han</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--c-text3)', marginRight: 4 }}>字體</span>
            {FONT_SIZES.map(f => (
              <button key={f.v} onClick={() => setFontSize(f.v)} style={{
                padding: '2px 8px', borderRadius: 4, fontSize: 11, cursor: 'pointer',
                border: `0.5px solid ${fontSize === f.v ? 'var(--c-green)' : 'var(--c-border2)'}`,
                background: fontSize === f.v ? 'var(--c-green-bg)' : 'var(--c-bg)',
                color: fontSize === f.v ? 'var(--c-green)' : 'var(--c-text3)',
                fontWeight: fontSize === f.v ? 600 : 400,
              }}>{f.label}</button>
            ))}
          </div>
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--c-text3)', textAlign: 'right', lineHeight: 1.5 }}>
            每月投入 {(state.amt / 10000).toFixed(1)}萬　年化 {(state.dr * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Tab Bar */}
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
              fontSize: 'var(--font-sm)', fontWeight: on ? 600 : 400,
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            }}>{t.label}</button>
          )
        })}
      </div>

      {/* Tab Content */}
      {tab === 'dca'     && <DCATab     state={state} set={set} />}
      {tab === 'buycalc' && <BuyCalcTab />}
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
