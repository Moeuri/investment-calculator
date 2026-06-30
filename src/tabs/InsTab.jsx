import { useMemo } from 'react'
import { Card, Note, Slider, SectionTitle, InvestChart, Legend, Divider } from '../components'
import { buildNorm, fmtM, fmtPA, EXP1 } from '../utils'

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
          <div style={{ background: '#BA7517', color: '#fff', padding: '8px 12px', fontSize: 'var(--font-md)', fontWeight: 700 }}>
            🏦 儲蓄型保險
          </div>
          <div style={{ padding: '10px 12px' }}>
            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--c-suc)', marginBottom: 6 }}>✅ 優點</div>
            {PROS_CONS.ins.pros.map((p, i) => (
              <div key={i} style={{ fontSize: 'var(--font-xs)', color: 'var(--c-text2)', lineHeight: 1.6, marginBottom: 4, display: 'flex', gap: 6 }}>
                <span style={{ color: 'var(--c-green)', flexShrink: 0 }}>+</span>{p}
              </div>
            ))}
            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--c-red)', margin: '10px 0 6px' }}>❌ 缺點</div>
            {PROS_CONS.ins.cons.map((p, i) => (
              <div key={i} style={{ fontSize: 'var(--font-xs)', color: 'var(--c-text2)', lineHeight: 1.6, marginBottom: 4, display: 'flex', gap: 6 }}>
                <span style={{ color: 'var(--c-red)', flexShrink: 0 }}>−</span>{p}
              </div>
            ))}
          </div>
        </div>
        {/* 大盤ETF */}
        <div style={{ borderRadius: 'var(--radius)', border: '0.5px solid var(--c-border)', overflow: 'hidden' }}>
          <div style={{ background: 'var(--c-green)', color: '#fff', padding: '8px 12px', fontSize: 'var(--font-md)', fontWeight: 700 }}>
            📈 大盤指數ETF（009816/0050）
          </div>
          <div style={{ padding: '10px 12px' }}>
            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--c-suc)', marginBottom: 6 }}>✅ 優點</div>
            {PROS_CONS.etf.pros.map((p, i) => (
              <div key={i} style={{ fontSize: 'var(--font-xs)', color: 'var(--c-text2)', lineHeight: 1.6, marginBottom: 4, display: 'flex', gap: 6 }}>
                <span style={{ color: 'var(--c-green)', flexShrink: 0 }}>+</span>{p}
              </div>
            ))}
            <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--c-red)', margin: '10px 0 6px' }}>❌ 缺點</div>
            {PROS_CONS.etf.cons.map((p, i) => (
              <div key={i} style={{ fontSize: 'var(--font-xs)', color: 'var(--c-text2)', lineHeight: 1.6, marginBottom: 4, display: 'flex', gap: 6 }}>
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
  const { dr, per, insPrin, insAnn, insPen } = state
  const r1   = dr + 0.01 - EXP1
  const netP = insPrin * (1 - insPen / 100)
  const dcaYrs = per / 12  // 解約後分幾年投入（沿用「定期定額」分頁的期數）

  const { chartData, lumpCross, dcaCross } = useMemo(() => {
    if (insPrin === 0) return { chartData: [], lumpCross: null, dcaCross: null }
    const months = 240
    // ③解約後定期定額：一次性解約拿回 netP 現金，分 per 期投入大盤；
    //   已投入部分用 buildNorm 複利，未投入部分為閒置現金（不生息）。
    const move   = per > 0 ? netP / per : netP
    const etfDCA = buildNorm(0, move, per, r1, months)

    let lumpCross = null, dcaCross = null
    const data = Array.from({ length: 20 }, (_, i) => {
      const y   = i + 1, mo = y * 12
      const insT = insPrin + insAnn * y                         // ①維持儲蓄險
      const lump = netP * Math.pow(1 + r1 / 12, mo)             // ②解約後一次性
      const idle = Math.max(0, netP - move * Math.min(mo, per)) // ③未投入的閒置現金
      const dca  = etfDCA[mo] + idle                            // ③解約後定期定額
      if (!lumpCross && lump > insT) lumpCross = y
      if (!dcaCross  && dca  > insT) dcaCross  = y
      return {
        year: `${y}年`,
        '儲蓄險總資產':     Math.round(insT),
        '定期定額轉009816': Math.round(dca),
        '一次性轉009816':   Math.round(lump),
      }
    })
    return { chartData: data, lumpCross, dcaCross }
  }, [insPrin, insAnn, netP, r1, per])

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
          <Note type="info" mt={12}>
            三條路徑比較同一筆 {fmtM(insPrin)}：
            <strong>①維持儲蓄險</strong>（不解約，每年領 {fmtM(insAnn)}）、
            <strong>②解約後一次性</strong>（馬上全額進場，報酬最快但須承受梭哈波動）、
            <strong>③解約後定期定額</strong>（一次解約拿回現金，分 {dcaYrs % 1 === 0 ? dcaYrs : dcaYrs.toFixed(1)} 年慢慢投入，未投入部分為閒置現金不生息）。
            投入年數沿用「定期定額」分頁的期數（{per} 期）。
          </Note>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, margin: '12px 0' }}>
            <Card label="儲蓄險隱含年化（單利）" value={insAnn > 0 ? fmtPA(insAnn / insPrin) + '/年' : '—'} />
            <Card label="③定期定額 超越儲蓄險"
              value={dcaCross ? `第 ${dcaCross} 年` : '20年內未超越'}
              sub="保守者最關心的交叉點"
              accent={dcaCross ? 'var(--c-green)' : 'var(--c-red)'} />
            <Card label="②一次性 超越儲蓄險"
              value={lumpCross ? `第 ${lumpCross} 年` : '20年內未超越'}
              accent={lumpCross ? 'var(--c-green)' : 'var(--c-red)'} />
          </div>

          <InvestChart data={chartData} series={[
            { key: '儲蓄險總資產',     label: '①維持儲蓄險',     color: '#BA7517', width: 2   },
            { key: '定期定額轉009816', label: '③解約後定期定額', color: '#378ADD', width: 2   },
            { key: '一次性轉009816',   label: '②解約後一次性',   color: '#1D9E75', width: 2.5 },
          ]} height={240}
            refLines={dcaCross ? [{ x: `${dcaCross}年`, label: '定期定額交叉', color: 'var(--c-green)' }] : []} />
          <Legend items={[
            { color: '#BA7517', label: '①維持儲蓄險' },
            { color: '#378ADD', label: '③解約後定期定額' },
            { color: '#1D9E75', label: '②解約後一次性' },
          ]} />

          <Note mt={8}>
            保險本金 {fmtM(insPrin)}，年領 {fmtM(insAnn)}
            {insAnn > 0 ? `（${fmtPA(insAnn/insPrin)} 單利）` : ''}。
            {insPen > 0 ? `解約費 ${insPen}%，實際解約金 ${fmtM(netP)}。` : '已過鎖定期、無解約費用。'}
            {dcaCross
              ? ` 解約後分 ${dcaYrs % 1 === 0 ? dcaYrs : dcaYrs.toFixed(1)} 年定期定額投入，在第 ${dcaCross} 年總資產超越維持儲蓄險`
              : ' 解約後定期定額在20年內未超越維持儲蓄險（可調高報酬率或縮短投入年數）'}
            {dcaCross && dcaCross > dcaYrs ? `（交叉點晚於投入完成的第 ${Math.ceil(dcaYrs)} 年）。` : dcaCross ? '（投入尚未完成就已反超）。' : '。'}
            {lumpCross
              ? ` 一次性投入則在第 ${lumpCross} 年超越，但須一開始就承受全額市場波動。`
              : ' 一次性投入在20年內亦未超越維持儲蓄險。'}
            {' '}投入完成前未進場的資金為閒置現金、不生息，這是定期定額初期淨值成長較慢的原因。
          </Note>
        </>
      )}
    </div>
  )
}
