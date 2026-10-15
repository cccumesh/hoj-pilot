/**
 * AKXERAI Master Book — full rebuild from source PDFs.
 * Run: node scripts/generate-akxerai-master-book.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { parts, chapters } from './akxerai-master-book/chapters.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const bookDir = join(root, 'docs', 'akxerai-book')
const css = readFileSync(join(bookDir, 'master-book.css'), 'utf8')
const htmlPath = join(bookDir, 'AKXERAI-MASTER-BOOK.html')
const pdfPath = join(bookDir, 'AKXERAI-MASTER-BOOK.pdf')

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function renderBlocks(blocks) {
  return blocks
    .map((b) => {
      if (b.type === 'p') return `<p>${b.html}</p>`
      if (b.type === 'pull') return `<div class="pull">${b.html}</div>`
      if (b.type === 'h2') return `<h2>${esc(b.text)}</h2>`
      if (b.type === 'h3') return `<h3>${esc(b.text)}</h3>`
      if (b.type === 'ul') return `<ul>${b.items.map((i) => `<li>${i}</li>`).join('')}</ul>`
      if (b.type === 'table') {
        const th = b.headers.map((h) => `<th>${esc(h)}</th>`).join('')
        const rows = b.rows
          .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`)
          .join('')
        return `<table><tr>${th}</tr>${rows}</table>`
      }
      if (b.type === 'diagram') {
        return `<div class="diagram"><div class="title">${esc(b.title)}</div><div class="flow">${esc(b.flow)}</div></div>`
      }
      if (b.type === 'label') {
        const cls = b.kind ? ` label ${b.kind}` : ' label'
        return `<div class="${cls.trim()}">${esc(b.text)}</div>`
      }
      return ''
    })
    .join('\n')
}

let tocHtml = ''
let bodyHtml = ''
let globalCh = 0

for (const p of parts) {
  tocHtml += `<div class="toc-part">${esc(p.title)}</div>\n`
  const start = globalCh + 1
  const partCh = chapters.filter((c) => c.part === p.id)
  tocHtml += `<ol start="${start}">\n`
  for (const c of partCh) {
    globalCh += 1
    tocHtml += `<li>${esc(c.title)}</li>\n`
  }
  tocHtml += `</ol>\n`

  bodyHtml += `<section class="part"><div class="num">${esc(p.title)}</div><h1>${esc(p.heading)}</h1><p>${esc(p.blurb)}</p></section>\n`

  for (const c of partCh) {
    const chNum = chapters.indexOf(c) + 1
    const labels = (c.labels || [])
      .map((l) => `<div class="label ${l.kind || ''}">${esc(l.text)}</div>`)
      .join('')
    bodyHtml += `<section class="chapter${c.dense ? ' dense' : ''}">
<div class="kicker">Chapter ${chNum}${c.kicker ? ' · ' + esc(c.kicker) : ''}</div>
${labels}
<h1 class="ch">${esc(c.title)}</h1>
${renderBlocks(c.blocks)}
</section>\n`
  }
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>AKXERAI — The Master Book</title>
<style>${css}</style>
</head>
<body>
<section class="cover">
<div class="eyebrow">AKXERAI · Master book · Rebuilt from source documents · October 2026</div>
<div class="rule"></div>
<h1>Products<br>receive<br><em>digital life.</em></h1>
<p class="deck">The relationship between a brand and a customer does not have to end at checkout.</p>
<p>This is the complete company book — thesis, system, economics, pilot, patent vision, and the road toward a standard. Built from the Founder Foundation, Platform Blueprint, Economics Playbook, Backend reference, MVP technical archive, provisional specification, and product prompts — not from a single earlier draft alone.</p>
<div class="cover-foot"><span>Confidential</span><span>Chetan Chandrakant Chaudhari</span></div>
</section>
<section class="blank"></section>
<section class="note">
<h2>A note before Part I</h2>
<p>This is not a brochure for one jeweller. House of Jewels is a launchpad — the first room in which AKXERAI can prove that a real object may refuse a photograph, carry a brand persona, remember across scans, and meter usage honestly. The company is the standard those rooms plug into. A bottle, shoe, watch, perfume, garment, or jewel: if it leaves a counter with a story, it can leave powered by AKXERAI.</p>
<p>Primary authorities for facts in this rebuild: Founder Foundation, Platform Blueprint, Economics Playbook, Backend reference, MVP technical archive, provisional specification (filed — not granted), product prompts (including direct-retail Scenario A), and the earlier company book where it aligns with those sources. Where categories differ, the technical and foundation documents win.</p>
<p>Part VI also includes a <strong>founder build diary</strong> — feelings, frustrations, and vision clarifications from documented Cursor sessions with Chetan (July–August 2026), such as the first “Myra on track” moment, memory betrayals, prompt-as-rulebook critique, perfume/club/first-party-data goal, and the standard line <em>is par AKXERAI hona chahiye tha</em>. Those are founder truth, not invented customer stories.</p>
<p>Labels appear throughout: <strong>PILOT</strong> (implemented or in validation), <strong>PATENT CONCEPT</strong> (provisional claims), <strong>FUTURE VISION</strong>, and <strong>SCENARIO</strong> (illustrative economics or roadmap — not achieved results). A billion-dollar valuation line, if it appears, is arithmetic under assumptions — not a promise to a bank.</p>
</section>
<section class="toc"><h2>Contents</h2>${tocHtml}</section>
${bodyHtml}
<section class="back">
<div class="eyebrow">AKXERAI</div>
<div class="rule"></div>
<h1>Not a QR company.<br><span class="gold">Digital relationship infrastructure for physical products.</span></h1>
<p>When a box feels wrong without it, the standard has begun.</p>
<div class="back-foot"><span>Products receive digital life</span></div>
</section>
</body>
</html>`

writeFileSync(htmlPath, html, 'utf8')
console.log('Wrote', htmlPath, 'chapters:', chapters.length)

const edgePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
]
const edge = edgePaths.find((p) => {
  try {
    readFileSync(p)
    return true
  } catch {
    return false
  }
})

if (edge) {
  const url = `file:///${htmlPath.replace(/\\/g, '/')}`
  spawnSync(edge, ['--headless', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${pdfPath}`, url], {
    stdio: 'inherit',
    timeout: 120000,
  })
  console.log('PDF:', pdfPath)
} else {
  console.log('Edge not found — open HTML and print to PDF manually.')
}
