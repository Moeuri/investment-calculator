import { Divider, Note } from '../components'

const VERSIONS = [
  {
    ver: 'v1.8.2',
    date: '2026-06-28',
    changes: [
      'Bug fix：退休提領分頁計算錯誤修正——退休年份設定超過20年時，現在能正確計算退休資產（舊版因陣列長度限制固定輸出第20年數值）',
      'Bug fix：高股息ETF分頁——每月投入為0時「達標尚需追加月數」顯示 Infinity 問題修正；三檔比例全為0時除以零問題修正',
      '新功能：高股息ETF分頁新增「稅後配息試算」區塊——可選配息所得稅率，顯示稅前月均、二代健保補充費（2.11%）及稅後月均淨領',
      '新功能：崩盤模擬摘要卡片新增損失金額顯示（崩盤當下損失幾元、幾%）',
      '新功能：Header 新增「重設」按鈕（一鍵回到預設值）與「分享」按鈕（將當前所有設定編碼至URL，可複製連結分享特定情境）',
    ],
  },
  {
    ver: 'v1.8.1',
    date: '2026',
    changes: [
      'UI：Header 新增三檔字體大小切換（小／中／大），套用至全頁面所有文字',
      'README：補上 v1.8.0 更新記錄（前版漏記）',
      '確認 InsTab 009816 報酬率已與定期定額分頁全域同步（無需額外修改）',
    ],
  },
  {
    ver: 'v1.8.0',
    date: '2026',
    changes: [
      '崩盤模擬：重大演算法重構（修正根本性邏輯錯誤）——採混合批次追蹤法：崩盤前累積資產合為「持有池」承受跌幅，崩盤後每月新投入獨立按正常年化複利追蹤，確保崩後投入本金不被衰減侵蝕',
      '崩盤模擬：正確處理多次崩盤情境（定期定額6-8年遇到3次崩盤、一次性+定期定額混合、崩盤在持有期等邊界情況）',
      '崩盤模擬：正常複利基準線說明加入「以009816完美運行狀態估算」及可展開的原因說明',
      '崩盤模擬：頂部警告加入009816基準說明；底部說明新增「定期定額批次追蹤」邏輯解說',
    ],
  },
  {
    ver: 'v1.7',
    date: '2026',
    changes: [
      '崩盤模擬：全面重構演算法，改為「流動性危機型」與「結構重置型」兩種崩盤性質按鈕，取代舊的V/U型態',
      '崩盤模擬：新增加權融合模型（流動性危機=0.3A+0.7B，結構重置=0.7A+0.3B），修正99%崩跌後離譜快速恢復的BUG',
      '崩盤模擬：最後一次崩盤後自動展開±1σ統計扇形區間（對數常態，約68%機率範圍）',
      '崩盤模擬：新增頂部顯著警告（定位為心理承受力測試，非走勢預測）與底部計算邏輯說明',
      'v1.7起崩盤模型的小幅調整將以1.7.x版本號追蹤',
    ],
  },
  {
    ver: 'v1.6',
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
        <div style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--c-green)', marginBottom: 4 }}>大盤投資計算器</div>
        <div style={{ fontSize: 'var(--font-md)', color: 'var(--c-text2)', lineHeight: 1.7 }}>
          <div>製作人：Huang Yen-han</div>
          <div>目前版本：v1.8.2</div>
          <div>適用標的：009816 / 0050 / 0056 / 00878 / 00919</div>
          <div>設計用途：個人及友人大盤投資輔助試算</div>
        </div>
      </div>

      <div style={{ background: 'var(--c-bg2)', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--c-text)', marginBottom: 8 }}>版權宣告</div>
        <div style={{ fontSize: 'var(--font-sm)', color: 'var(--c-text2)', lineHeight: 1.8 }}>
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

      <div style={{ fontSize: 'var(--font-base)', fontWeight: 600, color: 'var(--c-text)', marginBottom: 12 }}>版本更新紀錄</div>
      {VERSIONS.map((v, i) => (
        <div key={v.ver} style={{ marginBottom: 14, paddingLeft: 14, borderLeft: `2px solid ${i === 0 ? 'var(--c-green)' : 'var(--c-border)'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 'var(--font-md)', fontWeight: 700, color: i === 0 ? 'var(--c-green)' : 'var(--c-text)' }}>{v.ver}</span>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--c-text3)' }}>{v.date}</span>
            {i === 0 && <span style={{ fontSize: 'var(--font-2xs)', padding: '1px 6px', borderRadius: 4, background: 'var(--c-green-bg)', color: 'var(--c-green)', fontWeight: 600 }}>最新</span>}
          </div>
          <ul style={{ paddingLeft: 16, margin: 0 }}>
            {v.changes.map((c, j) => (
              <li key={j} style={{ fontSize: 'var(--font-sm)', color: 'var(--c-text2)', lineHeight: 1.7, marginBottom: 2 }}>{c}</li>
            ))}
          </ul>
        </div>
      ))}

      <Divider my={16} />

      <div style={{ fontSize: 'var(--font-sm)', color: 'var(--c-text3)', lineHeight: 1.8 }}>
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
