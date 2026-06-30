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
  const { dr, per, amt, lumpSum, insPrin, insAnn, insPen } = state
  const r1   = dr + 0.01 - EXP1
  const ls   = lumpSum || 0
  const netP = insPrin * (1 - insPen / 100)   // 解約實拿
  const marketInvested = ls + amt * per        // 你選擇投入大盤的金額（依「定期定額」分頁）
  const otherFunds = netP - marketInvested     // 解約金中未投入大盤、另作他用的部分
  const pct = netP > 0 ? Math.round(marketInvested / netP * 100) : 0
  const partial = marketInvested < netP

  const { chartData, mktCross } = useMemo(() => {
    if (insPrin === 0 || marketInvested === 0) return { chartData: [], mktCross: null }
    const months = 240
    // 大盤線＝「定期定額」分頁的 009816 計畫（一次性 ls ＋ 每月 amt×per）
    const mkt = buildNorm(ls, amt, per, r1, months)
    let mktCross = null
    const data = Array.from({ length: 20 }, (_, i) => {
      const y = i + 1, mo = y * 12
      const insT = insPrin + insAnn * y
      const mv   = mkt[mo]
      if (!mktCross && mv > insT) mktCross = y
      return {
        year: `${y}年`,
        '維持儲蓄險':     Math.round(insT),
        '投入大盤009816': Math.round(mv),
      }
    })
    return { chartData: data, mktCross }
  }, [insPrin, insAnn, ls, amt, per, r1, marketInvested])

  // 投入方式描述
  const planDesc = ls > 0 && amt > 0
    ? `一次性 ${fmtM(ls)} ＋ 每月 ${fmtM(amt)}×${per}期`
    : ls > 0 ? `一次性 ${fmtM(ls)}` : `每月 ${fmtM(amt)}×${per}期`

  return (
    <div>
      <Note type="info" mt={0}>
        報酬率與投入金額（一次性／每月定期定額／期數）皆與「定期定額」分頁同步（目前 009816 費後年化 {fmtPA(r1)}）。
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
      ) : marketInvested === 0 ? (
        <Note type="warn" mt={12}>
          請到「📈 定期定額」分頁設定投入大盤的金額（一次性投入或每月定期定額×期數），才能與儲蓄險比較。
        </Note>
      ) : (
        <>
          <Note type="info" mt={12}>
            比較兩條路徑：<strong>維持儲蓄險</strong>（不解約，每年領 {fmtM(insAnn)}）
            vs <strong>投入大盤</strong>（解約後把 {fmtM(marketInvested)} 投進 009816，方式：{planDesc}，於「定期定額」分頁設定）。
            <br />大盤線<strong>只是你投入大盤的那一部分</strong>，其餘資金（買個股／其他ETF／其他保單／花用）不在此比較——因此這是「資本效率」比較，不是等額比較。
          </Note>

          <div className="grid3" style={{ gap: 8, margin: '12px 0' }}>
            <Card label="儲蓄險隱含年化（單利）" value={insAnn > 0 ? fmtPA(insAnn / insPrin) + '/年' : '—'} />
            <Card label="投入大盤 超越儲蓄險"
              value={mktCross ? `第 ${mktCross} 年` : '20年內未超越'}
              sub={mktCross ? (partial ? `只動用解約金的 ${pct}%` : '靠複利追過龜速儲蓄險') : '可加大投入或拉長時間'}
              accent={mktCross ? 'var(--c-green)' : 'var(--c-red)'} />
            <Card label="投入大盤金額"
              value={fmtM(marketInvested)}
              sub={otherFunds > 0 ? `解約金 ${fmtM(netP)}，其餘 ${fmtM(otherFunds)} 另用` : `解約金 ${fmtM(netP)}`}
              accent="#378ADD" />
          </div>

          <InvestChart data={chartData} series={[
            { key: '維持儲蓄險',     label: '維持儲蓄險',      color: '#BA7517', width: 2   },
            { key: '投入大盤009816', label: '投入大盤 009816', color: '#1D9E75', width: 2.5 },
          ]} height={240}
            refLines={mktCross ? [{ x: `${mktCross}年`, label: '超越儲蓄險', color: 'var(--c-green)' }] : []} />
          <Legend items={[
            { color: '#BA7517', label: '維持儲蓄險（整筆）' },
            { color: '#1D9E75', label: '投入大盤 009816（僅投入部分）' },
          ]} />

          <Note mt={8}>
            保險本金 {fmtM(insPrin)}，年領 {fmtM(insAnn)}{insAnn > 0 ? `（${fmtPA(insAnn/insPrin)} 單利）` : ''}。
            {insPen > 0 ? `解約費 ${insPen}%，實際解約金 ${fmtM(netP)}。` : '已過鎖定期、無解約費用。'}
            {' '}你選擇把 {fmtM(marketInvested)}（{planDesc}）投入大盤。
            {mktCross
              ? ` 第 ${mktCross} 年，投入大盤的這部分就超越「維持儲蓄險整筆」${partial ? `——即使只動用解約金的 ${pct}%，9% 複利仍追過 2% 龜速儲蓄險` : ''}。`
              : ' 20年內未超越維持儲蓄險（可在定期定額分頁調高每月投入、報酬率，或縮短期數）。'}
            {otherFunds > 0 ? ` 其餘 ${fmtM(otherFunds)} 你可自由運用（買股／其他ETF／其他保單／花用），不影響此比較。` : ''}
          </Note>
        </>
      )}
    </div>
  )
}
