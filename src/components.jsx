import { useState, useRef, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { fmtM } from './utils'

// ── 卡片 ──────────────────────────────────────────
export function Card({ label, value, sub, accent }) {
  return (
    <div style={{
      background: 'var(--c-bg2)', borderRadius: 'var(--radius)',
      padding: '10px 12px',
      borderLeft: accent ? `3px solid ${accent}` : undefined,
    }}>
      <div style={{ fontSize: 11, color: 'var(--c-text3)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--c-text)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--c-text3)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// ── 提示框 ────────────────────────────────────────
const NOTE_STYLES = {
  note: { bg: 'var(--c-bg2)',     color: 'var(--c-text2)'  },
  info: { bg: 'var(--c-info-bg)', color: 'var(--c-info)'   },
  warn: { bg: 'var(--c-warn-bg)', color: 'var(--c-warn)'   },
  suc:  { bg: 'var(--c-suc-bg)',  color: 'var(--c-suc)'    },
  red:  { bg: 'var(--c-red-bg)',  color: 'var(--c-red)'    },
}
export function Note({ children, type = 'note', mt = 8 }) {
  const s = NOTE_STYLES[type] || NOTE_STYLES.note
  return (
    <div style={{
      background: s.bg, color: s.color, borderRadius: 'var(--radius)',
      padding: '9px 12px', fontSize: 12, lineHeight: 1.65, marginTop: mt,
    }}>{children}</div>
  )
}

// ── 分隔線 ────────────────────────────────────────
export function Divider({ my = 12 }) {
  return <div style={{ borderTop: '0.5px solid var(--c-border)', margin: `${my}px 0` }} />
}

// ── 章節標題 ─────────────────────────────────────
export function SectionTitle({ children, mt = 0 }) {
  return <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)', marginBottom: 10, marginTop: mt }}>{children}</div>
}

// ── 可點擊輸入的數值顯示 ─────────────────────────
function EditableVal({ value, min, max, step, fmt, onChange }) {
  const [editing, setEditing] = useState(false)
  const [raw, setRaw] = useState('')
  const inputRef = useRef(null)

  function startEdit() {
    setRaw(String(value))
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }
  function commit() {
    const n = parseFloat(raw.replace(/,/g, ''))
    if (!isNaN(n)) {
      const clamped = Math.min(max, Math.max(min, Math.round(n / step) * step))
      onChange(clamped)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <input ref={inputRef} value={raw} onChange={e => setRaw(e.target.value)}
        onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        style={{
          fontSize: 13, fontWeight: 600, width: 120, textAlign: 'right',
          border: '1.5px solid var(--c-blue)', borderRadius: 4,
          padding: '2px 6px', background: 'var(--c-bg)', color: 'var(--c-text)',
          outline: 'none',
        }} />
    )
  }
  return (
    <span onClick={startEdit} title="點擊直接輸入" style={{
      fontSize: 13, fontWeight: 600, minWidth: 112, textAlign: 'right',
      color: 'var(--c-text)', cursor: 'text',
      borderBottom: '1px dashed var(--c-border2)', paddingBottom: 1,
      display: 'inline-block',
    }}>{fmt ? fmt(value) : value}</span>
  )
}

// ── 滑桿列（含可點擊輸入） ────────────────────────
export function Slider({ label, min, max, step, value, onChange, fmt }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <span style={{ fontSize: 13, color: 'var(--c-text2)', minWidth: 148, flexShrink: 0 }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))} style={{ flex: 1 }} />
      <EditableVal value={value} min={min} max={max} step={step} fmt={fmt} onChange={onChange} />
    </div>
  )
}

// ── 按鈕群組 ─────────────────────────────────────
export function BtnGroup({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', flex: 1 }}>
      {options.map(o => {
        const on = o.v === value
        return (
          <button key={String(o.v)} onClick={() => onChange(o.v)} style={{
            padding: '5px 11px', borderRadius: 'var(--radius-sm)',
            border: `0.5px solid ${on ? 'transparent' : 'var(--c-border2)'}`,
            background: on ? 'var(--c-blue-bg)' : 'var(--c-bg)',
            color: on ? 'var(--c-blue)' : 'var(--c-text2)',
            fontSize: 12, fontWeight: on ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>{o.label}</button>
        )
      })}
    </div>
  )
}

// ── 事件按鈕（崩盤歷史） ──────────────────────────
export function EventBtn({ label, sub, modelNote, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 4px', borderRadius: 'var(--radius-sm)',
      border: `0.5px solid ${active ? 'transparent' : 'var(--c-border)'}`,
      background: active ? 'var(--c-red-bg)' : 'var(--c-bg)',
      color: active ? 'var(--c-red)' : 'var(--c-text2)',
      fontSize: 11, lineHeight: 1.4, textAlign: 'center',
      cursor: 'pointer', fontWeight: active ? 600 : 400,
      width: '100%',
    }}>
      <div>{label}</div>
      <div style={{ fontSize: 10, opacity: 0.75, marginTop: 2 }}>{sub}</div>
      {modelNote && <div style={{ fontSize: 9, opacity: 0.65, marginTop: 2, lineHeight: 1.3 }}>{modelNote}</div>}
    </button>
  )
}

// ── 相圖區（投入 vs 持有） ────────────────────────
export function PhaseBar({ per }) {
  const pct = per / 240
  const holdYrs = (20 - per / 12).toFixed(1)
  const perLabel = per % 12 === 0 ? `${per / 12}年` : `${Math.floor(per / 12)}年${per % 12}月`
  return (
    <div style={{ display: 'flex', height: 22, borderRadius: 'var(--radius)', overflow: 'hidden', margin: '10px 0', fontSize: 11 }}>
      <div style={{ flex: pct, background: 'var(--c-blue-bg)', color: 'var(--c-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, overflow: 'hidden', minWidth: 0 }}>
        投入 {perLabel}
      </div>
      <div style={{ flex: 1 - pct, background: 'var(--c-green-bg)', color: 'var(--c-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, overflow: 'hidden', minWidth: 0 }}>
        持有複利 {holdYrs}年
      </div>
    </div>
  )
}

// ── 子Tab ─────────────────────────────────────────
export function SubTab({ tabs, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 5, marginBottom: 12 }}>
      {tabs.map(t => {
        const on = t.id === value
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            padding: '5px 14px', borderRadius: 'var(--radius-sm)',
            border: `0.5px solid ${on ? 'var(--c-border2)' : 'var(--c-border)'}`,
            background: on ? 'var(--c-bg3)' : 'var(--c-bg)',
            color: on ? 'var(--c-text)' : 'var(--c-text3)',
            fontSize: 12, fontWeight: on ? 600 : 400, cursor: 'pointer',
          }}>{t.label}</button>
        )
      })}
    </div>
  )
}

// ── Recharts 圖表 ─────────────────────────────────
export function InvestChart({ data, series, height = 220, refLines = [], xKey = 'year' }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: 'var(--c-text3)' }} tickLine={false} />
        <YAxis tickFormatter={v => fmtM(v)} tick={{ fontSize: 11, fill: 'var(--c-text3)' }} tickLine={false} axisLine={false} width={52} />
        <Tooltip
          formatter={(v, name) => [fmtM(v), name]}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '0.5px solid var(--c-border)', background: 'var(--c-bg)' }}
        />
        {refLines.map((r, i) => (
          <ReferenceLine key={i} x={r.x} stroke={r.color || 'var(--c-text3)'}
            strokeDasharray="4 3"
            label={{ value: r.label, fontSize: 10, fill: r.color || 'var(--c-text3)', position: 'top' }} />
        ))}
        {series.map(s => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.label}
            stroke={s.color} strokeWidth={s.width || 2.5}
            strokeDasharray={s.dash || undefined}
            dot={false} activeDot={{ r: 4 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

// ── 圖例列 ────────────────────────────────────────
export function Legend({ items }) {
  return (
    <div style={{ display: 'flex', gap: 14, marginTop: 7, fontSize: 11, color: 'var(--c-text3)', flexWrap: 'wrap' }}>
      {items.map((it, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{
            width: 12, height: it.dash ? 2 : 3,
            background: it.color, display: 'inline-block',
            borderTop: it.dash ? `2px dashed ${it.color}` : undefined,
          }} />
          {it.label}
        </span>
      ))}
    </div>
  )
}
