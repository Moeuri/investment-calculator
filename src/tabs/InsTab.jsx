import { useMemo } from 'react'
import { Card, Note, Slider, SectionTitle, InvestChart, Legend, Divider } from '../components'
import { fmtM, fmtPA, EXP1 } from '../utils'

const PROS_CONS = {
  ins: {
    pros: [
      '完全保本：只要不提前解約，本金不會因市場波動而縮水',
      '固定利率保證：鎖定契約時的利率，不受市場利率下行影響',
      '強迫儲蓄機制：定期繳費的紀律讓難以自律的人能積累資產',
      '壽險保障附加：部分儲蓄險含壽險成分，身故有理賠',
      '心理安全感：帳面數字不會下跌，對極度風險趨避者有極高價值',
      '遺產規劃工具：指定受益人可規避遺產稅，部分高資產族群有特殊需求',
    ],
    cons: [
      '閉鎖期長（通常6年以上）：提前解約本金受損，流動性極差',
      '實際利率偏低：扣除通膨後實質報酬率可能趨近於零甚至負值',
      '通膨侵蝕：20年後領回的每年15萬，實質購買力可能只剩今日10萬',
      '機會成本高：同樣資金若投入大盤ETF，長期差距可能超過數倍',
      '複雜費用結構：前期費用、附加費率不透明，實際報酬難以精確計算',
      '利率風險單向：若市場利率上升，你被鎖在低利率合約裡',
    ],
  },
  etf: {
    pros: [
      '長期報酬率顯著較高：台股歷史含息年化約10%，遠勝儲蓄險',
      '高流動性：隨時可以賣出，沒有閉鎖期，資金不被綁死',
      '費用率極低：009816總費用率約0.097%，幾乎零摩擦',
      '透明度高：每日可查淨值，成分股公開，無隱藏費用',
      '複利自動累積（009816）：不配息設計讓股利直接滾入淨值',
      '抗通膨：長期報酬率高於通膨，實質購買力持續成長',
    ],
    cons: [
      '無保本機制：市場下跌時帳面虧損無可避免，需要心理承受能力',
      '短期波動大：遭遇系統性崩盤可能帳面虧損30–60%，考驗持有紀律',
      '需要投資知識：要理解ETF運作、選擇標的，門檻對完全新手略高',
      '無強迫儲蓄：自律差者可能隨時贖回，打亂長期計畫',
      '心理壓力：帳面數字下跌時的焦慮感是真實存在的挑戰',
      '配息稅負（0050）：需自行處理配息再投入與稅務申報',
    ],
  },
}

function ProsCons() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '12px 0' }}>
        {/* 儲蓄險 */}
        <div style={{ borderRadius: 'var(--radius)', border: '0.5px solid var(--c-border)', overflow: 'hidden' }}>
          <div style={{ background: '#BA7517', color: '#fff', padding: '8px 12px', fontSize: 13, fontWeight: 700 }}>
            🏦 儲蓄型保險
          </div>
          <div style={{ padding: '10px 12px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-suc)', marginBottom: 6 }}>✅ 優點</div>
            {PROS_CONS.ins.pros.map((p, i) => (
              <div key={i} style={{ fontSize: 11, color: 'var(--c-text2)', lineHeight: 1.6, marginBottom: 4, display: 'flex', gap: 6 }}>
                <span style={{ color: 'var(--c-green)', flexShrink: 0 }}>+</span>{p}
              </div>
            ))}
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-red)', margin: '10px 0 6px' }}>❌ 缺點</div>
            {PROS_CONS.ins.cons.map((p, i) => (
              <div key={i} style={{ fontSize: 11, color: 'var(--c-text2)', lineHeight: 1.6, marginBottom: 4, display: 'flex', gap: 6 }}>
                <span style={{ color: 'var(--c-red)', flexShrink: 0 }}>−</span>{p}
              </div>
            ))}
          </div>
        </div>
        {/* 大盤ETF */}
        <div style={{ borderRadius: 'var(--radius)', border: '0.5px solid var(--c-border)', overflow: 'hidden' }}>
          <div style={{ background: 'var(--c-green)', color: '#fff', padding: '8px 12px', fontSize: 13, fontWeight: 700 }}>
            📈 大盤指數ETF（009816/0050）
          </div>
          <div style={{ padding: '10px 12px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-suc)', marginBottom: 6 }}>✅ 優點</div>
            {PROS_CONS.etf.pros.map((p, i) => (
              <div key={i} style={{ fontSize: 11, color: 'var(--c-text2)', lineHeight: 1.6, marginBottom: 4, display: 'flex', gap: 6 }}>
                <span style={{ color: 'var(--c-green)', flexShrink: 0 }}>+</span>{p}
              </div>
            ))}
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-red)', margin: '10px 0 6px' }}>❌ 缺點</div>
            {PROS_CONS.etf.cons.map((p, i) => (
              <div key={i} style={{ fontSize: 11, color: 'var(--c-text2)', lineHeight: 1.6, marginBottom: 4, display: 'flex', gap: 6 }}>
                <span style={{ color: 'var(--c-red)', flexShrink: 0 }}>−</span>{p}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Note type="info" mt={0}>
        儲蓄型保險的核心價值不在於報酬率，而在於「確定性」與「心理安全感」。
        對於無法承受帳面虧損、或需要強迫儲蓄機制的人，它是有其合理存在的工具。
        數字上ETF幾乎必然勝出，但投資不只是數字——能長期持有不動搖的工具，才是對的工具。
        如果持有ETF會讓你在市場崩跌時睡不著覺進而賣出，儲蓄險的保本特性對你而言可能價值更高。
      </Note>
    </div>
  )
}

export default function InsTab({ state, set }) {
  const { dr, insPrin, insAnn, insPen } = state
  const r1   = dr + 0.01 - EXP1
  const netP = insPrin * (1 - insPen / 100)

  const { chartData, insCross } = useMemo(() => {
    if (insPrin === 0) return { chartData: [], insCross: null }
    let cross = null
    const data = Array.from({ length: 20 }, (_, i) => {
      const y    = i + 1
      const insT = insPrin + insAnn * y
      const mkt  = netP * Math.pow(1 + r1 / 12, y * 12)
      if (!cross && mkt > insT) cross = y
      return { year: `${y}年`, '儲蓄險總資產': Math.round(insT), '009816': Math.round(mkt) }
    })
    return { chartData: data, insCross: cross }
  }, [insPrin, insAnn, netP, r1])

  return (
    <div>
      <Note type="info" mt={0}>
        009816 報酬率與「定期定額」分頁設定同步（目前：{(dr*100).toFixed(1)}%，費後 {fmtPA(r1)}）。
      </Note>

      <Divider my={14} />
      <SectionTitle>儲蓄險 vs 大盤ETF 優缺點比較</SectionTitle>
      <ProsCons />

      <Divider />
      <SectionTitle>數字試算</SectionTitle>

      <Slider label="保險本金" min={0} max={50000000} step={100000}
        value={insPrin} onChange={v => set('insPrin', v)}
        fmt={v => v === 0 ? '0（未設定）' : fmtM(v)} />

      <Slider label="每年領回金額" min={0} max={2000000} step={10000}
        value={insAnn} onChange={v => set('insAnn', v)}
        fmt={v => v === 0 ? '0（未設定）' : fmtM(v)} />

      <Slider label="解約費用 %" min={0} max={10} step={0.5}
        value={insPen} onChange={v => set('insPen', v)}
        fmt={v => v === 0 ? '0%（已過鎖定期）' : v.toFixed(1) + '%'} />

      {insPrin === 0 ? (
        <Note type="note" mt={12}>請設定保險本金以顯示試算結果。</Note>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, margin: '12px 0' }}>
            <Card label="隱含年化（單利）" value={insAnn > 0 ? fmtPA(insAnn / insPrin) + '/年' : '—'} />
            <Card label="20年累積領回" value={fmtM(insAnn * 20)} />
            <Card label="009816超越年份"
              value={insCross ? `第 ${insCross} 年` : '20年內未超越'}
              accent={insCross ? 'var(--c-green)' : 'var(--c-red)'} />
          </div>

          <InvestChart data={chartData} series={[
            { key: '儲蓄險總資產', label: '儲蓄險總資產', color: '#BA7517', width: 2   },
            { key: '009816',      label: '009816',      color: '#1D9E75', width: 2.5 },
          ]} height={220} />
          <Legend items={[
            { color: '#BA7517', label: '儲蓄險總資產' },
            { color: '#1D9E75', label: '解約轉 009816' },
          ]} />

          <Note mt={8}>
            保險本金 {fmtM(insPrin)}，年領 {fmtM(insAnn)}
            {insAnn > 0 ? `（${fmtPA(insAnn/insPrin)} 單利）` : ''}。
            {insPen > 0 ? `解約費 ${insPen}%，實際轉入 ${fmtM(netP)}。` : '已過鎖定期無費用。'}
            {insCross
              ? ` 009816 在第 ${insCross} 年超越儲蓄險總資產。`
              : ' 009816 在20年內未超越儲蓄險總資產，可嘗試調高報酬率情境。'}
          </Note>
        </>
      )}
    </div>
  )
}
