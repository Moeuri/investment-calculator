import { Divider, Note, MiniBar } from '../components'
import { COMPARE_DATE } from '../utils'

const SECTION = ({ title, children }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{
      fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--c-text)',
      borderLeft: '3px solid var(--c-green)', paddingLeft: 10, marginBottom: 10,
    }}>{title}</div>
    {children}
  </div>
)

const Row = ({ label, v0050, v9816, highlight }) => (
  <div className="cmp-row" style={{
    gap: 8, marginBottom: 7,
    background: highlight ? 'var(--c-bg2)' : 'transparent',
    borderRadius: 6, padding: highlight ? '8px 10px' : '2px 0',
  }}>
    <div style={{ fontSize: 'var(--font-sm)', color: 'var(--c-text3)', display: 'flex', alignItems: 'center' }}>{label}</div>
    <div style={{
      fontSize: 'var(--font-sm)', color: 'var(--c-text)', background: 'var(--c-blue-bg)',
      borderRadius: 6, padding: '7px 10px', lineHeight: 1.5,
    }}>{v0050}</div>
    <div style={{
      fontSize: 'var(--font-sm)', color: 'var(--c-text)', background: 'var(--c-green-bg)',
      borderRadius: 6, padding: '7px 10px', lineHeight: 1.5,
    }}>{v9816}</div>
  </div>
)

export default function CompareTab() {
  return (
    <div>
      {/* 標題 */}
      <div style={{
        background: 'linear-gradient(135deg, var(--c-blue-bg) 0%, var(--c-green-bg) 100%)',
        borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: 16,
      }}>
        <div style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--c-text)', marginBottom: 4 }}>
          0050 vs 009816 完整比較
        </div>
        <div style={{ fontSize: 'var(--font-sm)', color: 'var(--c-text2)', lineHeight: 1.6 }}>
          兩檔都追蹤台灣市值前50大企業，成分股重疊度高達90%以上，
          但選股邏輯、持股限制、配息機制與費用結構的差異，
          長期下來會讓報酬走出不同的路。資料更新至{COMPARE_DATE}。
        </div>
      </div>

      {/* 關鍵差異視覺化 */}
      <div className="grid2" style={{ gap: 12, marginBottom: 16 }}>
        <div style={{ background: 'var(--c-bg2)', borderRadius: 'var(--radius)', padding: '10px 12px' }}>
          <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--c-text)', marginBottom: 4 }}>台積電持股佔比</div>
          <MiniBar height={160} unit="%" data={[
            { name: '0050', value: 63, color: 'var(--c-blue)' },
            { name: '009816', value: 43, color: 'var(--c-green)' },
          ]} />
        </div>
        <div style={{ background: 'var(--c-bg2)', borderRadius: 'var(--radius)', padding: '10px 12px' }}>
          <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--c-text)', marginBottom: 4 }}>總費用率（估算）</div>
          <MiniBar height={160} unit="%" data={[
            { name: '0050', value: 0.43, color: 'var(--c-blue)' },
            { name: '009816', value: 0.097, color: 'var(--c-green)' },
          ]} />
        </div>
      </div>

      {/* 表頭 */}
      <div className="cmp-head" style={{ gap: 8, marginBottom: 10 }}>
        <div />
        <div style={{
          background: 'var(--c-blue)', color: '#fff',
          borderRadius: 6, padding: '8px 10px', textAlign: 'center',
          fontSize: 'var(--font-md)', fontWeight: 700,
        }}>0050<br /><span style={{ fontSize: 'var(--font-2xs)', fontWeight: 400 }}>元大台灣50</span></div>
        <div style={{
          background: 'var(--c-green)', color: '#fff',
          borderRadius: 6, padding: '8px 10px', textAlign: 'center',
          fontSize: 'var(--font-md)', fontWeight: 700,
        }}>009816<br /><span style={{ fontSize: 'var(--font-2xs)', fontWeight: 400 }}>凱基台灣TOP50</span></div>
      </div>

      <SECTION title="基本資料">
        <Row label="上市時間" v0050="2003年（超過22年歷史）" v9816="2026年2月（不到1年）" />
        <Row label="發行投信" v0050="元大投信" v9816="凱基投信" />
        <Row label="追蹤指數" v0050="臺灣50指數（純市值）" v9816="特選台灣TOP50指數（市值＋動能）" />
        <Row label="規模（2026/6）" v0050="約 6,381 億元" v9816="約 540 億元（快速成長中）" highlight />
        <Row label="受益人數" v0050="超過 100 萬人" v9816="約 70.8 萬人（成長最快）" />
      </SECTION>

      <Divider />
      <SECTION title="選股邏輯與持股結構">
        <Row label="選股方式" v0050="純市值加權，完全跟著市場走，不主動判斷" v9816="市值加權＋動能加碼，有「策略型」成分" highlight />
        <Row label="台積電佔比" v0050="約 63–64%，無單一持股上限，台積電有多強就給多少權重" v9816="約 40–43%，強制設定30%單一持股上限，多出的20%分給動能強的股票" highlight />
        <Row label="動能機制" v0050="無。完全被動，市場怎麼分配就怎麼買" v9816="超過上限的剩餘權重，優先分配給近期動能前20%的成分股（如聯發科、台達電等）" />
        <Row label="獲利門檻" v0050="無。只要進台灣前50大市值就納入" v9816="需近四季稅後純益＞0，虧損公司會被剔除（實際影響約2–4%權重）" />
        <Row label="成分股重疊度" v0050="兩者共同持有44檔，重疊度超過90%" v9816="差異主要在台積電佔比與其他強勢股的比重" highlight />
        <Row label="換股頻率" v0050="每季調整一次，平均增減3–5檔，相對穩定" v9816="換股幅度較大（動能策略天生），可能產生較高的交易成本與追蹤誤差" />
      </SECTION>

      <Divider />
      <SECTION title="配息機制（最關鍵差異）">
        <Row label="配息方式" v0050="半年配（每年1月、7月），現金直接匯到帳戶" v9816="完全不配息。成分股股利直接滾入淨值，自動複利" highlight />
        <Row label="稅務影響" v0050="配息需申報個人所得稅（54C所得）。持有逾475萬（約62.5張）才需另扣健保補充費2.11%" v9816="完全無配息稅負，也無健保補充費。高資產族群省稅效果顯著" highlight />
        <Row label="再投入問題" v0050="領到配息需自行決定再投入時機與金額，有延遲摩擦成本，紀律不佳者實際年化報酬可能低0.3–0.8%" v9816="股利自動留在淨值內，無再投入決策，複利全自動，無摩擦" />
        <Row label="現金流" v0050="每半年有現金入帳，適合需要被動收入支付生活費的人" v9816="無任何配息，急需用錢只能賣股，空頭市場可能被迫低點出場" />
        <Row label="除息填息" v0050="除息後股價下調，存在填息壓力。近年填息速度尚可" v9816="無除息，股價不會因配息而調整，走勢更純粹" />
      </SECTION>

      <Divider />
      <SECTION title="費用率比較">
        <Row label="經理費（2026年）" v0050="約 0.077%（2025年大幅降費後，直追新進者）" v9816="固定 0.07%，目前三者中最低" highlight />
        <Row label="保管費" v0050="約 0.035%" v9816="約 0.027%" />
        <Row label="總費用率估算" v0050="約 0.43%（含交易成本）" v9816="約 0.097%（含交易成本，但動能換股成本有待觀察）" highlight />
        <Row label="費用差距影響" v0050="費用差距約 0.33%/年，100萬投入30年，費用差距可累積超過10萬元以上" v9816="費用率優勢明確，但009816動能換股的隱形交易成本尚待長期驗證" />
      </SECTION>

      <Divider />
      <SECTION title="風險分析">
        <Row label="集中度風險" v0050="高度集中台積電（63%），台積電漲跌幾乎決定0050的命運。半導體逆風時首當其衝" v9816="台積電被壓制在43%，分散程度相對較高，單一公司衝擊較小" highlight />
        <Row label="策略風險" v0050="幾乎無策略風險，純粹市場反映，可預測性高" v9816="動能策略在多頭有效，但盤整或熊市時可能因頻繁換股而增加成本，表現未必優於被動" />
        <Row label="歷史驗證" v0050="22年完整歷史，歷經多次大熊市（2008、2015、2022），有充分歷史數據" v9816="上市不到1年，動能策略在不同市場環境下的長期表現仍有待驗證" highlight />
        <Row label="無現金流風險" v0050="有配息，遇到空頭至少有定期現金收入作為心理防線" v9816="無配息，長期空頭市場若急需用錢只能賣股，心理壓力較大" />
        <Row label="流動性" v0050="流動性最佳，日均成交量龐大，買賣價差極小" v9816="流動性快速成長，但仍不及0050，大額交易時需注意" />
      </SECTION>

      <Divider />
      <SECTION title="配息再投入 vs 不配息：年化報酬差異">
        <Note type="info" mt={0}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>情境試算（假設大盤年化10%，投入100萬，持有20年）</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--c-blue)', marginBottom: 4 }}>0050（有配息）</div>
              <div style={{ fontSize: 'var(--font-sm)', lineHeight: 1.7 }}>
                ✅ 完美再投入（稅率0%）：20年後約 <b>672萬</b><br />
                ⚠️ 稅率20%＋延遲再投入：20年後約 <b>580萬</b>（實際年化約8.5%）<br />
                ❌ 稅率40%＋不再投入：20年後本金＋配息約 <b>490萬</b>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--c-green)', marginBottom: 4 }}>009816（不配息）</div>
              <div style={{ fontSize: 'var(--font-sm)', lineHeight: 1.7 }}>
                ✅ 費後年化約11%（省稅＋自動複利）：20年後約 <b>806萬</b><br />
                📊 差距來源：無稅摩擦（+0.5%）＋費用率低（+0.33%）＋自動再投入（+0.3–0.5%）<br />
                ⚠️ 動能換股隱形成本尚未完整驗證
              </div>
            </div>
          </div>
        </Note>
      </SECTION>

      <Divider />
      <SECTION title="配息可以領出來用的情況分析">
        <Note type="note" mt={0}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>如果你需要定期現金流，0050配息是否真的划算？</div>
          <div style={{ fontSize: 'var(--font-sm)', lineHeight: 1.8 }}>
            <div>📌 <b>持有100萬0050，年化配息約2–3%，每年領回2–3萬元</b></div>
            <div>扣除配息稅（0%~40%視稅率）和可能的健保補充費後，實際入袋金額約1.2–3萬元</div>
            <div style={{ marginTop: 6 }}>📌 <b>009816替代方案：每年賣出相同金額的單位數</b></div>
            <div>因為資產基數較大（不配息累積更快），賣出同等金額後剩餘資產反而更多。</div>
            <div>且賣出僅就<b>資本利得</b>部分課稅（台灣股票交易目前資本利得免稅），實際稅負通常低於配息所得稅。</div>
            <div style={{ marginTop: 6 }}>📌 <b>結論：如果你不在乎每半年有現金入帳的心理感受，009816「自行賣股領現」在大多數情境下的稅後實際所得不低於0050配息，且資產累積速度更快。</b></div>
          </div>
        </Note>
      </SECTION>

      <Divider />
      <SECTION title="誰適合哪一檔？">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ background: 'var(--c-blue-bg)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
            <div style={{ fontSize: 'var(--font-md)', fontWeight: 700, color: 'var(--c-blue)', marginBottom: 8 }}>選 0050 如果你...</div>
            <div style={{ fontSize: 'var(--font-sm)', color: 'var(--c-text)', lineHeight: 1.8 }}>
              ✅ 需要每半年有現金配息支付生活費<br />
              ✅ 重視22年歷史驗證與高流動性<br />
              ✅ 看好台積電持續引領台股<br />
              ✅ 持有市值低於475萬（無健保補充費問題）<br />
              ✅ 喜歡完全被動、不帶任何策略判斷的純指數投資
            </div>
          </div>
          <div style={{ background: 'var(--c-green-bg)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
            <div style={{ fontSize: 'var(--font-md)', fontWeight: 700, color: 'var(--c-green)', marginBottom: 8 }}>選 009816 如果你...</div>
            <div style={{ fontSize: 'var(--font-sm)', color: 'var(--c-text)', lineHeight: 1.8 }}>
              ✅ 不需要定期配息，專注長期資產累積<br />
              ✅ 想省下配息稅與健保補充費<br />
              ✅ 希望複利全自動，不需手動再投入<br />
              ✅ 不想過度集中台積電單一公司<br />
              ✅ 接受動能策略帶來的潛在超額報酬（也接受其不確定性）
            </div>
          </div>
        </div>
      </SECTION>

      <Note type="warn" mt={8}>
        ⚠️ 009816上市不到1年，動能策略在熊市或盤整市場的表現仍有待時間驗證。
        所有比較數據以{COMPARE_DATE}為基準，費用率與持股結構會隨時更新，請定期複查各投信官網。
        本頁資訊僅供參考，不構成投資建議。
      </Note>
    </div>
  )
}
