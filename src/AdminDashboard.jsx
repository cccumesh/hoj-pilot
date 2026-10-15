import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_BRAND_SLUG, fetchBrandAccount, fetchBrandWalletSnapshot } from './brandAccounts.js'
import {
  buildBrandDashboardAnalytics,
  buildAkxeraiPlatformStats,
  buildBrandIntelligenceStats,
  codeStatusLabel,
  fetchBrandLedgerThreads,
  getCodeThreads,
} from './brandDashboard.js'
import { backfillThreadSummariesFromConversation } from './myraLedger.js'
import {
  buildDashboardAnalytics,
  buildElevenLabsUsageAnalytics,
  buildGeminiUsageAnalytics,
  formatDashboardDuration,
  isLedgerConfigured,
} from './myraLedger.js'
import { LEDGER_TABLE } from './supabaseClient.js'

function formatTokenCount(value) {
  return Number(value || 0).toLocaleString('en-IN')
}

function formatCompactTokenCount(value) {
  const n = Math.max(0, Number(value) || 0)
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`
  return String(n)
}

function formatTokenLogTime(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function callTypeLabel(call) {
  const key = String(call ?? '').toLowerCase()
  if (key === 'verify') return 'Verify'
  if (key === 'welcome') return 'Welcome'
  if (key === 'chat') return 'Chat'
  if (key === 'summary') return 'Summary'
  if (key === 'tts') return 'Voice TTS'
  if (!key || key === 'unknown') return 'Other'
  return key.charAt(0).toUpperCase() + key.slice(1)
}

function PerCodeBudgetBar({ aiUsed, aiBudget, voiceUsed, voiceBudget, nearVoiceLimit, voiceExhausted }) {
  const aiPct = aiBudget > 0 ? Math.min(100, Math.round((aiUsed / aiBudget) * 100)) : 0
  const voicePct = voiceBudget > 0 ? Math.min(100, Math.round((voiceUsed / voiceBudget) * 100)) : 0
  const voiceTone = voiceExhausted ? 'exhausted' : nearVoiceLimit ? 'warn' : 'ok'

  return (
    <div className="admin-dash__code-budget">
      <div
        className="admin-dash__code-budget-row"
        title={`AI ${formatTokenCount(aiUsed)} / ${formatTokenCount(aiBudget)}`}
      >
        <span className="admin-dash__code-budget-label">AI</span>
        <div className="admin-dash__code-budget-track">
          <div className="admin-dash__code-budget-fill admin-dash__code-budget-fill--ai" style={{ width: `${aiPct}%` }} />
        </div>
        <span className="admin-dash__code-budget-val">
          {formatCompactTokenCount(aiUsed)}/{formatCompactTokenCount(aiBudget)}
        </span>
      </div>
      <div
        className={`admin-dash__code-budget-row admin-dash__code-budget-row--${voiceTone}`}
        title={`Voice ${formatTokenCount(voiceUsed)} / ${formatTokenCount(voiceBudget)}`}
      >
        <span className="admin-dash__code-budget-label">Voice</span>
        <div className="admin-dash__code-budget-track">
          <div
            className={`admin-dash__code-budget-fill admin-dash__code-budget-fill--voice admin-dash__code-budget-fill--${voiceTone}`}
            style={{ width: `${voicePct}%` }}
          />
        </div>
        <span className="admin-dash__code-budget-val">
          {formatCompactTokenCount(voiceUsed)}/{formatCompactTokenCount(voiceBudget)}
        </span>
      </div>
    </div>
  )
}

function TokenLogByCallSection({ tokenLog, perCodeCaps = {}, showCodeColumn = false, hideRecentLog = false }) {
  const byCall = tokenLog?.byCall ?? {}
  const aiCap = perCodeCaps.aiBudget
  const voiceCap = perCodeCaps.voiceBudget

  return (
    <>
      <section className="admin-dash__panel admin-dash__panel--tokens">
        <h2 className="admin-dash__panel-title">AI tokens — call type breakdown</h2>
        <p className="admin-dash__panel-note">
          Verify / welcome / chat / summary — ledger se live. Per-code cap: AI{' '}
          {formatCompactTokenCount(aiCap || 1_000_000)}, voice {formatCompactTokenCount(voiceCap || 15_000)}.
        </p>
        <div className="admin-dash__metric-grid admin-dash__metric-grid--3">
          <MetricCountBox label="Verify" value={formatCompactTokenCount(byCall.verify)} hint="Card photo check" tone="blue" />
          <MetricCountBox label="Welcome" value={formatCompactTokenCount(byCall.welcome)} hint="Opening line" tone="teal" />
          <MetricCountBox label="Chat" value={formatCompactTokenCount(byCall.chat)} hint="Live conversation" tone="gold" />
          <MetricCountBox label="Summary" value={formatCompactTokenCount(byCall.summary)} hint="Archivist digest" tone="muted" />
          <MetricCountBox
            label="Other AI"
            value={formatCompactTokenCount(byCall.other)}
            hint="Unclassified calls"
            tone="muted"
          />
          <MetricCountBox
            label="Voice TTS total"
            value={formatCompactTokenCount(tokenLog?.totalVoiceTokens)}
            hint={`${tokenLog?.voiceCallCount ?? 0} TTS rows`}
            tone="rose"
          />
        </div>
        <div className="admin-dash__token-breakdown">
          <span>Total AI: {formatTokenCount(tokenLog?.totalAiTokens)}</span>
          <span>Prompt: {formatTokenCount(tokenLog?.promptTokens)}</span>
          <span>Output: {formatTokenCount(tokenLog?.outputTokens)}</span>
          <span>{tokenLog?.aiCallCount ?? 0} AI log rows</span>
        </div>
      </section>

      {!hideRecentLog ? (
      <section className="admin-dash__panel">
        <h2 className="admin-dash__panel-title">Token log — recent AI calls</h2>
        {(tokenLog?.aiEntries?.length ?? 0) === 0 ? (
          <p className="admin-dash__empty">No AI token usage logged yet.</p>
        ) : (
          <div className="admin-dash__table-wrap">
            <table className="admin-dash__table admin-dash__table--tokens">
              <thead>
                <tr>
                  <th>Time</th>
                  {showCodeColumn ? <th>Code</th> : null}
                  <th>Role</th>
                  <th>Type</th>
                  <th>Scan</th>
                  <th>Tokens</th>
                  <th>Model</th>
                </tr>
              </thead>
              <tbody>
                {tokenLog.aiEntries.map((entry, index) => (
                  <tr key={`${entry.at}-${entry.code}-${entry.call}-${index}`}>
                    <td className="admin-dash__muted">{formatTokenLogTime(entry.at)}</td>
                    {showCodeColumn ? <td>{entry.code || '—'}</td> : null}
                    <td>{roleLabel(entry.threadRole)}</td>
                    <td>{callTypeLabel(entry.call)}</td>
                    <td>{entry.scan ?? '—'}</td>
                    <td>{formatTokenCount(entry.totalTokens)}</td>
                    <td className="admin-dash__muted">{entry.model || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      ) : null}
    </>
  )
}

function ExperienceViewMetrics({ arSeconds = 0, vrSeconds = 0, overviewSeconds = 0, compact = false }) {
  if (!arSeconds && !vrSeconds && !overviewSeconds) {
    return compact ? null : (
      <p className="admin-dash__panel-desc admin-dash__panel-desc--muted">
        Abhi koi AR/VR view time save nahi — naye scan ke baad yahan dikhega.
      </p>
    )
  }

  return (
    <div className={`admin-dash__metric-grid${compact ? '' : ' admin-dash__metric-grid--3'}`}>
      <MetricCountBox
        label="AR view time"
        value={formatDashboardDuration(arSeconds)}
        hint="Card camera + Myra on product"
        tone="blue"
      />
      <MetricCountBox
        label="VR mode time"
        value={formatDashboardDuration(vrSeconds)}
        hint="Full-screen Myra (no camera)"
        tone="akxerai"
      />
      <MetricCountBox
        label="Overview / intro video"
        value={formatDashboardDuration(overviewSeconds)}
        hint="Target video after verify"
        tone="teal"
      />
    </div>
  )
}

const AUTH_KEY = 'axerai_dash_auth'
const DASHBOARD_PASSWORD = String(import.meta.env.VITE_DASHBOARD_PASSWORD ?? '').trim()
const DASHBOARD_REQUIRES_PASSWORD = import.meta.env.PROD || Boolean(DASHBOARD_PASSWORD)

function roleLabel(role) {
  if (role === 'sender') return 'Sender'
  if (role === 'receiver') return 'Receiver'
  return role || '—'
}

/** Dashboard meta — codes only on All codes tab; elsewhere scan + role only. */
function scanMeta({ scanNumber, role, tag, location, code } = {}) {
  const parts = []
  if (code) parts.push(code)
  if (scanNumber) parts.push(`Scan #${scanNumber}`)
  if (role) parts.push(roleLabel(role))
  if (tag) parts.push(tag)
  if (location) parts.push(location)
  return parts.join(' · ') || '—'
}

function buildTopCustomerVoiceQuotes(brand, limit = 5) {
  const pool = [
    ...(brand.brandPraise ?? []).map((row) => ({ ...row, voiceKind: 'praise' })),
    ...(brand.brandDiscovery ?? []).map((row) => ({ ...row, voiceKind: 'discovery' })),
    ...(brand.akxeraiPraise ?? []).map((row) => ({ ...row, voiceKind: 'akxerai' })),
  ]
  const seen = new Set()
  const picked = []
  for (let i = pool.length - 1; i >= 0 && picked.length < limit; i -= 1) {
    const row = pool[i]
    const key = String(row.quote ?? '').trim().slice(0, 48)
    if (!key || seen.has(key)) continue
    seen.add(key)
    picked.push(row)
  }
  return picked.reverse()
}

function customerVoiceTag(voiceKind) {
  if (voiceKind === 'discovery') return 'Discovery'
  if (voiceKind === 'akxerai') return 'Akxerai +'
  return 'Product praise'
}

function CustomerVoiceStrip({ quotes = [] }) {
  if (!quotes.length) {
    return (
      <section className="admin-dash__customer-voice" aria-label="Customer voice">
        <h2 className="admin-dash__panel-title admin-dash__panel-title--inline">Customer voice — top quotes</h2>
        <p className="admin-dash__empty admin-dash__empty--compact">
          Abhi koi praise / discovery quote nahi — scan + baat ke baad yahan dikhegi.
        </p>
      </section>
    )
  }

  return (
    <section className="admin-dash__customer-voice" aria-label="Customer voice — top quotes">
      <h2 className="admin-dash__panel-title admin-dash__panel-title--inline">Customer voice — top quotes</h2>
      <p className="admin-dash__panel-note admin-dash__panel-note--tight">
        Product praise, discovery, Akxerai delight — user ki apni zubaan (love story nahi).
      </p>
      <div className="admin-dash__customer-voice-track">
        {quotes.map((item) => (
          <article
            key={`${item.voiceKind}-${item.code}-${item.scanNumber}-${item.quote.slice(0, 24)}`}
            className={`admin-dash__voice-chip admin-dash__voice-chip--${item.voiceKind}`}
          >
            <p className="admin-dash__voice-chip-quote">"{item.quote}"</p>
            <p className="admin-dash__voice-chip-meta">
              {scanMeta({
                code: item.code,
                scanNumber: item.scanNumber,
                role: item.role,
                tag: customerVoiceTag(item.voiceKind),
              })}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

const VIEWS = [
  { id: 'overview', label: 'Overview' },
  { id: 'codes', label: 'All codes' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'brandprompt', label: 'Brand prompt' },
  { id: 'akxerai', label: 'Akxerai' },
  { id: 'brand', label: 'House of Jewels' },
]

function MetricCountBox({ label, value, hint, tone = 'default' }) {
  return (
    <article className={`admin-dash__metric-box admin-dash__metric-box--${tone}`}>
      <span className="admin-dash__metric-label">{label}</span>
      <strong className="admin-dash__metric-value">{value}</strong>
      {hint ? <span className="admin-dash__metric-hint">{hint}</span> : null}
    </article>
  )
}

function DashBarChart({ items = [], title }) {
  const max = Math.max(...items.map((row) => row.value), 1)

  return (
    <div className="admin-dash__bar-chart">
      {title ? <p className="admin-dash__bar-chart-title">{title}</p> : null}
      {items.map((row) => {
        const pct = Math.max(4, Math.round((row.value / max) * 100))
        return (
          <div key={row.label} className="admin-dash__bar-row">
            <span className="admin-dash__bar-label">{row.label}</span>
            <div className="admin-dash__bar-track" aria-hidden="true">
              <div
                className={`admin-dash__bar-fill admin-dash__bar-fill--${row.tone || 'default'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="admin-dash__bar-val">{row.display ?? row.value}</span>
          </div>
        )
      })}
    </div>
  )
}

function EngagementComboChart({ talkSeconds = 0, arSeconds = 0, vrSeconds = 0, overviewSeconds = 0 }) {
  const items = [
    {
      label: 'Talk time',
      value: talkSeconds,
      display: formatDashboardDuration(talkSeconds),
      tone: 'gold',
    },
    { label: 'AR view', value: arSeconds, display: formatDashboardDuration(arSeconds), tone: 'blue' },
    { label: 'VR mode', value: vrSeconds, display: formatDashboardDuration(vrSeconds), tone: 'akxerai' },
    {
      label: 'Overview video',
      value: overviewSeconds,
      display: formatDashboardDuration(overviewSeconds),
      tone: 'teal',
    },
  ].filter((row) => row.value > 0)

  if (!items.length) {
    return (
      <p className="admin-dash__panel-desc admin-dash__panel-desc--muted">
        Engagement chart — naye scan ke baad talk + view time yahan dikhega.
      </p>
    )
  }

  return <DashBarChart items={items} title="Engagement mix — relative time" />
}

function ScanFunnelChart({ scanned = 0, withTalk = 0, noTalk = 0, remaining = 0, total = 0 }) {
  const items = [
    { label: 'Codes scanned', value: scanned, display: `${scanned}/${total}`, tone: 'gold' },
    { label: 'Scan + conversation', value: withTalk, display: String(withTalk), tone: 'teal' },
    { label: 'Scan, no talk', value: noTalk, display: String(noTalk), tone: 'warn' },
    { label: 'Not scanned yet', value: remaining, display: String(remaining), tone: 'muted' },
  ]

  return <DashBarChart items={items} title="Scan funnel — codes" />
}

function SentimentSplitChart({ positive = 0, negative = 0 }) {
  const total = positive + negative
  if (!total) {
    return <p className="admin-dash__panel-desc admin-dash__panel-desc--muted">Abhi koi Akxerai sentiment data nahi.</p>
  }

  const posPct = Math.round((positive / total) * 100)
  const negPct = 100 - posPct

  return (
    <div className="admin-dash__sentiment-chart">
      <div className="admin-dash__sentiment-bar" aria-hidden="true">
        <span className="admin-dash__sentiment-pos" style={{ width: `${posPct}%` }} />
        <span className="admin-dash__sentiment-neg" style={{ width: `${negPct}%` }} />
      </div>
      <div className="admin-dash__sentiment-legend">
        <span>
          Positive <strong>{positive}</strong> ({posPct}%)
        </span>
        <span>
          Negative <strong>{negative}</strong> ({negPct}%)
        </span>
      </div>
    </div>
  )
}

function AkxeraiPlatformView({ brand }) {
  const s = useMemo(() => buildAkxeraiPlatformStats(brand), [brand])

  return (
    <>
      <p className="admin-dash__panel-desc admin-dash__panel-desc--lead">
        Akxerai platform health — engagement, sentiment, scan quality. Sab numbers ledger se live.
      </p>

      <section className="admin-dash__panel admin-dash__panel--hero">
        <h2 className="admin-dash__panel-title">Engagement — pilot total</h2>
        <div className="admin-dash__hero-split">
          <article className="admin-dash__stat-card admin-dash__stat-card--hero">
            <span className="admin-dash__stat-label">Total talk time</span>
            <strong className="admin-dash__stat-value">{formatDashboardDuration(s.totalTalkTimeSeconds)}</strong>
            <span className="admin-dash__stat-hint">Brand engagement — sab codes milkar</span>
          </article>
          <EngagementComboChart
            talkSeconds={s.totalTalkTimeSeconds}
            arSeconds={s.totalArViewSeconds}
            vrSeconds={s.totalVrViewSeconds}
            overviewSeconds={s.totalOverviewViewSeconds}
          />
        </div>
      </section>

      <section className="admin-dash__panel">
        <h2 className="admin-dash__panel-title">Akxerai response — achha vs bura</h2>
        <SentimentSplitChart positive={s.akxeraiPositive} negative={s.akxeraiNegative} />
        <div className="admin-dash__metric-grid admin-dash__metric-grid--2 admin-dash__metric-grid--tight">
          <MetricCountBox
            label="Positive Akxerai comments"
            value={s.akxeraiPositive}
            hint={`${s.codesWithAkxeraiPositive} codes pe praise`}
            tone="akxerai"
          />
          <MetricCountBox
            label="Negative Akxerai feedback"
            value={s.akxeraiNegative}
            hint={`${s.codesWithAkxeraiNegative} codes pe issue`}
            tone="negative"
          />
        </div>
      </section>

      <section className="admin-dash__panel admin-dash__panel--tokens">
        <h2 className="admin-dash__panel-title">Experience views — AR / VR / overview</h2>
        <p className="admin-dash__panel-note">Pure codes ka total — session footer se (har scan end pe save).</p>
        <ExperienceViewMetrics
          arSeconds={s.totalArViewSeconds}
          vrSeconds={s.totalVrViewSeconds}
          overviewSeconds={s.totalOverviewViewSeconds}
        />
      </section>

      <section className="admin-dash__panel">
        <h2 className="admin-dash__panel-title">Scan funnel &amp; quality</h2>
        <ScanFunnelChart
          scanned={s.scannedCodes}
          withTalk={s.scannedWithTalk}
          noTalk={s.scannedNoTalk}
          remaining={s.codesRemaining}
          total={s.totalProductCodes}
        />
        <div className="admin-dash__metric-grid admin-dash__metric-grid--2 admin-dash__metric-grid--tight">
          <MetricCountBox
            label="Scan hua, baat nahi hui"
            value={s.scannedNoTalk}
            hint="Scan complete par user ne kuch nahi bola"
            tone="warn"
          />
          <MetricCountBox
            label="Scan + real conversation"
            value={s.scannedWithTalk}
            hint="User ne actually baat ki"
            tone="teal"
          />
        </div>
      </section>

      <section className="admin-dash__panel">
        <h2 className="admin-dash__panel-title">Pairing — sender &amp; receiver</h2>
        <div className="admin-dash__metric-grid admin-dash__metric-grid--3">
          <MetricCountBox
            label="Dono ne scan kiya"
            value={s.bothScanned}
            hint="Sender + receiver dono active"
            tone="teal"
          />
          <MetricCountBox
            label="Sirf sender ne scan"
            value={s.senderOnlyScanned}
            hint="Receiver abhi nahi aaya"
            tone="blue"
          />
          <MetricCountBox
            label="Sirf receiver ne scan"
            value={s.receiverOnlyScanned}
            hint="Sender skip / rare"
            tone="blue"
          />
        </div>
      </section>

      <section className="admin-dash__panel">
        <h2 className="admin-dash__panel-title">Codes — scan status</h2>
        <div className="admin-dash__metric-grid">
          <MetricCountBox label="Codes scanned" value={s.scannedCodes} hint={`${s.scanRatePct}% of ${s.totalProductCodes} boxes`} tone="gold" />
          <MetricCountBox label="Codes remaining" value={s.codesRemaining} hint="Abhi scan nahi hue" tone="muted" />
          <MetricCountBox label="Total scans" value={s.totalScans} hint="Sender + receiver sessions" />
        </div>
      </section>

      {brand.ageCategoryAnalytics?.breakdown?.length ? (
        <section className="admin-dash__panel">
          <h2 className="admin-dash__panel-title">Scanner age categories</h2>
          <p className="admin-dash__panel-desc">
            First-scan age pick (post AR video) — tone tier for Myra personality.
          </p>
          <div className="admin-dash__metric-grid">
            {brand.ageCategoryAnalytics.breakdown.map((row) => (
              <MetricCountBox
                key={row.id}
                label={row.label}
                value={row.count}
                hint="Sessions with age tag"
                tone="teal"
              />
            ))}
          </div>
          {brand.ageCategoryAnalytics.unknown > 0 ? (
            <p className="admin-dash__panel-desc admin-dash__panel-desc--muted">
              Untagged (return scans / before picker): {brand.ageCategoryAnalytics.unknown}
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="admin-dash__panel">
        <h2 className="admin-dash__panel-title">Per-code voice budget — soft exit zone</h2>
        <div className="admin-dash__metric-grid admin-dash__metric-grid--2">
          <MetricCountBox
            label="Codes near voice limit"
            value={s.codesNearVoiceLimit}
            hint="≤300 voice tokens bache — soft exit trigger zone"
            tone="warn"
          />
          <MetricCountBox
            label="Codes voice exhausted"
            value={s.codesVoiceExhausted}
            hint="Per-code voice cap hit"
            tone="negative"
          />
        </div>
      </section>

      <TokenLogByCallSection tokenLog={s.tokenLog} perCodeCaps={s.perCodeCaps} hideRecentLog />
    </>
  )
}

function BrandIntelligenceView({ brand, brandLabel }) {
  const s = useMemo(() => buildBrandIntelligenceStats(brand), [brand])

  return (
    <>
      <p className="admin-dash__panel-desc admin-dash__panel-desc--lead">
        {brandLabel} — jo customer ne chat mein brand ke baare mein bola: product, shop, staff, discovery. Sab
        session summaries se nikalta hai.
      </p>

      <section className="admin-dash__panel">
        <h2 className="admin-dash__panel-title">Reach — brand boxes</h2>
        <div className="admin-dash__metric-grid admin-dash__metric-grid--3">
          <MetricCountBox label="Total product codes" value={s.totalProductCodes} hint="101 incl. HOJ-KOTTY test card (code_no 0)" />
          <MetricCountBox label="Scanned boxes" value={s.scannedProducts} hint="Kam se kam ek scan" tone="gold" />
          <MetricCountBox
            label="Scanned, no customer chat"
            value={s.scannedNoBrandChat}
            hint="Scan hua par koi story/feedback nahi"
            tone="warn"
          />
        </div>
      </section>

      <section className="admin-dash__panel">
        <h2 className="admin-dash__panel-title">Brand feedback — chat se</h2>
        <div className="admin-dash__metric-grid admin-dash__metric-grid--3">
          <MetricCountBox
            label="Product / shop praise"
            value={s.brandPraiseCount}
            hint={`${s.codesWithPraise} codes pe tareef`}
            tone="gold"
          />
          <MetricCountBox
            label="Discovery notes"
            value={s.discoveryCount}
            hint={`${s.codesWithDiscovery} codes — kaise mile`}
            tone="teal"
          />
          <MetricCountBox
            label="Complaints / issues"
            value={s.brandCriticismCount}
            hint={`${s.codesWithComplaint} codes pe issue`}
            tone="negative"
          />
        </div>
      </section>

      <section className="admin-dash__panel">
        <h2 className="admin-dash__panel-title">Summary</h2>
        <div className="admin-dash__metric-grid admin-dash__metric-grid--2">
          <MetricCountBox
            label="Codes with any brand signal"
            value={s.codesWithAnyBrandSignal}
            hint="Praise, discovery, ya complaint"
            tone="teal"
          />
          <MetricCountBox
            label="Total talk time"
            value={formatDashboardDuration(s.totalTalkTimeSeconds)}
            hint="Saare codes milkar"
          />
        </div>
      </section>

      {(s.recentPraise.length > 0 || s.recentDiscovery.length > 0) && (
        <section className="admin-dash__panel admin-dash__panel--quotes">
          <h2 className="admin-dash__panel-title">Recent — brand voice</h2>
          <div className="admin-dash__feedback-stack">
            {s.recentPraise.map((item) => (
              <FeedbackCard
                key={`rp-${item.scanNumber}-${item.role}-${item.quote.slice(0, 24)}`}
                meta={scanMeta({ scanNumber: item.scanNumber, role: item.role, tag: 'Praise' })}
                headline={item.quote}
                tone="brand"
              />
            ))}
            {s.recentDiscovery.map((item) => (
              <FeedbackCard
                key={`rd-${item.scanNumber}-${item.role}-${item.quote.slice(0, 24)}`}
                meta={scanMeta({ scanNumber: item.scanNumber, role: item.role, tag: 'Discovery' })}
                headline={item.quote}
                tone="brand"
              />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

function TokenUsageRing({ label, used, total, accent = 'gold' }) {
  const safeTotal = Math.max(Number(total) || 0, Number(used) || 0, 1)
  const usedValue = Math.max(0, Number(used) || 0)
  const remaining = Math.max(0, safeTotal - usedValue)
  const usedPct = Math.min(100, Math.round((usedValue / safeTotal) * 100))
  const remainPct = 100 - usedPct
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const usedDash = (usedPct / 100) * circumference
  const remainDash = (remainPct / 100) * circumference
  const gradId = `ring-grad-${accent}`

  return (
    <article className={`admin-dash__token-ring admin-dash__token-ring--${accent}`}>
      <div className="admin-dash__token-ring-body">
        <div className="admin-dash__token-ring-chart" aria-hidden="true">
          <svg viewBox="0 0 128 128" className="admin-dash__token-ring-svg">
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={accent === 'rose' ? '#ffd4de' : '#ffe8a8'} />
                <stop offset="100%" stopColor={accent === 'rose' ? '#e87898' : '#d4a853'} />
              </linearGradient>
              <filter id={`${gradId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle cx="64" cy="64" r={radius} className="admin-dash__token-ring-track" />
            <circle
              cx="64"
              cy="64"
              r={radius}
              className="admin-dash__token-ring-remain"
              strokeDasharray={`${remainDash} ${circumference - remainDash}`}
              strokeDashoffset={-usedDash}
              transform="rotate(-90 64 64)"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              className="admin-dash__token-ring-fill"
              stroke={`url(#${gradId})`}
              filter={`url(#${gradId}-glow)`}
              strokeDasharray={`${usedDash} ${circumference - usedDash}`}
              transform="rotate(-90 64 64)"
            />
          </svg>
          <div className="admin-dash__token-ring-center">
            <strong>{formatCompactTokenCount(usedValue)}</strong>
            <span>{usedPct}% used</span>
          </div>
        </div>
        <div className="admin-dash__token-ring-meta">
          <h3 className="admin-dash__token-ring-title">{label}</h3>
          <div className="admin-dash__token-ring-stats">
            <p>
              <span>Used</span>
              <strong>{formatTokenCount(usedValue)}</strong>
            </p>
            <p>
              <span>Remaining</span>
              <strong>{formatTokenCount(remaining)}</strong>
            </p>
            <p className="admin-dash__token-ring-total">
              <span>Total pool</span>
              <strong>{formatCompactTokenCount(safeTotal)}</strong>
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}

function DashboardBrand({ subtitle, brandLabel }) {
  return (
    <div className="admin-dash__brand">
      <span className="admin-dash__brand-mark">AKXERAI</span>
      <h1 className="admin-dash__brand-title">Akxerai Insights</h1>
      {brandLabel ? <p className="admin-dash__brand-pilot">{brandLabel}</p> : null}
      {subtitle ? <p className="admin-dash__brand-sub">{subtitle}</p> : null}
    </div>
  )
}

function DashboardLogin({ onSuccess, brandLabel }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!DASHBOARD_PASSWORD) {
      setError('Password set nahi hai — .env me VITE_DASHBOARD_PASSWORD daalo.')
      return
    }
    if (password === DASHBOARD_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, '1')
      onSuccess()
      return
    }
    setError('Galat password.')
  }

  return (
    <div className="admin-dash admin-dash--gate">
      <form className="admin-dash__gate" onSubmit={handleSubmit}>
        <DashboardBrand
          brandLabel={brandLabel || 'House of Jewels Pilot'}
          subtitle="Private brand dashboard — password same as before"
        />
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Enter password"
          />
        </label>
        {error ? <p className="admin-dash__gate-error">{error}</p> : null}
        <button type="submit">Open dashboard</button>
      </form>
    </div>
  )
}

function FeedbackCard({ meta, headline, body, tone = 'neutral' }) {
  if (!headline && !body) return null
  return (
    <article className={`admin-dash__feedback-card admin-dash__feedback-card--${tone}`}>
      {meta ? <p className="admin-dash__quote-meta">{meta}</p> : null}
      {headline ? <p className="admin-dash__feedback-headline">"{headline}"</p> : null}
      {body && body !== headline ? <p className="admin-dash__feedback-body">{body}</p> : null}
    </article>
  )
}

function PraiseDetailSheet({ type, quotes, onClose }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  const copy = {
    brand: {
      title: 'Brand praise',
      subtitle: 'User ne House of Jewels product ki kya tareef ki',
      empty: 'Abhi koi tarif save nahi — scan, baat, exit ke baad yahan dikhegi.',
      quoteClass: 'admin-dash__praise',
    },
    akxerai: {
      title: 'Akxerai praise',
      subtitle: 'User ne Myra / Akxerai experience ki kya tareef ki',
      empty: 'Abhi koi Akxerai tarif save nahi.',
      quoteClass: 'admin-dash__praise',
    },
    'brand-criticism': {
      title: 'Brand issues',
      subtitle: 'User ne product / shop / service pe kya problem batayi',
      empty: 'Abhi koi brand complaint save nahi.',
      quoteClass: 'admin-dash__criticism',
    },
    'akxerai-criticism': {
      title: 'Akxerai issues',
      subtitle: 'User ne Myra / tech experience pe kya burai batayi',
      empty: 'Abhi koi Akxerai complaint save nahi.',
      quoteClass: 'admin-dash__criticism',
    },
    discovery: {
      title: 'Discovery — kaise mile HOJ',
      subtitle: 'User ne khud bataya — shop, friend, social, walk-in',
      empty: 'Abhi koi discovery note save nahi.',
      quoteClass: 'admin-dash__praise',
    },
  }[type] ?? {
    title: 'Feedback',
    subtitle: '',
    empty: 'Abhi koi entry nahi.',
    quoteClass: 'admin-dash__praise',
  }

  return (
    <div className="admin-dash__sheet-backdrop" onClick={onClose} role="presentation">
      <div
        className="admin-dash__sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-praise-sheet-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="admin-dash__sheet-head">
          <div>
            <h2 id="admin-praise-sheet-title">{copy.title}</h2>
            <p className="admin-dash__sheet-sub">{copy.subtitle}</p>
          </div>
          <button type="button" className="admin-dash__sheet-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        {quotes.length === 0 ? (
          <p className="admin-dash__empty">{copy.empty}</p>
        ) : (
          <ul className="admin-dash__quote-list admin-dash__quote-list--sheet">
            {quotes.map((item) => (
              <li key={`${type}-${item.scanNumber}-${item.role}-${item.quote.slice(0, 32)}`}>
                <span className="admin-dash__quote-meta">
                  {scanMeta({ scanNumber: item.scanNumber, role: item.role })}
                </span>
                <p className={copy.quoteClass}>"{item.quote}"</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function akxeraiDeltaLabel(row) {
  const pos = row.akxeraiPositive ?? 0
  const neg = row.akxeraiNegative ?? 0
  if (!pos && !neg) return '—'
  if (pos && neg) return `+${pos} / −${neg}`
  if (pos) return `+${pos}`
  return `−${neg}`
}

function OverviewView({ brand, brandAccount, onOpenFeedbackSheet }) {
  const w = brand.wallet ?? {}
  const brandLabel = brandAccount?.brand_label || 'House of Jewels Pilot'
  const pilot = useMemo(() => buildAkxeraiPlatformStats(brand), [brand])
  const productCodeTotal = pilot.totalProductCodes
  const akxeraiNegativeCount = useMemo(
    () => (brand.akxeraiFeedback ?? []).filter((row) => row.sentiment === 'negative').length,
    [brand.akxeraiFeedback],
  )
  const avgTalkPerScannedCodeSeconds = brand.avgTalkTimePerScannedCodeSeconds ?? 0
  const scannedCodeCount = pilot.scannedCodes ?? brand.scannedCodes ?? 0
  const giftCompleteCount = pilot.bothScanned ?? 0
  const giftCompletePct =
    productCodeTotal > 0 ? Math.round((giftCompleteCount / productCodeTotal) * 100) : 0
  const discoveryCount = (brand.brandDiscovery ?? []).length
  const topCustomerVoice = useMemo(() => buildTopCustomerVoiceQuotes(brand, 5), [brand])

  return (
    <>
      <p className="admin-dash__panel-desc admin-dash__panel-desc--lead">
        {brandLabel} — pilot snapshot. Code table ke liye <strong>All codes</strong>; scan/pair detail ke liye{' '}
        <strong>Akxerai</strong> tab.
      </p>

      <section className="admin-dash__overview-top admin-dash__overview-top--4">
        <article className="admin-dash__stat-card admin-dash__stat-card--hero">
          <span className="admin-dash__stat-label">Total talk time</span>
          <strong className="admin-dash__stat-value admin-dash__stat-value--small">
            {formatDashboardDuration(brand.totalTalkTimeSeconds)}
          </strong>
          <span className="admin-dash__stat-hint">
            Avg per scanned code ({scannedCodeCount}): {formatDashboardDuration(avgTalkPerScannedCodeSeconds)}
            {' — '}
            us code ke saare scans ka total, sirf scan hue codes pe average
          </span>
          {(brand.totalArViewSeconds > 0 ||
            brand.totalVrViewSeconds > 0 ||
            brand.totalOverviewViewSeconds > 0) && (
            <div className="admin-dash__stat-subgrid">
              <span>AR: {formatDashboardDuration(brand.totalArViewSeconds)}</span>
              <span>VR: {formatDashboardDuration(brand.totalVrViewSeconds)}</span>
              <span>Intro: {formatDashboardDuration(brand.totalOverviewViewSeconds)}</span>
            </div>
          )}
        </article>
        <article className="admin-dash__stat-card admin-dash__stat-card--hero">
          <span className="admin-dash__stat-label">Total codes</span>
          <strong className="admin-dash__stat-value">{productCodeTotal}</strong>
          <span className="admin-dash__stat-hint">101 incl. HOJ-KOTTY (code_no 0)</span>
        </article>
        <article className="admin-dash__stat-card admin-dash__stat-card--hero">
          <span className="admin-dash__stat-label">Codes scanned</span>
          <strong className="admin-dash__stat-value">{pilot.scannedCodes}</strong>
          <span className="admin-dash__stat-hint">{pilot.scanRatePct}% activation</span>
        </article>
        <article className="admin-dash__stat-card admin-dash__stat-card--hero">
          <span className="admin-dash__stat-label">Codes remaining</span>
          <strong className="admin-dash__stat-value">{pilot.codesRemaining}</strong>
          <span className="admin-dash__stat-hint">Abhi scan nahi hue</span>
        </article>
      </section>

      <section className="admin-dash__overview-insights" aria-label="Gift journey and discovery">
        <article className="admin-dash__stat-card admin-dash__stat-card--hero admin-dash__stat-card--gift-complete">
          <span className="admin-dash__stat-label">Gift stories complete</span>
          <strong className="admin-dash__stat-value admin-dash__stat-value--small">
            {giftCompleteCount} / {productCodeTotal}
          </strong>
          <span className="admin-dash__stat-hint">
            {giftCompletePct}% codes — sender + receiver dono ne scan kiya
          </span>
          {scannedCodeCount > 0 ? (
            <span className="admin-dash__stat-hint admin-dash__stat-hint--sub">
              Scanned codes mein: {giftCompleteCount} / {scannedCodeCount}
            </span>
          ) : null}
        </article>
        <button
          type="button"
          className="admin-dash__stat-card admin-dash__stat-card--clickable admin-dash__stat-card--discovery"
          onClick={() => onOpenFeedbackSheet('discovery')}
          aria-label="Discovery signals — full list"
        >
          <span className="admin-dash__stat-label">Discovery signals</span>
          <strong className="admin-dash__stat-value">{discoveryCount}</strong>
          <span className="admin-dash__stat-hint">Tap — kaise mile House of Jewels</span>
        </button>
      </section>

      <section className="admin-dash__praise-spotlight" aria-label="Praise — tap for full list">
        <button
          type="button"
          className="admin-dash__stat-card admin-dash__stat-card--clickable admin-dash__stat-card--praise-brand"
          onClick={() => onOpenFeedbackSheet('brand')}
          aria-label="Brand praise — saari tareef dekho"
        >
          <span className="admin-dash__stat-label">Brand praise</span>
          <strong className="admin-dash__stat-value">{brand.brandPraise.length}</strong>
          <span className="admin-dash__stat-hint">Tap — full list</span>
        </button>
        <button
          type="button"
          className="admin-dash__stat-card admin-dash__stat-card--clickable admin-dash__stat-card--praise-akxerai"
          onClick={() => onOpenFeedbackSheet('akxerai')}
          aria-label="Akxerai praise — saari tareef dekho"
        >
          <span className="admin-dash__stat-label">Akxerai praise</span>
          <strong className="admin-dash__stat-value">{brand.akxeraiPraiseCount ?? 0}</strong>
          <span className="admin-dash__stat-hint">Tap — full list</span>
        </button>
      </section>

      <section className="admin-dash__praise-spotlight admin-dash__praise-spotlight--criticism" aria-label="Issues — tap for full list">
        <button
          type="button"
          className="admin-dash__stat-card admin-dash__stat-card--clickable admin-dash__stat-card--criticism-brand"
          onClick={() => onOpenFeedbackSheet('brand-criticism')}
          aria-label="Brand issues — saari complaints dekho"
        >
          <span className="admin-dash__stat-label">Brand issues</span>
          <strong className="admin-dash__stat-value">{(brand.brandCriticism ?? []).length}</strong>
          <span className="admin-dash__stat-hint">Tap — product / shop burai</span>
        </button>
        <button
          type="button"
          className="admin-dash__stat-card admin-dash__stat-card--clickable admin-dash__stat-card--criticism-akxerai"
          onClick={() => onOpenFeedbackSheet('akxerai-criticism')}
          aria-label="Akxerai issues — saari complaints dekho"
        >
          <span className="admin-dash__stat-label">Akxerai issues</span>
          <strong className="admin-dash__stat-value">{akxeraiNegativeCount}</strong>
          <span className="admin-dash__stat-hint">Tap — Myra / tech burai</span>
        </button>
      </section>

      <CustomerVoiceStrip quotes={topCustomerVoice} />

      <section className="admin-dash__panel admin-dash__panel--tokens">
        <h2 className="admin-dash__panel-title">Brand token pool — {brandLabel}</h2>
        <p className="admin-dash__panel-note">
          Limits DB se locked — usage live ledger se. Mode: {w.accountMode || 'trial'}
        </p>
        <div className="admin-dash__token-rings">
          <TokenUsageRing label="Akxerai AI tokens" used={w.aiUsed} total={w.aiBalance} accent="gold" />
          <TokenUsageRing label="Akxerai voice tokens" used={w.voiceUsed} total={w.voiceBalance} accent="rose" />
        </div>
      </section>
    </>
  )
}

function CodesView({ brand, filter, onFilterChange, onOpenCode }) {
  const filtered = useMemo(() => {
    const q = filter.trim().toUpperCase()
    if (!q) return brand.codes
    return brand.codes.filter((row) => row.code.includes(q))
  }, [brand.codes, filter])

  const listedCodes = filtered

  return (
    <>
      <div className="admin-dash__toolbar">
        <label className="admin-dash__field">
          <span>Search code</span>
          <input
            value={filter}
            onChange={(event) => onFilterChange(event.target.value.toUpperCase())}
            placeholder="HOJ-XXXXXX"
          />
        </label>
        <span className="admin-dash__loading-pill">
          {listedCodes.length} / {brand.totalCodes} codes
        </span>
      </div>

      <section className="admin-dash__panel">
        <h2 className="admin-dash__panel-title">All codes — {brand.totalCodes} total</h2>
        <p className="admin-dash__panel-note">
          Per-code budget DB locked — AI {formatCompactTokenCount(brand.perCodeCaps?.aiBudget || 1_000_000)} / voice{' '}
          {formatCompactTokenCount(brand.perCodeCaps?.voiceBudget || 15_000)} per box.
        </p>
        <div className="admin-dash__table-wrap">
          <table className="admin-dash__table">
            <thead>
              <tr>
                <th>#</th>
                <th>Code</th>
                <th>Status</th>
                <th>Scans</th>
                <th>Talk time</th>
                <th>Token budget</th>
                <th>Brand praise</th>
                <th>Akxerai ±</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {listedCodes.map((row, index) => (
                <tr
                  key={row.code}
                  className={
                    row.voiceExhausted
                      ? 'admin-dash__row--exhausted'
                      : row.nearVoiceLimit
                        ? 'admin-dash__row--warn'
                        : ''
                  }
                >
                  <td className="admin-dash__muted">{index + 1}</td>
                  <td>
                    <button type="button" className="admin-dash__code-link" onClick={() => onOpenCode(row.code)}>
                      {row.code}
                    </button>
                  </td>
                  <td>{codeStatusLabel(row)}</td>
                  <td>{row.totalScans}</td>
                  <td>{formatDashboardDuration(row.totalTalkTimeSeconds)}</td>
                  <td>
                    <PerCodeBudgetBar
                      aiUsed={row.aiUsed}
                      aiBudget={row.aiBudget}
                      voiceUsed={row.voiceUsed}
                      voiceBudget={row.voiceBudget}
                      nearVoiceLimit={row.nearVoiceLimit}
                      voiceExhausted={row.voiceExhausted}
                    />
                  </td>
                  <td>{row.brandPraiseCount || '—'}</td>
                  <td>{akxeraiDeltaLabel(row)}</td>
                  <td className="admin-dash__muted">{row.location || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function FeedbackView({ brand }) {
  const akxeraiPos = [
    ...brand.akxeraiPraise.map((item) => ({ ...item, kind: 'praise' })),
    ...brand.akxeraiFeedback.filter((f) => f.sentiment === 'positive'),
  ]
  const akxeraiNeg = brand.akxeraiFeedback.filter((f) => f.sentiment === 'negative')

  return (
    <>
      <p className="admin-dash__panel-desc admin-dash__panel-desc--lead">
        Customer ne brand / product ke baare mein kya bola — praise, discovery, complaint. User ki poori love
        story ya private chat yahan nahi dikhti.
      </p>

      <section className="admin-dash__panel admin-dash__panel--quotes">
        <h2 className="admin-dash__panel-title">Product / shop praise</h2>
        {brand.brandPraise.length === 0 ? (
          <p className="admin-dash__empty">No product praise captured yet.</p>
        ) : (
          <div className="admin-dash__feedback-stack">
            {brand.brandPraise.map((item) => (
              <FeedbackCard
                key={`${item.scanNumber}-${item.role}-brand-${item.quote.slice(0, 20)}`}
                meta={scanMeta({
                  scanNumber: item.scanNumber,
                  role: item.role,
                  tag: 'Praise',
                  location: item.location,
                })}
                headline={item.quote}
                tone="brand"
              />
            ))}
          </div>
        )}
      </section>

      <section className="admin-dash__panel admin-dash__panel--quotes">
        <h2 className="admin-dash__panel-title">Discovery — kaise mile HOJ</h2>
        {brand.brandDiscovery.length === 0 ? (
          <p className="admin-dash__empty">No discovery notes yet.</p>
        ) : (
          <div className="admin-dash__feedback-stack">
            {brand.brandDiscovery.map((item) => (
              <FeedbackCard
                key={`${item.scanNumber}-${item.role}-disc-${item.quote.slice(0, 20)}`}
                meta={scanMeta({ scanNumber: item.scanNumber, role: item.role, tag: 'Discovery' })}
                headline={item.quote}
                tone="brand"
              />
            ))}
          </div>
        )}
      </section>

      <section className="admin-dash__panel admin-dash__panel--quotes">
        <h2 className="admin-dash__panel-title">Complaints / issues</h2>
        {brand.brandCriticism.length === 0 ? (
          <p className="admin-dash__empty">No complaints captured yet.</p>
        ) : (
          <div className="admin-dash__feedback-stack">
            {brand.brandCriticism.map((item) => (
              <FeedbackCard
                key={`${item.scanNumber}-${item.role}-crit-${item.quote.slice(0, 20)}`}
                meta={scanMeta({ scanNumber: item.scanNumber, role: item.role, tag: 'Issue' })}
                headline={item.quote}
                tone="negative"
              />
            ))}
          </div>
        )}
      </section>

      <div className="admin-dash__feedback-split">
        <section className="admin-dash__panel admin-dash__panel--quotes">
          <h2 className="admin-dash__panel-title">Akxerai — positive</h2>
          {akxeraiPos.length === 0 ? (
            <p className="admin-dash__empty">No positive Akxerai comments yet.</p>
          ) : (
            <div className="admin-dash__feedback-stack">
              {akxeraiPos.map((item) => (
                <FeedbackCard
                  key={`ax-pos-${item.scanNumber}-${item.quote.slice(0, 16)}`}
                  meta={scanMeta({ scanNumber: item.scanNumber, role: item.role, tag: 'Akxerai +' })}
                  headline={item.quote}
                  tone="akxerai"
                />
              ))}
            </div>
          )}
        </section>

        <section className="admin-dash__panel admin-dash__panel--quotes">
          <h2 className="admin-dash__panel-title">Akxerai — negative</h2>
          {akxeraiNeg.length === 0 ? (
            <p className="admin-dash__empty">No negative Akxerai comments yet.</p>
          ) : (
            <div className="admin-dash__feedback-stack">
              {akxeraiNeg.map((item) => (
                <FeedbackCard
                  key={`ax-neg-${item.scanNumber}-${item.quote.slice(0, 16)}`}
                  meta={scanMeta({
                    scanNumber: item.scanNumber,
                    role: item.role,
                    tag: item.category || 'tech',
                  })}
                  headline={item.quote}
                  tone="negative"
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}

function BrandPromptView({ brand }) {
  const moments = brand.brandPrompt ?? []

  return (
    <>
      <p className="admin-dash__panel-desc admin-dash__panel-desc--lead">
        Jab Myra ne chat mein House of Jewels / brand / keepsake ke baare mein kuch bola — woh lines yahan. User ki
        private story nahi; sirf Myra ki brand-side awaaz.
      </p>

      <section className="admin-dash__panel admin-dash__panel--quotes">
        <h2 className="admin-dash__panel-title">Myra — brand lines ({moments.length})</h2>
        {moments.length === 0 ? (
          <p className="admin-dash__empty">
            Abhi koi brand prompt line save nahi — jab user HOJ / shop / scan puche tab yahan dikhegi.
          </p>
        ) : (
          <div className="admin-dash__feedback-stack">
            {[...moments].reverse().map((item) => (
              <FeedbackCard
                key={`bp-${item.scanNumber}-${item.role}-${item.quote.slice(0, 28)}`}
                meta={scanMeta({ scanNumber: item.scanNumber, role: item.role, tag: 'Myra' })}
                headline={item.quote}
                tone="teal"
              />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

function CodeDetailView({ code, threads, brand, onBack }) {
  const analytics = useMemo(() => buildDashboardAnalytics(threads), [threads])
  const tokenStats = useMemo(() => buildGeminiUsageAnalytics(threads), [threads])
  const voiceStats = useMemo(() => buildElevenLabsUsageAnalytics(threads), [threads])

  const codeBrandPraise = brand.brandPraise.filter((f) => f.code === code)
  const codeDiscovery = brand.brandDiscovery.filter((f) => f.code === code)
  const codeCriticism = brand.brandCriticism.filter((f) => f.code === code)
  const codeAkxerai = brand.akxeraiPraise.filter((f) => f.code === code)
  const codeBrandPrompt = (brand.brandPrompt ?? []).filter((f) => f.code === code)

  return (
    <>
      <div className="admin-dash__toolbar">
        <button type="button" className="admin-dash__btn admin-dash__btn--ghost" onClick={onBack}>
          ← All codes
        </button>
        <span className="admin-dash__loading-pill">{code}</span>
      </div>

      <section className="admin-dash__stats">
        <article className="admin-dash__stat-card">
          <span className="admin-dash__stat-label">Total scans</span>
          <strong className="admin-dash__stat-value">{analytics.totalScans}</strong>
        </article>
        <article className="admin-dash__stat-card">
          <span className="admin-dash__stat-label">Talk time (code total)</span>
          <strong className="admin-dash__stat-value">
            {formatDashboardDuration(analytics.totalTalkTimeSeconds)}
          </strong>
        </article>
        <article className="admin-dash__stat-card">
          <span className="admin-dash__stat-label">Sender talk time</span>
          <strong className="admin-dash__stat-value">
            {formatDashboardDuration(analytics.senderTalkTimeSeconds ?? 0)}
          </strong>
          <span className="admin-dash__stat-hint">{analytics.senderScanCount ?? 0} scans</span>
        </article>
        <article className="admin-dash__stat-card">
          <span className="admin-dash__stat-label">Receiver talk time</span>
          <strong className="admin-dash__stat-value">
            {formatDashboardDuration(analytics.receiverTalkTimeSeconds ?? 0)}
          </strong>
          <span className="admin-dash__stat-hint">{analytics.receiverScanCount ?? 0} scans</span>
        </article>
        <article className="admin-dash__stat-card">
          <span className="admin-dash__stat-label">Photo / screen verify fails</span>
          <strong className="admin-dash__stat-value">{analytics.verifyFailPhotoSpoof ?? 0}</strong>
        </article>
        <article className="admin-dash__stat-card">
          <span className="admin-dash__stat-label">Other verify fails</span>
          <strong className="admin-dash__stat-value">{analytics.verifyFailOther ?? 0}</strong>
        </article>
        <article className="admin-dash__stat-card">
          <span className="admin-dash__stat-label">3rd phone attempts</span>
          <strong className="admin-dash__stat-value">{analytics.pairFullAttempts ?? 0}</strong>
        </article>
        <article className="admin-dash__stat-card">
          <span className="admin-dash__stat-label">Brand praise</span>
          <strong className="admin-dash__stat-value">{codeBrandPraise.length}</strong>
        </article>
        <article className="admin-dash__stat-card">
          <span className="admin-dash__stat-label">Myra brand lines</span>
          <strong className="admin-dash__stat-value">{codeBrandPrompt.length}</strong>
        </article>
      </section>

      <section className="admin-dash__panel admin-dash__panel--tokens">
        <h2 className="admin-dash__panel-title">Tokens — {code}</h2>
        <div className="admin-dash__token-stats">
          <article className="admin-dash__stat-card">
            <span className="admin-dash__stat-label">AI tokens</span>
            <strong className="admin-dash__stat-value">{formatTokenCount(tokenStats.totalTokens)}</strong>
          </article>
          <article className="admin-dash__stat-card">
            <span className="admin-dash__stat-label">Voice tokens</span>
            <strong className="admin-dash__stat-value">{formatTokenCount(voiceStats.totalCharacters)}</strong>
          </article>
        </div>
        <div className="admin-dash__token-breakdown">
          <span>Verify: {formatTokenCount(tokenStats.byCall?.verify)}</span>
          <span>Welcome: {formatTokenCount(tokenStats.byCall?.welcome)}</span>
          <span>Chat: {formatTokenCount(tokenStats.byCall?.chat)}</span>
          <span>Summary: {formatTokenCount(tokenStats.byCall?.summary)}</span>
          <span>Other: {formatTokenCount(tokenStats.byCall?.other)}</span>
        </div>
        {(() => {
          const codeRow = brand.codes.find((row) => row.code === code)
          if (!codeRow) return null
          return (
            <PerCodeBudgetBar
              aiUsed={codeRow.aiUsed}
              aiBudget={codeRow.aiBudget}
              voiceUsed={codeRow.voiceUsed}
              voiceBudget={codeRow.voiceBudget}
              nearVoiceLimit={codeRow.nearVoiceLimit}
              voiceExhausted={codeRow.voiceExhausted}
            />
          )
        })()}
      </section>

      <section className="admin-dash__panel admin-dash__panel--quotes">
        <h2 className="admin-dash__panel-title">Brand signals — is code pe</h2>
        <p className="admin-dash__panel-note">User ki poori conversation yahan nahi — sirf brand feedback signals.</p>
        {codeBrandPraise.length + codeDiscovery.length + codeCriticism.length + codeAkxerai.length === 0 ? (
          <p className="admin-dash__empty">No brand feedback signals on this code yet.</p>
        ) : (
          <div className="admin-dash__feedback-stack">
            {codeBrandPraise.map((item) => (
              <FeedbackCard
                key={`cp-${item.scanNumber}-praise`}
                meta={scanMeta({ scanNumber: item.scanNumber, role: item.role, tag: 'Praise' })}
                headline={item.quote}
                tone="brand"
              />
            ))}
            {codeDiscovery.map((item) => (
              <FeedbackCard
                key={`cp-${item.scanNumber}-disc`}
                meta={scanMeta({ scanNumber: item.scanNumber, role: item.role, tag: 'Discovery' })}
                headline={item.quote}
                tone="brand"
              />
            ))}
            {codeCriticism.map((item) => (
              <FeedbackCard
                key={`cp-${item.scanNumber}-crit`}
                meta={scanMeta({ scanNumber: item.scanNumber, role: item.role, tag: 'Issue' })}
                headline={item.quote}
                tone="negative"
              />
            ))}
            {codeAkxerai.map((item) => (
              <FeedbackCard
                key={`cp-${item.scanNumber}-ax`}
                meta={scanMeta({ scanNumber: item.scanNumber, role: item.role, tag: 'Akxerai praise' })}
                headline={item.quote}
                tone="akxerai"
              />
            ))}
          </div>
        )}
      </section>

      <section className="admin-dash__panel admin-dash__panel--quotes">
        <h2 className="admin-dash__panel-title">Myra brand prompt — is code pe</h2>
        {codeBrandPrompt.length === 0 ? (
          <p className="admin-dash__empty">Myra ne is code pe abhi brand/HOJ pe koi line nahi boli.</p>
        ) : (
          <div className="admin-dash__feedback-stack">
            {codeBrandPrompt.map((item) => (
              <FeedbackCard
                key={`cp-${item.scanNumber}-bp-${item.quote.slice(0, 20)}`}
                meta={scanMeta({ scanNumber: item.scanNumber, role: item.role, tag: 'Myra' })}
                headline={item.quote}
                tone="teal"
              />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default function AdminDashboard() {
  useEffect(() => {
    document.documentElement.classList.add('admin-dash-page')
    return () => {
      document.documentElement.classList.remove('admin-dash-page')
    }
  }, [])

  const [authed, setAuthed] = useState(() => {
    if (!DASHBOARD_REQUIRES_PASSWORD) return true
    if (!DASHBOARD_PASSWORD) return false
    return sessionStorage.getItem(AUTH_KEY) === '1' || sessionStorage.getItem('akxerai_dash_auth') === '1'
  })

  const [view, setView] = useState('overview')
  const [selectedCode, setSelectedCode] = useState(null)
  const [codeFilter, setCodeFilter] = useState('')
  const [allThreads, setAllThreads] = useState([])
  const [brandAccount, setBrandAccount] = useState(null)
  const [walletSnapshot, setWalletSnapshot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [feedbackSheet, setFeedbackSheet] = useState(null)

  useEffect(() => {
    if (!isLedgerConfigured() || !authed) {
      setLoading(false)
      return
    }

    let cancelled = false
    ;(async () => {
      setLoading(true)
      setLoadError('')
      try {
        const [rawThreads, account, wallet] = await Promise.all([
          fetchBrandLedgerThreads(DEFAULT_BRAND_SLUG),
          fetchBrandAccount(DEFAULT_BRAND_SLUG),
          fetchBrandWalletSnapshot(DEFAULT_BRAND_SLUG),
        ])
        const threads = []
        for (const row of rawThreads) {
          if ((row.scan_count ?? 0) > 0 && row.conversation?.includes('--- session')) {
            const roleKey = row.role === 'receiver' ? 'receiver' : 'sender'
            threads.push(await backfillThreadSummariesFromConversation(row, roleKey))
          } else {
            threads.push(row)
          }
        }
      if (!cancelled) {
          setAllThreads(threads)
          setBrandAccount(account)
          setWalletSnapshot(wallet)
          if (!wallet) {
            setLoadError(
              'brand_wallet_snapshot missing — Supabase me supabase/ledger_threads_fresh_start.sql (poori file) run karo.',
            )
          }
        }
      } catch (error) {
        if (!cancelled) {
          const message = error?.message ?? String(error)
          setLoadError(
            `${message} — .env me VITE_SUPABASE_LEDGER_TABLE=ledger_threads set karo, dev server restart karo.`,
          )
          setAllThreads([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [reloadKey, authed])

  const brand = useMemo(
    () => buildBrandDashboardAnalytics(allThreads, brandAccount, walletSnapshot),
    [allThreads, brandAccount, walletSnapshot],
  )

  const codeThreads = useMemo(
    () => (selectedCode ? getCodeThreads(allThreads, selectedCode) : []),
    [allThreads, selectedCode],
  )

  const openCode = (code) => {
    setSelectedCode(code)
    setView('codes')
  }

  const brandLabel = brandAccount?.brand_label || 'House of Jewels Pilot'

  const dashboardTabs = useMemo(
    () =>
      VIEWS.map((tab) =>
        tab.id === 'brand'
          ? { ...tab, label: brandLabel.replace(/\s+pilot$/i, '').trim() || 'House of Jewels' }
          : tab,
      ),
    [brandLabel],
  )

  if (DASHBOARD_REQUIRES_PASSWORD && !DASHBOARD_PASSWORD) {
    return (
      <div className="admin-dash admin-dash--gate">
        <div className="admin-dash__gate">
          <DashboardBrand brandLabel={brandLabel} />
          <p className="admin-dash__gate-error">
            Dashboard lock ke liye <code>VITE_DASHBOARD_PASSWORD</code> .env me set karo, phir dev server restart
            karo.
          </p>
        </div>
      </div>
    )
  }

  if (!authed) {
    return <DashboardLogin onSuccess={() => setAuthed(true)} brandLabel={brandLabel} />
  }

  if (!isLedgerConfigured()) {
    return (
      <div className="admin-dash">
        <div className="admin-dash__shell">
          <p>Supabase keys missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dash">
      <div className="admin-dash__shell">
        <header className="admin-dash__hero">
          <DashboardBrand
            brandLabel={brandLabel}
            subtitle="Brand command center — all boxes · all scans · pilot data"
          />
          <div className="admin-dash__header-actions">
            <button
              type="button"
              className="admin-dash__btn admin-dash__btn--ghost"
              onClick={() => setReloadKey((value) => value + 1)}
            >
              Refresh
            </button>
            <button
              type="button"
              className="admin-dash__btn admin-dash__btn--ghost"
              onClick={() => {
                sessionStorage.removeItem(AUTH_KEY)
                setAuthed(false)
              }}
            >
              Logout
            </button>
            <a href="/" className="admin-dash__back">
              ← App
            </a>
          </div>
        </header>

        <nav className="admin-dash__tabs" aria-label="Dashboard sections">
          {dashboardTabs.map((tab) => (
                    <button
              key={tab.id}
                      type="button"
              className={`admin-dash__tab${view === tab.id && !selectedCode ? ' admin-dash__tab--active' : ''}`}
              onClick={() => {
                setSelectedCode(null)
                setView(tab.id)
              }}
            >
              {tab.label}
                    </button>
          ))}
          {loading ? <span className="admin-dash__loading-pill">Loading…</span> : null}
        </nav>

        {loading ? (
          <p className="admin-dash__empty">Ledger load ho raha hai… ({LEDGER_TABLE})</p>
        ) : loadError ? (
          <p className="admin-dash__gate-error">{loadError}</p>
        ) : selectedCode ? (
          <CodeDetailView code={selectedCode} threads={codeThreads} brand={brand} onBack={() => setSelectedCode(null)} />
            ) : (
              <>
            {view === 'overview' ? (
              <OverviewView
                brand={brand}
                brandAccount={brandAccount}
                onOpenFeedbackSheet={setFeedbackSheet}
              />
                        ) : null}
            {view === 'codes' ? (
              <CodesView brand={brand} filter={codeFilter} onFilterChange={setCodeFilter} onOpenCode={openCode} />
            ) : null}
            {view === 'feedback' ? <FeedbackView brand={brand} /> : null}
            {view === 'brandprompt' ? <BrandPromptView brand={brand} /> : null}
            {view === 'akxerai' ? <AkxeraiPlatformView brand={brand} /> : null}
            {view === 'brand' ? <BrandIntelligenceView brand={brand} brandLabel={brandLabel} /> : null}
              </>
            )}

        {feedbackSheet ? (
          <PraiseDetailSheet
            type={feedbackSheet}
            quotes={
              feedbackSheet === 'brand'
                ? (brand.brandPraiseQuotes ?? brand.brandPraise)
                : feedbackSheet === 'akxerai'
                  ? (brand.akxeraiPraiseQuotes ?? brand.akxeraiPraise ?? [])
                  : feedbackSheet === 'discovery'
                    ? (brand.brandDiscovery ?? [])
                    : feedbackSheet === 'brand-criticism'
                      ? (brand.brandCriticism ?? [])
                      : (brand.akxeraiFeedback ?? []).filter((row) => row.sentiment === 'negative')
            }
            onClose={() => setFeedbackSheet(null)}
          />
        ) : null}
      </div>
    </div>
  )
}
