// ─────────────────────────────────────────────────────────────────
// 成果卡：用原生 canvas 自繪一張「超濃縮」摘要圖，輸出 PNG 下載。
// 不依賴任何套件、不截圖。匯出採固定淺色主題，確保分享一致。
//
// 數值格式：名目（實質）；「（）內為通膨折現後的今日購買力」標於頁尾。
// 迷你圖兩條線：009816 實質淨額 vs「放床底下」(投入金額不投資、被通膨吃掉的實質值)。
// ─────────────────────────────────────────────────────────────────
import { fmtM } from './utils'

const FONT = `-apple-system, "PingFang TC", "Microsoft JhengHei", "Noto Sans TC", sans-serif`

export function downloadResultCard(d) {
  const {
    amt, ls, per, dr, years, infl,
    nom9816, real9816, nom0050, real0050, cost, realCost, s9816, sMatt,
  } = d

  const scale = 2
  const W = 760, H = 600
  const canvas = document.createElement('canvas')
  canvas.width = W * scale
  canvas.height = H * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)
  ctx.textBaseline = 'alphabetic'

  // 底 + 外框
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = '#e3e3e3'
  ctx.lineWidth = 1
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1)
  // 頂部色條
  ctx.fillStyle = '#1D9E75'
  ctx.fillRect(0, 0, W, 5)

  const P = 36

  // 標題
  ctx.fillStyle = '#1a1a1a'
  ctx.font = `700 25px ${FONT}`
  ctx.fillText('大盤投資計算器 · 定期定額情境摘要', P, 52)

  // 參數列
  ctx.fillStyle = '#666666'
  ctx.font = `15px ${FONT}`
  const paramStr =
    `每月 ${amt ? fmtM(amt) : '—'}` +
    `${ls ? ` · 一次性 ${fmtM(ls)}` : ''}` +
    ` · ${per}期 · 年化 ${(dr * 100).toFixed(1)}% · 觀察 ${years}年`
  ctx.fillText(paramStr, P, 80)

  // 分隔線
  const hr = y => { ctx.strokeStyle = '#eeeeee'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(P, y); ctx.lineTo(W - P, y); ctx.stroke() }
  hr(98)

  // 表頭
  ctx.fillStyle = '#999999'
  ctx.font = `13px ${FONT}`
  ctx.textAlign = 'right'
  ctx.fillText('名目（實質購買力）', W - P, 122)
  ctx.textAlign = 'left'

  // 三列數值
  const rows = [
    ['009816 終值', nom9816, real9816, '#1D9E75'],
    ['0050 總回報', nom0050, real0050, '#378ADD'],
    ['總投入',      cost,    realCost, '#888888'],
  ]
  let ty = 154
  for (const [lab, nom, real, col] of rows) {
    ctx.fillStyle = '#555555'
    ctx.font = `16px ${FONT}`
    ctx.textAlign = 'left'
    ctx.fillText(lab, P, ty)
    ctx.fillStyle = col
    ctx.font = `700 18px ${FONT}`
    ctx.textAlign = 'right'
    ctx.fillText(real != null ? `${fmtM(nom)}（${fmtM(real)}）` : fmtM(nom), W - P, ty)
    ty += 34
  }
  ty += 2
  hr(ty)

  // ── 迷你對照圖 ──
  ctx.textAlign = 'left'
  ctx.fillStyle = '#1a1a1a'
  ctx.font = `700 15px ${FONT}`
  ctx.fillText('實質淨額：投資 009816  vs  放床底下（被通膨吃掉）', P, ty + 24)

  // 圖例：標題下方獨立一行，避免與標題文字重疊
  const legY = ty + 48
  const legend = (x, color, label) => {
    ctx.fillStyle = color; ctx.fillRect(x, legY - 9, 14, 4)
    ctx.fillStyle = '#666666'; ctx.font = `12px ${FONT}`; ctx.textAlign = 'left'
    ctx.fillText(label, x + 20, legY)
    return x + 20 + ctx.measureText(label).width + 22
  }
  const lx = legend(P, '#1D9E75', '009816 實質淨額')
  legend(lx, '#A8855C', '放床底下實質淨額')

  const cx = P, cw = W - 2 * P
  const cyTop = ty + 66, ch = 148, cyBot = cyTop + ch
  const n = Math.max(2, years)
  const maxV = Math.max(...s9816, ...sMatt, 1)
  const xAt = i => cx + cw * (i / (n - 1))
  const yAt = v => cyBot - ch * (v / maxV)

  // 基線
  ctx.strokeStyle = '#eeeeee'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(cx, cyBot); ctx.lineTo(cx + cw, cyBot); ctx.stroke()

  const drawLine = (arr, color, width) => {
    ctx.strokeStyle = color; ctx.lineWidth = width
    ctx.lineJoin = 'round'
    ctx.beginPath()
    arr.forEach((v, i) => { const X = xAt(i), Y = yAt(v); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y) })
    ctx.stroke()
  }
  drawLine(sMatt, '#A8855C', 2)     // 放床底下（現金被通膨吃掉）
  drawLine(s9816, '#1D9E75', 2.5)   // 009816 實質淨額

  // x 軸端點標籤
  ctx.fillStyle = '#999999'; ctx.font = `12px ${FONT}`
  ctx.textAlign = 'left';  ctx.fillText('1年', cx, cyBot + 16)
  ctx.textAlign = 'right'; ctx.fillText(`${years}年`, cx + cw, cyBot + 16)

  // 結論
  const mattEnd = sMatt[sMatt.length - 1]
  ctx.fillStyle = '#1a1a1a'; ctx.font = `14px ${FONT}`; ctx.textAlign = 'left'
  ctx.fillText(
    `${years}年後，009816 實質 ${fmtM(real9816)}，比「放床底下」多 ${fmtM(real9816 - mattEnd)}（今日購買力）`,
    P, cyBot + 46,
  )

  // 頁尾標示
  ctx.fillStyle = '#aaaaaa'; ctx.font = `12px ${FONT}`
  ctx.fillText(
    `（）內為以年通膨 ${(infl * 100).toFixed(1)}% 折現後的今日購買力 · 僅供個人試算，非投資建議`,
    P, H - 20,
  )

  // 下載
  canvas.toBlob(blob => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `投資試算_${years}年_年化${(dr * 100).toFixed(0)}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 'image/png')
}
