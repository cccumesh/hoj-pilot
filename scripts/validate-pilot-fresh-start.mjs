import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const sqlPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'supabase',
  'ledger_threads_fresh_start.sql',
)
const s = readFileSync(sqlPath, 'utf8')
const issues = []

if (/\(\d+,\s*'HOJ-RICHER'/.test(s)) issues.push('seed still has HOJ-RICHER rows')
const vals = s.match(/insert into public\.ledger_threads[\s\S]*?values\n([\s\S]*?)\n;/)
if (!vals) issues.push('no values block')
else {
  const rows = vals[1].split('\n').filter((l) => l.trim().startsWith('('))
  const seqs = new Set()
  const codes = new Set()
  let badTotal = 0
  for (const r of rows) {
    const m = r.match(/\((\d+),\s*'([^']+)',\s*'(\w+)'/)
    if (!m) continue
    codes.add(m[2])
    const tail = r.match(/,\s*(\d+),\s*(\d+)\s*\),?\s*$/)
    if (tail) {
      seqs.add(Number(tail[1]))
      if (Number(tail[2]) !== 101) badTotal++
    }
  }
  if (rows.length !== 202) issues.push(`row count ${rows.length} not 202`)
  if (codes.size !== 101) issues.push(`unique codes ${codes.size} not 101`)
  if (seqs.size !== rows.length) issues.push('duplicate row_seq')
  if (badTotal) issues.push('total_codes not 101 on some rows')
  const kotty = rows.filter((l) => l.includes('HOJ-KOTTY'))
  if (kotty.length !== 2) issues.push(`KOTTY rows ${kotty.length}`)
  if (!kotty.some((l) => l.includes("(0, 'HOJ-KOTTY'"))) issues.push('KOTTY not code_no 0')
  const maxSeq = Math.max(...seqs)
  if (maxSeq !== 202) issues.push(`max row_seq ${maxSeq} not 202`)
}

if (!/101000000/.test(s)) issues.push('pool not 101000000')
if (!/,\s*101\s*\n\);/.test(s.replace(/\r/g, ''))) {
  if (!/codes_allocated[\s\S]{0,200}\n\s*101\s*\n/.test(s)) issues.push('codes_allocated not 101')
}

const requiredCols = [
  'age_category',
  'ledger_insights',
  'axerai_ai_used_total',
  'axerai_voice_used_total',
]
for (const c of requiredCols) {
  if (!s.includes(c)) issues.push(`missing column ${c}`)
}

if (!/LEDGER_THREADS FRESH/i.test(s)) {
  issues.push('expected LEDGER_THREADS FRESH header')
}
if (/drop table if exists public\.brand_accounts cascade/i.test(s)) {
  issues.push('ledger fresh must NOT drop brand_accounts')
}

if (issues.length) {
  console.error('FAIL:\n' + issues.join('\n'))
  process.exit(1)
}
console.log('OK: ledger_threads_fresh_start.sql (101 codes, 202 rows, Kotty@0)')
