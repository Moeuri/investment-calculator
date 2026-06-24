import { Divider, Note } from '../components'

const VERSIONS = [
  {
    ver: 'v1.5',
    date: '2026',
    changes: [
      '新增「0050 vs 009816」比較分頁：選股邏輯、持股限制、配息機制、費用率、風險分析、配息再投入年化差異、誰適合哪一檔',
      '分頁順序調整：保險vs股市移至高股息ETF之後',
      '同步修正 v1.4 的 BUG（一次性投入數據未統一傳遞至各分頁）',
    ],
  },
  {
    ver: 'v1.4',
    date: '2026',
    changes: [
      '定期定額：新增一次性投入功能，支援純一次性、一次性＋定期定額、純定期定額三種模式',
      '退休提領：新增退休時間設定、衝突偵測、退休本金反推（年金現值公式，含通膨調整）',
      '關於分頁：新增版本紀錄、版權宣告、免責聲明',
    ],
  },
  {
    ver: 'v1.3',
    date: '2026',
    changes: [
      '定期定額：年化報酬率改為六檔，每檔附歷史錨點說明（日本失落30年、台股橫盤期、S&P500百年均值等）',
      '新增「賭性狂徒 18%」情境（2020疫情低點後AI行情）',
    ],
  },
  {
    ver: 'v1.2',
    date: '2026',
    changes: [
      '保險vs股市：改為分頁獨立狀態，本金範圍拉大至30萬–5000萬',
      '崩盤模擬：新增第三次崩盤，每次崩盤可勾選啟用/停用，加入歷史恢復模型說明',
      '高股息ETF：推薦配置標籤改為語意化描述，新增月曆式配息時間軸',
      '所有滑桿數值改為可點擊直接輸入',
    ],
  },
  {
    ver: 'v1.1',
    date: '2026',
    changes: [
      '初始完整版發布，支援六大功能分頁',
      '定期定額、保險vs股市、崩盤模擬、通膨購買力、退休提領、高股息ETF',
      '部署至 Vercel，支援跨平台瀏覽器使用',
    ],
  },
]

export default function AboutTab() {
  return (
    <div>
      <div style={{
        background: 'var(--c-green-bg)', borderRadius: 'var(--radius)',
        padding: '16px 18px', marginBottom: 16,
        borderLeft: '4px solid var(--c-green)',
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--c-green)', marginBottom: 4 }}>大盤投資計算器</div>
        <div style={{ fontSize: 13, color: 'var(--c-text2)', lineHeight: 1.7 }}>
          <div>製作人：Huang Yen-han</div>
          <div>目前版本：v1.5</div>
          <div>適用標的：009816 / 0050 / 0056 / 00878 / 00919</div>
          <div>設計用途：個人及友人大盤投資輔助試算</div>
        </div>
      </div>

      <div style={{ background: 'var(--c-bg2)', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)', marginBottom: 8 }}>版權宣告</div>
        <div style={{ fontSize: 12, color: 'var(--c-text2)', lineHeight: 1.8 }}>
          <div>© 2026 Huang Yen-han. All rights reserved.</div>
          <div>本計算器之程式碼、介面設計及內容均受著作權保護。</div>
          <div>未經授權，禁止以任何形式複製、改作、散布或商業使用。</div>
          <div style={{ marginTop: 6, color: 'var(--c-text3)' }}>個人非商業使用及學習參考不在此限。</div>
        </div>
      </div>

      <Note type="warn" mt={0}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>⚠️ 免責聲明</div>
        本計算器僅供個人財務規劃參考，不構成任何投資建議或要約。
        所有報酬率均基於歷史數據估算，過去績效不代表未來結果。
        高股息ETF殖利率採歷史均值，實際配息依各投信公告為準。
        投資人應自行評估風險承受能力，並在必要時諮詢專業財務顧問。
        製作人不對使用本工具所做之投資決策承擔任何責任。
      </Note>

      <Divider my={20} />

      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)', marginBottom: 12 }}>版本更新紀錄</div>
      {VERSIONS.map((v, i) => (
        <div key={v.ver} style={{ marginBottom: 14, paddingLeft: 14, borderLeft: `2px solid ${i === 0 ? 'var(--c-green)' : 'var(--c-border)'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? 'var(--c-green)' : 'var(--c-text)' }}>{v.ver}</span>
            <span style={{ fontSize: 11, color: 'var(--c-text3)' }}>{v.date}</span>
            {i === 0 && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'var(--c-green-bg)', color: 'var(--c-green)', fontWeight: 600 }}>最新</span>}
          </div>
          <ul style={{ paddingLeft: 16, margin: 0 }}>
            {v.changes.map((c, j) => (
              <li key={j} style={{ fontSize: 12, color: 'var(--c-text2)', lineHeight: 1.7, marginBottom: 2 }}>{c}</li>
            ))}
          </ul>
        </div>
      ))}

      <Divider my={16} />

      <div style={{ fontSize: 12, color: 'var(--c-text3)', lineHeight: 1.8 }}>
        <div style={{ fontWeight: 600, color: 'var(--c-text2)', marginBottom: 4 }}>技術說明</div>
        <div>前端框架：React 18 + Vite</div>
        <div>圖表套件：Recharts</div>
        <div>部署平台：Vercel</div>
        <div>純前端計算，無後端伺服器，所有數據不上傳儲存</div>
        <div>支援 Dark Mode 及響應式設計（手機、平板、桌面）</div>
      </div>
    </div>
  )
}
