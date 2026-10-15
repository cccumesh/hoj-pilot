/**
 * Generate patent audit PDFs + JSON appendices.
 * Run: node scripts/generate-patent-audit-reports.mjs
 */
import { writeFileSync, existsSync, unlinkSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import {
  META,
  PATENT_PROTOTYPE_MAPPING,
  SCORECARD,
  DISCLOSURE_INVENTORY,
  REVERSE_PROTOTYPE_GAPS,
  ATTORNEY_QUESTIONS_COMBINED,
  TOP10_ATTORNEY,
} from './patent-audit/report-data.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'docs', 'patent-audit')
mkdirSync(outDir, { recursive: true })

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const CSS = `
@page { size: A4; margin: 14mm 12mm 16mm 12mm; }
* { box-sizing: border-box; }
body {
  font-family: "Segoe UI", system-ui, sans-serif;
  font-size: 9.5pt;
  line-height: 1.45;
  color: #1a1a1a;
  margin: 0;
  padding: 0;
}
.cover {
  page-break-after: always;
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24mm 8mm;
}
.cover h1 { font-size: 22pt; font-weight: 700; margin: 0 0 12px; line-height: 1.2; }
.cover .sub { font-size: 11pt; color: #444; margin-bottom: 24px; }
.cover .meta { font-size: 9pt; color: #666; }
h2 { font-size: 13pt; margin: 22px 0 8px; page-break-after: avoid; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
h3 { font-size: 10.5pt; margin: 14px 0 6px; page-break-after: avoid; }
p { margin: 0 0 8px; }
ul, ol { margin: 0 0 10px 18px; padding: 0; }
li { margin-bottom: 4px; }
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 7.5pt;
  margin: 10px 0 14px;
  page-break-inside: auto;
}
th, td {
  border: 1px solid #bbb;
  padding: 4px 5px;
  vertical-align: top;
  text-align: left;
}
th { background: #f0f0f0; font-weight: 600; }
tr { page-break-inside: avoid; }
.legend { font-size: 8pt; background: #f8f8f8; padding: 8px; margin: 8px 0; border-left: 3px solid #333; }
.disclaimer { font-size: 8pt; color: #555; font-style: italic; margin: 12px 0; }
pre.diagram {
  font-family: Consolas, monospace;
  font-size: 7pt;
  background: #f5f5f5;
  padding: 10px;
  white-space: pre-wrap;
  border: 1px solid #ddd;
  margin: 10px 0;
}
.score-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 12px 0;
}
.score-card {
  border: 1px solid #ccc;
  padding: 8px;
  font-size: 8.5pt;
}
.score-card strong { font-size: 14pt; display: block; }
.page-break { page-break-before: always; }
.toc { font-size: 9pt; }
.toc li { margin: 3px 0; }
.tag { font-size: 7pt; font-weight: 600; }
`

function table(headers, rows) {
  const head = headers.map((h) => `<th>${esc(h)}</th>`).join('')
  const body = rows
    .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`)
    .join('')
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`
}

function mappingTable(rows) {
  return table(
    [
      'Patent element',
      'Status',
      'Patent (summary)',
      'Prototype evidence',
      'Gap / priority',
    ],
    rows.map((r) => [
      r.element,
      r.status,
      r.patent.slice(0, 120) + (r.patent.length > 120 ? '…' : ''),
      r.evidence,
      `${r.gap.slice(0, 100)}… [${r.priority}]`,
    ]),
  )
}

function buildPrototypeReportHtml() {
  const mappingDetail = PATENT_PROTOTYPE_MAPPING.map(
    (r) => `
<h3>${esc(r.element)} <span class="tag">${esc(r.status)}</span></h3>
<p><strong>[DISCLOSED IN PROVISIONAL]</strong> ${esc(r.patent)}</p>
<p><strong>[CURRENTLY IMPLEMENTED]</strong> ${esc(r.prototype)}</p>
<p><strong>Technical match:</strong> ${esc(r.match)}</p>
<p><strong>Gap:</strong> ${esc(r.gap)}</p>
<p><strong>Evidence:</strong> <code>${esc(r.evidence)}</code></p>
`,
  ).join('')

  const scores = Object.entries(SCORECARD)
    .map(([k, v]) => {
      const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
      return `<div class="score-card"><strong>${v.score}/100</strong>${esc(label)}<br/>${esc(v.note)}</div>`
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>AKXERAI Patent Prototype Audit</title>
<style>${CSS}</style>
</head>
<body>

<div class="cover">
  <h1>AKXERAI — PATENT ↔ PROTOTYPE REALITY AUDIT &amp; 5-MONTH TECHNICAL EXECUTION ROADMAP</h1>
  <p class="sub">Forensic codebase review × Indian provisional specification · Engineering readiness only</p>
  <p class="meta">Repository: ${esc(META.repo)}<br/>
  Provisional: ${esc(META.provisionalFile)} (${META.provisionalPages} pages)<br/>
  Generated: ${esc(META.generated)}</p>
  <p class="disclaimer">${esc(META.disclaimer)}</p>
</div>

<h2>Executive summary</h2>
<p>The working HOJ pilot demonstrates a <strong>commercially meaningful slice</strong> of the provisional’s story: physical scan → unit identity → gated generative persona (Myra) → persistent ledger memory → usage metering → brand dashboard. The <strong>strongest overlap</strong> is generative persona + stateful memory + scan-triggered authorization + per-unit codes. The <strong>largest gap</strong> is patent Layer C (material/NPU liveness), cryptographic fusion, and decentralized ledger/DID — the prototype uses <strong>Gemini vision prompts</strong> for “Layer 2/3” and <strong>Supabase Postgres</strong> instead of smart contracts.</p>
<p>Do not present the prototype as implementing silicon sub-20ms indexing, IMU power-gating, steganographic decode, or on-device SLM — these are <strong>[FUTURE / R&D]</strong> or <strong>[DISCLOSED IN PROVISIONAL]</strong> only.</p>

<div class="legend">
<strong>Status legend:</strong> 🟢 MATCHED · 🟡 PARTIAL · 🔵 ARCHITECTURE ONLY · 🟠 FUTURE/R&amp;D · 🔴 NOT FOUND · 🟣 NEW DEVELOPMENT (post-provisional product)
</div>

<h2>Table of contents</h2>
<ol class="toc">
<li>Prototype forensic summary</li>
<li>Provisional invention elements (summary)</li>
<li>Patent ↔ prototype mapping (table + detail)</li>
<li>Invention vs implementation technology</li>
<li>Design-around analysis</li>
<li>5-month buildability audit</li>
<li>Month-by-month roadmap</li>
<li>Team required</li>
<li>Technical evidence package</li>
<li>Patent attorney handoff</li>
<li>Three scenarios (5 months)</li>
<li>Core IP reality check</li>
<li>Executive scorecard</li>
<li>One-page action plan</li>
</ol>

<div class="page-break"></div>
<h2>Part 1 — Current prototype (forensic)</h2>
<h3>End-to-end flow [CURRENTLY IMPLEMENTED]</h3>
<ol>
<li>Browser loads React app; MindAR tracks <code>public/targets.mind</code> (Layer A UX).</li>
<li>On target found: anchor video → canvas frame → <code>verifyHojProduct()</code> (Gemini image + VERIFY_SYSTEM).</li>
<li>On REAL: code matched to <code>ledger_threads.verification_code</code>; device_id binds sender/receiver seats.</li>
<li><code>isVerified</code> unlocks mic/chat; Gemini + Inworld/ElevenLabs; lines persist to Supabase.</li>
<li>Exit: Archivist summaries to <code>session_summaries</code>; token/voice usage appended.</li>
</ol>
<h3>Not implemented [NOT FOUND]</h3>
<ul>
<li>QR decode library; NPU/microtexture; blockchain/DID; crypto fusion; runtime budget hard-stop; image redaction before cloud verify.</li>
</ul>

<h2>Part 2 — Provisional invention elements (extract)</h2>
<p>Source: ${esc(META.provisionalFile)}. Key blocks: tiered tri-layer matrix 116A/B/C; fusion engine 118; ledger engine 120 (DID, quota, royalty); edge-cloud 126; privacy 128; optional geospatial 136; method claims pp. 21–22.</p>

<h2>Part 3 — Patent ↔ prototype mapping</h2>
${mappingTable(PATENT_PROTOTYPE_MAPPING)}
<div class="page-break"></div>
<h3>Detailed mapping entries</h3>
${mappingDetail}

<h2>Part 4 — Invention vs implementation technology</h2>
<table>
<thead><tr><th>Category</th><th>AKXERAI architecture (keep for claims discussion)</th><th>Replaceable vendor stack</th></tr></thead>
<tbody>
<tr><td>Identity path</td><td>Physical scan → unit code → ledger authorization</td><td>Gemini vision vs other VLM; printed HOJ- vs QR decode</td></tr>
<tr><td>Anti-spoof</td><td>Multi-signal gate before session</td><td>Prompt-based liveness vs NPU/material CV</td></tr>
<tr><td>Persona</td><td>Product-bound stateful generative agent + voice</td><td>Gemini, Inworld, ElevenLabs, MindAR, Three.js</td></tr>
<tr><td>Economic control</td><td>Per-unit metering + prepaid pools</td><td>Supabase vs other DB; wallet in brand_accounts</td></tr>
</tbody>
</table>
<p class="disclaimer">Technical scope to discuss with patent attorney — not a legal conclusion.</p>

<h2>Part 5 — Design-around analysis</h2>
${table(
  ['Element', 'Design-around risk', 'Why'],
  [
    ['Cloud VLM verify', 'HIGH', 'Competitor can swap Gemini for any vision API with similar prompts'],
    ['MindAR tracking', 'HIGH', 'Any AR SDK / custom CV for planar anchor'],
    ['Postgres ledger', 'HIGH', 'Any registry with per-unit rows'],
    ['Multi-layer gating before AI', 'MEDIUM', 'Concept of staged auth before generative session is broader than HOJ prompts'],
    ['Sender/receiver memory on same code', 'MEDIUM', 'Product pattern; patent does not detail HOJ gift flow'],
    ['Layer B ties identity to commercial quota', 'LOW–MEDIUM', 'Explicit in provisional pp. 11, 15 — if claimed at architecture level'],
  ],
)}

<h2>Part 6 — 5-month buildability (selected rows)</h2>
${table(
  ['Feature', 'Status', 'Feasibility', 'Time', 'Notes'],
  [
    ['Documented A/B/C test suite + logs', '🟡', '🟢', '2–3 w', 'Evidence for attorney; no new hardware'],
    ['Structured spoof test matrix (photo/screen/print)', '🟡', '🟡', '4–6 w', 'Measure false accept/reject; still VLM'],
    ['Runtime budget enforcement gate', '🔴', '🟢', '1–2 w', 'Engineering only'],
    ['Formal fusion state machine + audit log', '🟡', '🟢', '2–4 w', 'Software embodiment of fusion 118'],
    ['NPU microtexture Layer C', '🔴', '🔴', '5+ mo', 'NOT REALISTIC TO PROMISE IN 5 MONTHS'],
    ['Blockchain/DID royalty engine', '🔴', '🔴', 'R&D', 'Future embodiment or separate project'],
    ['Steganographic unit payload', '🔴', '🔴', 'R&D', 'Manufacturing + CV research'],
    ['On-device SLM fallback', '🔴', '🟠', '3–5 mo', 'High risk on small team'],
  ],
)}

<div class="page-break"></div>
<h2>Part 7 — 5-month roadmap (adapted)</h2>
<h3>Month 1</h3>
<ul><li>Baseline demo record; verify regression set; map MindAR vs verify decoupling; attorney evidence folder structure.</li></ul>
<h3>Month 2</h3>
<ul><li>Fusion spec doc + code-aligned gates; unknown-code / PAIR_FULL tests; budget column enforcement design.</li></ul>
<h3>Month 3</h3>
<ul><li>Spoof corpus tests (photo, screen, print); log LAYER outcomes; dashboard export of verify failures.</li></ul>
<h3>Month 4</h3>
<ul><li>Ledger/quota hard gates; observability; memory/summary QA; optional QR decode path as alt embodiment demo.</li></ul>
<h3>Month 5</h3>
<ul><li>Freeze architecture doc + evidence bundle; complete-spec handoff deck; recorded demo video with dated logs.</li></ul>

<h2>Part 8 — Team</h2>
<p><strong>Minimum team (5 mo):</strong> 1 full-stack (founder+engineer), 1 CV/ML contractor (part-time mo 2–4 for spoof tests), patent technical advisor (review only).</p>
<p><strong>Ideal team:</strong> + dedicated backend/security (budget gates), + QA (test matrices), AR engineer part-time (MindAR hardening).</p>

<h2>Part 9 — Evidence checklist (sample)</h2>
${table(
  ['Evidence', 'Why', 'When', 'Store'],
  [
    ['Verify outcome logs per layer', 'Prove multi-layer gate', 'Each sprint', 'docs/evidence/verify-logs/'],
    ['Spoof test spreadsheet', 'Liveness maturity', 'Month 3', 'docs/evidence/spoof-matrix/'],
    ['Architecture + sequence diagrams', 'Attorney enablement', 'Month 2', 'docs/evidence/diagrams/'],
    ['Metering before/after budget gate', 'Economic control', 'Month 4', 'Supabase export + screen'],
    ['Dated demo videos', 'Reduction to practice', 'Monthly', 'Secure drive + hash manifest'],
  ],
)}

<h2>Part 10 — Attorney handoff checklist</h2>
<ul>
<li>A. Submitted provisional PDF</li>
<li>B. Working prototype (Netlify/local)</li>
<li>C. This mapping report + JSON appendix</li>
<li>D–F. Implemented / partial / future lists in Part 3</li>
<li>G–I. Experiments + design-arounds in Parts 5–6</li>
<li>J–O. Questions below; do NOT claim blockchain/NPU as built</li>
</ul>
<h3>Questions to ask patent attorney</h3>
<ol>${ATTORNEY_QUESTIONS_COMBINED.map((q) => `<li>${esc(q)}</li>`).join('')}</ol>

<h2>Part 11 — Three scenarios (5 months)</h2>
${table(
  ['Scenario', 'Delivers', 'Team', 'Risk'],
  [
    ['A Conservative', 'Docs, tests, budget gate, evidence folder', '1–2', 'Low'],
    ['B Realistic', 'A + spoof matrix + fusion audit log + QR alt path demo', '2–3', 'Medium'],
    ['C Aggressive R&D', 'B + material liveness prototype research', '4+', 'High — do not tie to complete spec promises'],
  ],
)}

<h2>Part 12 — Core IP reality check</h2>
<ol>
<li><strong>Strongest in prototype:</strong> Product-bound Myra persona with sender/receiver memory on verified unit codes.</li>
<li><strong>Strongest in provisional:</strong> Tri-layer auth + fusion-gated generative persona + ledger/quota abstraction.</li>
<li><strong>Overlap:</strong> Scan-gated AI session, unit identity, persistent memory, usage accounting.</li>
<li><strong>Far apart:</strong> NPU liveness, crypto fusion, DID/smart contracts, hardware indexing.</li>
<li><strong>Demo vs architecture:</strong> Meaningful architecture partially demonstrated — not mere slideshow.</li>
<li><strong>Third-party heavy:</strong> Gemini, MindAR, Three.js, Inworld, Supabase, Netlify.</li>
<li><strong>Own orchestration:</strong> Verify protocol, ledger pairing, prompts, metering, dashboard, session roles.</li>
<li><strong>Biggest weakness:</strong> Liveness not empirically validated; Layer C not implemented.</li>
<li><strong>Biggest patent-support risk:</strong> Examiner compares claims to prototype and finds only cloud prompts.</li>
<li><strong>Build next:</strong> Evidence-grade verify/spoof tests + explicit fusion/metering gates.</li>
<li><strong>Do not waste 5 mo on:</strong> Full blockchain royalty engine, steganographic printing, SoC indexing.</li>
<li><strong>Take to attorney now:</strong> Mapping table + honesty on Layer C + ledger embodiment breadth.</li>
</ol>

<div class="page-break"></div>
<h2>Part 13 — Executive scorecard</h2>
<div class="score-grid">${scores}</div>

<h2>Part 14 — One-page action plan</h2>
${table(
  ['Horizon', 'Owner', 'Output', 'Success'],
  [
    ['Next 7 days', 'Founder', 'Run ledger_threads_fresh_start.sql; record baseline demo video', 'Clean Kotty verify + chat'],
    ['Next 30 days', 'Engineer', '20-case verify log spreadsheet', 'Layer outcomes captured'],
    ['Month 2', 'Engineer', 'Fusion state doc + budget gate PR', 'Blocked chat when cap exceeded (test)'],
    ['Month 3', 'CV contractor', 'Spoof matrix v1', 'False accept rate documented'],
    ['Month 4', 'Engineer', 'Architecture PDF + sequence diagrams', 'Attorney-ready pack'],
    ['Month 5', 'Founder+attorney', 'Complete spec meeting', 'Claim strategy aligned to evidence'],
  ],
)}

<p class="disclaimer">${esc(META.disclaimer)}</p>
</body>
</html>`
}

function buildDisclosureReportHtml() {
  const invTable = table(
    ['Concept', 'Disclosure level', 'Where in provisional', 'Notes'],
    DISCLOSURE_INVENTORY.map((r) => [r.concept, r.level, r.where, r.notes]),
  )

  const reverseTable = table(
    ['Prototype capability', 'In provisional?', 'Support', 'Attorney discussion'],
    REVERSE_PROTOTYPE_GAPS.map((r) => [r.capability, r.inProvisional, r.support, r.attorney]),
  )

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>AKXERAI Provisional Disclosure Gap Audit</title>
<style>${CSS}</style>
</head>
<body>

<div class="cover">
  <h1>AKXERAI — PROVISIONAL PATENT DISCLOSURE GAP AUDIT</h1>
  <p class="sub">What the filed provisional actually discloses · gaps before complete specification</p>
  <p class="meta">Primary source: ${esc(META.provisionalFile)}<br/>Generated: ${esc(META.generated)}</p>
  <p class="disclaimer">${esc(META.disclaimer)}</p>
</div>

<h2>Executive summary</h2>
<p>The provisional <strong>strongly discloses</strong> a broad tri-layer (A/B/C) authentication and fusion-gated generative persona system with optional ledger/DID/quota language, edge-cloud split, privacy engine, and many hardware-forward embodiments. It <strong>does not clearly disclose</strong> the HOJ-specific sender/receiver gifting memory model, prepaid SaaS wallet flow (Economics Playbook), or any vendor-specific stack (Gemini, MindAR, Supabase) — which is appropriate if claims stay architectural.</p>
<p><strong>Weak zones:</strong> software-level step-by-step relationships (identity→liveness→fusion→session→metering); enablement for “cryptographic” fusion when working example may be prompt gates; gift/recipient product logic; SaaS commercial model linkage to Layer B.</p>

<h2>Methodology</h2>
<p>Full read of 25-page provisional PDF. Cross-check against codebase <strong>only</strong> to flag <strong>[CURRENT DEVELOPMENT NOT CLEARLY DISCLOSED IN PROVISIONAL]</strong> — prototype features are never treated as disclosed in the filing.</p>

<div class="legend">
🟢 EXPLICIT · 🟡 BROAD/WEAK · 🟠 IMPLIED · 🔴 NOT FOUND IN PROVISIONAL
</div>

<h2>§4 — Invention element inventory (summary table)</h2>
${invTable}

<h2>§5 — Concepts adequately disclosed</h2>
<ul>
<li>Tri-layer matrix with Layer A planar, Layer B optical identity (visible + steganographic alternatives), Layer C material liveness.</li>
<li>Fusion engine conditioning persona on multi-layer validation.</li>
<li>Layer B as economic control for generative resource authorization (pp. 11, 15).</li>
<li>Decentralized ledger engine with quota and royalty (broad).</li>
<li>Edge-cloud orchestration, privacy redaction/embeddings, optional geofencing.</li>
</ul>

<h2>§6 — Under-specified concepts</h2>
<ul>
<li><strong>Identity → authorization:</strong> present but software fusion steps not as explicit as method claims on pp. 21–22.</li>
<li><strong>Unit ID → budget:</strong> linked via Layer B + engine 120; no relational ledger schema.</li>
<li><strong>Liveness → session:</strong> implied via Layer C failure and fusion; no photo-spoof taxonomy.</li>
<li><strong>Persona binding:</strong> PTE-bound persona yes; collect/deliver narrative no.</li>
</ul>

<h2>§7 — Missing from provisional (important)</h2>
<ul>
<li>Prepaid B2B wallet / Light-Standard-Deep packages (Economics Playbook only).</li>
<li>Sender/receiver two-seat device model and Archivist summary format.</li>
<li>Browser-only PWA deployment as primary embodiment.</li>
<li>Specific Gemini/Inworld/Netlify implementations.</li>
</ul>

<div class="page-break"></div>
<h2>§8 — Reverse audit (prototype → provisional)</h2>
${reverseTable}

<h2>§9 — Relationship chain audit</h2>
${table(
  ['Relationship', 'Disclosed?', 'Strength'],
  [
    ['Identity → Authentication', '🟢', 'Layer B + matrix'],
    ['Liveness → Authentication', '🟡', 'Layer C described; fusion link broad'],
    ['Authentication → AI session', '🟡', 'Fusion triggers persona — strong conceptually'],
    ['Unit ID → budget/quota', '🟡', 'Layer B economic + ledger 120'],
    ['Unit ID → memory', '🟠', 'Object memory yes; gift threads no'],
    ['Physical product → persona', '🟢', 'PTE-bound persona core'],
  ],
)}

<h2>§10 — A/B/C audit (what patent says each layer is)</h2>
<p><strong>Layer A:</strong> Planar pattern recognition + image tracking; 2D signature (NOT merely “MindAR”).</p>
<p><strong>Layer B:</strong> Unit-level identity from visible encodings OR steganography; neural reconstruction; <em>economic control</em>.</p>
<p><strong>Layer C:</strong> NPU microtexture/material liveness — not “Gemini LAYER2 prompt”.</p>
<p><strong>Combination:</strong> Fusion gate authorizes generative session — <strong>clearly disclosed</strong>; implementation crypto combine <strong>not proven</strong> in prototype.</p>

<h2>§11 — Third-party technology audit</h2>
<p>Provisional generally avoids vendor lock-in (good). Attorney should ensure complete specification does not over-rely on Gemini-only examples in working embodiments.</p>

<h2>§12 — Alternative embodiments in provisional</h2>
<p>QR/barcode/steganography/visible patterns: <strong>explicitly disclosed</strong>. Cloud vs edge SLM: <strong>disclosed</strong>. Multiple device types: <strong>disclosed</strong>.</p>

<h2>§13 — What may have been worth including (categorized)</h2>
<p><strong>Category A (core):</strong> Software fusion state machine as alternative to “cryptographic combine”. <strong>B:</strong> Centralized registry as ledger embodiment. <strong>C:</strong> Example verify prompt output format. <strong>D:</strong> Reel/social story — optional product feature.</p>

<h2>§14 — Do not randomly add</h2>
<ul>
<li>Generic “AI chatbot” without PTE binding.</li>
<li>Blockchain buzzwords without embodiment.</li>
<li>Hardware performance numbers without tests.</li>
<li>HOJ marketing copy as technical invention.</li>
</ul>

<h2>§15 — Priority matrix (excerpt)</h2>
${table(
  ['Gap', 'Priority', '5-month impact'],
  [
    ['Layer C enablement vs VLM prototype', 'P0', '🟡 partial validate only'],
    ['Ledger: blockchain vs Postgres', 'P0', '🟢 document registry embodiment'],
    ['Sender/receiver gift flow', 'P1', '🟢 engineering evidence; disclosure decision'],
    ['SaaS wallet in complete spec', 'P1', '🟢 link to Layer B quota'],
    ['Steganographic payload', 'P3', '🔴 not realistic in 5 mo'],
  ],
)}

<h2>§17 — Questions for patent attorney</h2>
<ol>${TOP10_ATTORNEY.map((q) => `<li>${esc(q)}</li>`).join('')}</ol>

<h2>§18 — Patent coverage map</h2>
<pre class="diagram">                     AKXERAI INVENTION (provisional disclosure)
                            |
     -----------------------+------------------------
     |                       |                        |
 IDENTITY 🟢            VERIFICATION 🟢            PERSONA 🟢
 Unit ID 🟢             Liveness 🟢 (NPU)          AI/voice 🟡
 Visual/QR 🟢          Anti-spoof 🟢              AR manifest 🟡
 Stegano 🟢 (emb)       Auth 🟡
     |                       |
     +----------- FUSION / AUTHORIZATION 🟢 ----------+
     |                       |
 SESSION 🟡              LEDGER/QUOTA 🟢 (broad)
 (software)             DID/smart contract 🟢 (not built)
     |
 EXPERIENCE / GIFT FLOW 🔴 (prototype-only)
 ANALYTICS 🟡</pre>

<h2>§19 — Executive conclusion</h2>
<ol>
<li>Clearly covers: tri-layer + fusion-gated persona + ledger/quota abstraction + many alternatives.</li>
<li>Broad only: software fusion steps, SaaS wallet, gifting memory.</li>
<li>Ambiguous: crypto combine vs app-level gates; relational ledger vs blockchain.</li>
<li>Missing: HOJ sender/receiver, prepaid packages, vendor stack.</li>
<li>Prototype has: Gemini verify protocol, Supabase schema, Myra prompts — mostly <strong>post-filing implementation</strong> or <strong>not disclosed</strong>.</li>
<li>Top gaps for attorney: Layer C enablement, ledger breadth, gift flow, economic control evidence.</li>
</ol>

<h2>Top 10 attorney discussion items</h2>
<ol>${TOP10_ATTORNEY.map((q) => `<li>${esc(q)}</li>`).join('')}</ol>

<p class="disclaimer">${esc(META.disclaimer)}</p>
</body>
</html>`
}

function writeJson(path, obj) {
  writeFileSync(path, JSON.stringify(obj, null, 2), 'utf8')
  console.log('Wrote', path)
}

function htmlToPdf(htmlPath, pdfPath) {
  const localAppData = process.env.LOCALAPPDATA || ''
  const pf = process.env.ProgramFiles || 'C:\\Program Files'
  const pfx86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)'
  const browsers = [
    join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    join(pf, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    join(pfx86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    join(pf, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    join(pfx86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  ]
  const browser = browsers.find((p) => existsSync(p))
  if (!browser) {
    console.warn('No Chrome/Edge — open HTML manually:', htmlPath)
    return false
  }
  try {
    if (existsSync(pdfPath)) unlinkSync(pdfPath)
  } catch {
    /* ignore */
  }
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/')
  const r = spawnSync(
    browser,
    ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${pdfPath}`, fileUrl],
    { stdio: 'inherit', timeout: 180000 },
  )
  return r.status === 0 && existsSync(pdfPath)
}

// --- main ---
const html1 = join(outDir, 'AKXERAI_PATENT_PROTOTYPE_5_MONTH_AUDIT.html')
const pdf1 = join(outDir, 'AKXERAI_PATENT_PROTOTYPE_5_MONTH_AUDIT.pdf')
const json1 = join(outDir, 'AKXERAI_PATENT_MAPPING_DATA.json')

const html2 = join(outDir, 'AKXERAI_PROVISIONAL_DISCLOSURE_GAP_AUDIT.html')
const pdf2 = join(outDir, 'AKXERAI_PROVISIONAL_DISCLOSURE_GAP_AUDIT.pdf')
const json2 = join(outDir, 'AKXERAI_PROVISIONAL_DISCLOSURE_GAP_AUDIT.json')

writeFileSync(html1, buildPrototypeReportHtml(), 'utf8')
writeFileSync(html2, buildDisclosureReportHtml(), 'utf8')

writeJson(json1, {
  meta: META,
  mapping: PATENT_PROTOTYPE_MAPPING,
  scorecard: SCORECARD,
  attorneyQuestions: ATTORNEY_QUESTIONS_COMBINED,
  generated: new Date().toISOString(),
})

writeJson(json2, {
  meta: META,
  disclosureInventory: DISCLOSURE_INVENTORY,
  reversePrototypeGaps: REVERSE_PROTOTYPE_GAPS,
  top10Attorney: TOP10_ATTORNEY,
  generated: new Date().toISOString(),
})

if (htmlToPdf(html1, pdf1)) console.log('PDF:', pdf1)
else console.log('HTML (print to PDF):', html1)

if (htmlToPdf(html2, pdf2)) console.log('PDF:', pdf2)
else console.log('HTML (print to PDF):', html2)
