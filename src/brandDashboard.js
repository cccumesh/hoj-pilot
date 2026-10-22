import { buildAgeCategoryAnalytics } from './myraAgeProfile.js'
import { LEDGER_TABLE, supabase } from './supabaseClient.js'
import { walletSnapshotToDashboard } from './brandAccounts.js'
import {
  buildDashboardAnalytics,
  buildElevenLabsUsageAnalytics,
  buildGeminiUsageAnalytics,
  parseElevenLabsUsageEntries,
  parseGeminiUsageEntries,
} from './myraLedger.js'
import {
  parseAkxeraiExperienceFeedback,
  parseAkxeraiPraiseFromSummary,
  parseBrandProductCriticism,
  parseBrandProductPraise,
  parseDiscoveryFromSummary,
  parseMyraBrandLinesFromSummary,
  sessionInsightsHasSignal,
} from './myraSummarize.js'

export const DEFAULT_BRAND_SLUG = 'house-of-jewels'

/** Feedback cards must never show raw Archivist / THREAD dumps. */
function isSummaryDump(text) {
  const t = String(text ?? '').trim()
  if (!t) return false
  if (t.length > 240) return true
  return /THREAD:|SCAN CONVERSATION:|MYRA LAST STATE:|SESSION END:/i.test(t)
}

function quoteDedupeKey(quote) {
  return String(quote ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

/** Same quote copied across scans → show once (keep latest scan metadata). */
function dedupeQuoteFeedbacks(rows) {
  const byKey = new Map()
  for (const row of rows) {
    const key = `${row.code}|${quoteDedupeKey(row.quote)}`
    const prev = byKey.get(key)
    if (!prev || (row.scanNumber ?? 0) >= (prev.scanNumber ?? 0)) {
      byKey.set(key, row)
    }
  }
  return [...byKey.values()].sort((a, b) => {
    if (a.code !== b.code) return String(a.code).localeCompare(String(b.code))
    if (a.scanNumber !== b.scanNumber) return a.scanNumber - b.scanNumber
    return quoteDedupeKey(a.quote).localeCompare(quoteDedupeKey(b.quote))
  })
}

export async function fetchBrandLedgerThreads(brandSlug = DEFAULT_BRAND_SLUG) {
  if (!supabase) return []

  const select =
    'id, code_no, verification_code, device_id, role, scan_count, conversation, session_summaries, axerai_ai_usage, axerai_voice_usage, axerai_ai_used_total, axerai_voice_used_total, brand_slug, status, axerai_ai_budget, axerai_voice_budget, brand_label, total_codes'

  const pageSize = 500
  let offset = 0
  const rows = []

  while (true) {
    const query = supabase
      .from(LEDGER_TABLE)
      .select(select)
      .eq('brand_slug', brandSlug)
      .order('code_no', { ascending: true })
      .order('role', { ascending: true })
      .range(offset, offset + pageSize - 1)

    const { data, error } = await Promise.race([
      query,
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Ledger fetch timeout (${LEDGER_TABLE})`)), 20000)
      }),
    ])

    if (error) {
      console.warn('[BrandDash] fetch failed:', error.message)
      throw error
    }

    const batch = data ?? []
    rows.push(...batch)
    if (batch.length < pageSize) break
    offset += pageSize
  }

  console.info(
    `[BrandDash] loaded ${rows.length} ledger rows (${new Set(rows.map((r) => r.verification_code)).size} codes)`,
  )
  return rows
}

export function getCodeThreads(threads, code) {
  return threads.filter((t) => t.verification_code === code)
}

function sumBrandUsage(threads = []) {
  let aiUsed = 0
  let voiceUsed = 0
  for (const thread of threads) {
    aiUsed += buildGeminiUsageAnalytics([thread]).totalTokens
    voiceUsed += buildElevenLabsUsageAnalytics([thread]).totalCharacters
  }
  return { aiUsed, voiceUsed }
}

const DEFAULT_PER_CODE_AI_CAP = 1_000_000
const DEFAULT_PER_CODE_VOICE_CAP = 15_000
const VOICE_NEAR_LIMIT_THRESHOLD = 300

function resolvePerCodeCaps(codeThreads = [], caps = {}) {
  const fromThread = codeThreads[0]
  return {
    aiBudget:
      Number(caps.aiBudget) ||
      Number(fromThread?.axerai_ai_budget) ||
      DEFAULT_PER_CODE_AI_CAP,
    voiceBudget:
      Number(caps.voiceBudget) ||
      Number(fromThread?.axerai_voice_budget) ||
      DEFAULT_PER_CODE_VOICE_CAP,
  }
}

/** Per-code AI + voice used vs DB-locked budget caps. */
export function buildPerCodeTokenStats(codeThreads = [], caps = {}) {
  const { aiBudget, voiceBudget } = resolvePerCodeCaps(codeThreads, caps)
  const aiUsed = buildGeminiUsageAnalytics(codeThreads).totalTokens
  const voiceUsed = buildElevenLabsUsageAnalytics(codeThreads).totalCharacters
  const aiRemaining = Math.max(0, aiBudget - aiUsed)
  const voiceRemaining = Math.max(0, voiceBudget - voiceUsed)
  const aiPct = aiBudget > 0 ? Math.min(100, Math.round((aiUsed / aiBudget) * 100)) : 0
  const voicePct = voiceBudget > 0 ? Math.min(100, Math.round((voiceUsed / voiceBudget) * 100)) : 0

  return {
    aiUsed,
    voiceUsed,
    aiBudget,
    voiceBudget,
    aiRemaining,
    voiceRemaining,
    aiPct,
    voicePct,
    nearVoiceLimit: voiceUsed > 0 && voiceRemaining > 0 && voiceRemaining <= VOICE_NEAR_LIMIT_THRESHOLD,
    voiceExhausted: voiceUsed > 0 && voiceRemaining <= 0,
  }
}

function collectGeminiEntriesWithCode(threads = []) {
  const entries = []
  for (const thread of threads) {
    for (const entry of parseGeminiUsageEntries(thread.axerai_ai_usage)) {
      entries.push({
        ...entry,
        code: thread.verification_code,
        threadRole: thread.role,
      })
    }
  }
  entries.sort((a, b) => Date.parse(b.at || '') - Date.parse(a.at || ''))
  return entries
}

function collectVoiceEntriesWithCode(threads = []) {
  const entries = []
  for (const thread of threads) {
    for (const entry of parseElevenLabsUsageEntries(thread.axerai_voice_usage)) {
      entries.push({
        ...entry,
        code: thread.verification_code,
        threadRole: thread.role,
      })
    }
  }
  entries.sort((a, b) => Date.parse(b.at || '') - Date.parse(a.at || ''))
  return entries
}

/** Brand-wide token log — call-type totals + recent ledger entries. */
export function buildBrandTokenLogAnalytics(threads = []) {
  const gemini = buildGeminiUsageAnalytics(threads)
  const voice = buildElevenLabsUsageAnalytics(threads)

  return {
    totalAiTokens: gemini.totalTokens,
    totalVoiceTokens: voice.totalCharacters,
    promptTokens: gemini.promptTokens,
    outputTokens: gemini.outputTokens,
    byCall: gemini.byCall,
    aiCallCount: gemini.callCount,
    voiceCallCount: voice.callCount,
    aiEntries: collectGeminiEntriesWithCode(threads).slice(0, 100),
    voiceEntries: collectVoiceEntriesWithCode(threads).slice(0, 50),
  }
}

function buildWallet(threads = [], brandAccount = null) {
  const usage = sumBrandUsage(threads)
  const aiBalance = Math.max(0, Number(brandAccount?.axerai_ai_balance) || 0)
  const voiceBalance = Math.max(0, Number(brandAccount?.axerai_voice_balance) || 0)
  return {
    aiUsed: usage.aiUsed,
    voiceUsed: usage.voiceUsed,
    aiBalance,
    voiceBalance,
    aiRemaining: Math.max(0, aiBalance - usage.aiUsed),
    voiceRemaining: Math.max(0, voiceBalance - usage.voiceUsed),
    accountMode: brandAccount?.account_mode ?? 'trial',
  }
}

function buildWalletFromSnapshot(walletSnapshot, brandAccount = null) {
  const mapped = walletSnapshotToDashboard(walletSnapshot)
  if (!mapped) return buildWallet([], brandAccount)
  return {
    ...mapped,
    accountMode: brandAccount?.account_mode ?? 'trial',
  }
}

export function buildBrandDashboardAnalytics(threads = [], brandAccount = null, walletSnapshot = null) {
  const walletCaps = walletSnapshot ? walletSnapshotToDashboard(walletSnapshot) : null
  const perCodeCaps = {
    aiBudget:
      walletCaps?.perCodeAiCap ||
      Number(brandAccount?.per_code_ai_budget) ||
      DEFAULT_PER_CODE_AI_CAP,
    voiceBudget:
      walletCaps?.perCodeVoiceCap ||
      Number(brandAccount?.per_code_voice_budget) ||
      DEFAULT_PER_CODE_VOICE_CAP,
  }

  const byCode = new Map()
  for (const thread of threads) {
    const code = thread.verification_code
    if (!code) continue
    if (!byCode.has(code)) byCode.set(code, [])
    byCode.get(code).push(thread)
  }

  const brandPraise = []
  const brandCriticism = []
  const brandDiscovery = []
  const brandPrompt = []
  const akxeraiPraise = []
  const akxeraiFeedback = []
  const codes = []

  let totalScans = 0
  let totalTalkTimeSeconds = 0
  let totalArViewSeconds = 0
  let totalVrViewSeconds = 0
  let totalOverviewViewSeconds = 0
  let scannedCodes = 0

  for (const [code, codeThreads] of byCode.entries()) {
    const analytics = buildDashboardAnalytics(codeThreads)
    totalScans += analytics.totalScans
    totalTalkTimeSeconds += analytics.totalTalkTimeSeconds
    totalArViewSeconds += analytics.totalArViewSeconds ?? 0
    totalVrViewSeconds += analytics.totalVrViewSeconds ?? 0
    totalOverviewViewSeconds += analytics.totalOverviewViewSeconds ?? 0

    const hasScan = codeThreads.some((t) => (t.scan_count ?? 0) > 0)
    if (hasScan) scannedCodes += 1

    for (const session of analytics.sessions) {
      const storyBody =
        typeof session.summary === 'string'
          ? session.summary.replace(/^summary:\s*/i, '').trim()
          : ''
      const summaryText = session.summary ?? storyBody
      const meta = {
        code,
        scanNumber: session.scanNumber,
        role: session.threadRole,
        location: session.location || '',
        durationSeconds: session.durationSeconds ?? 0,
      }

      const insights = session.sessionInsights
      if (sessionInsightsHasSignal(insights)) {
        for (const quote of insights.brandPraise) {
          if (!quote || isSummaryDump(quote)) continue
          brandPraise.push({ ...meta, quote: quote.slice(0, 220) })
        }
        for (const quote of insights.brandIssues) {
          if (!quote) continue
          brandCriticism.push({ ...meta, quote })
        }
        for (const quote of insights.akxeraiPraise) {
          if (!quote) continue
          akxeraiPraise.push({ ...meta, quote })
        }
        for (const row of insights.akxeraiIssues) {
          if (!row?.quote) continue
          akxeraiFeedback.push({
            ...meta,
            quote: row.quote,
            sentiment: 'negative',
            category: row.category || 'other',
          })
        }
      } else {
        const akxeraiFromSummary = parseAkxeraiPraiseFromSummary(summaryText)
        const brandPraiseParsed = parseBrandProductPraise(summaryText)
        const brandCriticismParsed = parseBrandProductCriticism(summaryText)
        const akxeraiFeedbackParsed = parseAkxeraiExperienceFeedback(summaryText)

        const brandPraiseQuote =
          session.brandPraiseQuote ||
          session.praiseQuote ||
          brandPraiseParsed.quote ||
          ''
        const brandCriticismQuote =
          session.brandCriticismQuote || brandCriticismParsed.quote || ''
        const akxeraiPraiseQuote = session.akxeraiPraiseQuote || akxeraiFromSummary.quote || ''

        if (brandPraiseQuote && !isSummaryDump(brandPraiseQuote)) {
          brandPraise.push({ ...meta, quote: brandPraiseQuote.slice(0, 220) })
        }
        if (brandCriticismQuote) {
          brandCriticism.push({ ...meta, quote: brandCriticismQuote })
        }
        if (akxeraiPraiseQuote) {
          akxeraiPraise.push({ ...meta, quote: akxeraiPraiseQuote })
        }
        if (akxeraiFeedbackParsed.detected) {
          akxeraiFeedback.push({
            ...meta,
            quote: akxeraiFeedbackParsed.quote,
            sentiment: akxeraiFeedbackParsed.sentiment,
            category: akxeraiFeedbackParsed.category,
          })
        }
      }

      const discoveryParsed = parseDiscoveryFromSummary(summaryText)
      const discoveryQuote = session.discoveryQuote || discoveryParsed.quote || ''
      if (discoveryQuote) {
        brandDiscovery.push({
          code,
          scanNumber: session.scanNumber,
          role: session.threadRole,
          quote: discoveryQuote,
          location: session.location || '',
        })
      }

      for (const quote of parseMyraBrandLinesFromSummary(summaryText)) {
        brandPrompt.push({
          code,
          scanNumber: session.scanNumber,
          role: session.threadRole,
          quote,
        })
      }
    }

    const codeAkxerai = akxeraiFeedback.filter((f) => f.code === code)
    const akxeraiPositive = codeAkxerai.filter((f) => f.sentiment === 'positive').length + akxeraiPraise.filter((f) => f.code === code).length
    const akxeraiNegative = codeAkxerai.filter((f) => f.sentiment === 'negative').length

    const tokenStats = buildPerCodeTokenStats(codeThreads, perCodeCaps)

    codes.push({
      code,
      codeNo: codeThreads[0]?.code_no ?? 0,
      threads: codeThreads,
      sessions: analytics.sessions.map((session) => ({
        ...session,
        verificationCode: code,
        code,
      })),
      totalScans: analytics.totalScans,
      totalTalkTimeSeconds: analytics.totalTalkTimeSeconds,
      brandPraiseCount: analytics.positiveCount,
      akxeraiPraiseCount: analytics.akxeraiPraiseCount,
      lastScanDate: analytics.lastScanDate,
      hasScan,
      senderScans: codeThreads.find((t) => t.role === 'sender')?.scan_count ?? 0,
      receiverScans: codeThreads.find((t) => t.role === 'receiver')?.scan_count ?? 0,
      latestBrandQuote: brandPraise.filter((f) => f.code === code).at(-1)?.quote ?? '',
      latestDiscoveryQuote: brandDiscovery.filter((f) => f.code === code).at(-1)?.quote ?? '',
      akxeraiFeedbackCount: codeAkxerai.length,
      akxeraiPositive,
      akxeraiNegative,
      arViewSeconds: analytics.totalArViewSeconds ?? 0,
      vrViewSeconds: analytics.totalVrViewSeconds ?? 0,
      overviewViewSeconds: analytics.totalOverviewViewSeconds ?? 0,
      location: brandDiscovery.filter((f) => f.code === code).at(-1)?.location || '',
      ...tokenStats,
    })
  }

  codes.sort((a, b) => {
    if (a.codeNo !== b.codeNo) return a.codeNo - b.codeNo
    return a.code.localeCompare(b.code)
  })

  const totalCodes =
    Number(brandAccount?.codes_allocated) ||
    Number(threads.find((t) => t.total_codes)?.total_codes) ||
    codes.length
  const scanRatePct = totalCodes > 0 ? Math.round((scannedCodes / totalCodes) * 100) : 0
  const wallet = walletSnapshot
    ? buildWalletFromSnapshot(walletSnapshot, brandAccount)
    : buildWallet(threads, brandAccount)

  const tokenLog = buildBrandTokenLogAnalytics(threads)
  const productRows = codes
  const allSessions = codes.flatMap((row) => row.sessions ?? [])
  const ageCategoryAnalytics = buildAgeCategoryAnalytics(allSessions)
  const avgTalkTimePerScannedCodeSeconds =
    scannedCodes > 0 ? Math.round(totalTalkTimeSeconds / scannedCodes) : 0

  const brandPraiseDeduped = dedupeQuoteFeedbacks(brandPraise)
  const brandCriticismDeduped = dedupeQuoteFeedbacks(brandCriticism)
  const akxeraiPraiseDeduped = dedupeQuoteFeedbacks(akxeraiPraise)
  const akxeraiFeedbackDeduped = dedupeQuoteFeedbacks(akxeraiFeedback)
  const brandPromptDeduped = dedupeQuoteFeedbacks(brandPrompt)

  return {
    codes,
    totalCodes,
    scannedCodes,
    scanRatePct,
    totalScans,
    totalTalkTimeSeconds,
    avgTalkTimePerScannedCodeSeconds,
    totalArViewSeconds,
    totalVrViewSeconds,
    totalOverviewViewSeconds,
    brandPraise: brandPraiseDeduped,
    brandCriticism: brandCriticismDeduped,
    brandDiscovery,
    brandPrompt: brandPromptDeduped,
    akxeraiPraise: akxeraiPraiseDeduped,
    akxeraiFeedback: akxeraiFeedbackDeduped,
    brandPraiseQuotes: brandPraiseDeduped.map(({ code, scanNumber, role, quote }) => ({
      code,
      scanNumber,
      role,
      quote,
    })),
    akxeraiPraiseQuotes: akxeraiPraiseDeduped.map(({ code, scanNumber, role, quote }) => ({
      code,
      scanNumber,
      role,
      quote,
    })),
    akxeraiPraiseCount: akxeraiPraiseDeduped.length,
    wallet,
    tokenLog,
    perCodeCaps,
    codesNearVoiceLimit: productRows.filter((row) => row.nearVoiceLimit).length,
    codesVoiceExhausted: productRows.filter((row) => row.voiceExhausted).length,
    ageCategoryAnalytics,
  }
}

export function codeStatusLabel(row) {
  if (!row?.hasScan) return 'Idle'
  if (row.senderScans > 0 && row.receiverScans > 0) return 'Active'
  return 'In use'
}

function pilotCodes(codes = []) {
  return codes
}

/** @deprecated Use pilotCodes — all ledger codes incl. HOJ-RICHER test (code_no 0). */
function productCodes(codes = []) {
  return pilotCodes(codes)
}

function sessionHadUserSpeech(session) {
  const userSaid = String(session?.userSaid ?? '').trim()
  if (!userSaid || userSaid === '—') return false
  return userSaid.length > 2
}

function codeHadUserTalk(codeEntry) {
  return (codeEntry?.sessions ?? []).some(sessionHadUserSpeech)
}

/** Akxerai platform tab — activation, pairing, tech sentiment (count boxes). */
export function buildAkxeraiPlatformStats(brand = {}) {
  const products = pilotCodes(brand.codes ?? [])
  const totalProductCodes = products.length || Number(brand.totalCodes ?? 0)
  const scannedCodes = products.filter((row) => row.hasScan).length
  const codesRemaining = Math.max(0, totalProductCodes - scannedCodes)

  const bothScanned = products.filter(
    (row) => row.senderScans > 0 && row.receiverScans > 0,
  ).length
  const senderOnlyScanned = products.filter(
    (row) => row.senderScans > 0 && row.receiverScans === 0,
  ).length
  const receiverOnlyScanned = products.filter(
    (row) => row.senderScans === 0 && row.receiverScans > 0,
  ).length
  const scannedNoTalk = products.filter((row) => row.hasScan && !codeHadUserTalk(row)).length
  const scannedWithTalk = products.filter((row) => row.hasScan && codeHadUserTalk(row)).length

  const akxeraiFeedback = brand.akxeraiFeedback ?? []
  const akxeraiPositive =
    (brand.akxeraiPraise?.length ?? 0) +
    akxeraiFeedback.filter((row) => row.sentiment === 'positive').length
  const akxeraiNegative = akxeraiFeedback.filter((row) => row.sentiment === 'negative').length

  const codesWithAkxeraiPositive = new Set([
    ...(brand.akxeraiPraise ?? []).map((row) => row.code),
    ...akxeraiFeedback.filter((row) => row.sentiment === 'positive').map((row) => row.code),
  ]).size
  const codesWithAkxeraiNegative = new Set(
    akxeraiFeedback.filter((row) => row.sentiment === 'negative').map((row) => row.code),
  ).size

  return {
    totalProductCodes,
    scannedCodes,
    codesRemaining,
    scanRatePct: totalProductCodes > 0 ? Math.round((scannedCodes / totalProductCodes) * 100) : 0,
    bothScanned,
    senderOnlyScanned,
    receiverOnlyScanned,
    scannedNoTalk,
    scannedWithTalk,
    akxeraiPositive,
    akxeraiNegative,
    codesWithAkxeraiPositive,
    codesWithAkxeraiNegative,
    totalScans: brand.totalScans ?? 0,
    totalTalkTimeSeconds: brand.totalTalkTimeSeconds ?? 0,
    totalArViewSeconds: brand.totalArViewSeconds ?? 0,
    totalVrViewSeconds: brand.totalVrViewSeconds ?? 0,
    totalOverviewViewSeconds: brand.totalOverviewViewSeconds ?? 0,
    tokenLog: brand.tokenLog ?? buildBrandTokenLogAnalytics([]),
    codesNearVoiceLimit: brand.codesNearVoiceLimit ?? 0,
    codesVoiceExhausted: brand.codesVoiceExhausted ?? 0,
    perCodeCaps: brand.perCodeCaps ?? {},
  }
}

/** Brand intelligence tab — shop/product/discovery from chat (count boxes). */
export function buildBrandIntelligenceStats(brand = {}) {
  const products = pilotCodes(brand.codes ?? [])
  const brandPraise = brand.brandPraise ?? []
  const brandCriticism = brand.brandCriticism ?? []
  const brandDiscovery = brand.brandDiscovery ?? []

  const codesWithPraise = new Set(brandPraise.map((row) => row.code)).size
  const codesWithDiscovery = new Set(brandDiscovery.map((row) => row.code)).size
  const codesWithComplaint = new Set(brandCriticism.map((row) => row.code)).size
  const codesWithAnyBrandSignal = new Set([
    ...brandPraise.map((row) => row.code),
    ...brandDiscovery.map((row) => row.code),
    ...brandCriticism.map((row) => row.code),
  ]).size

  const scannedProducts = products.filter((row) => row.hasScan).length
  const scannedNoBrandChat = products.filter(
    (row) => row.hasScan && !codeHadUserTalk(row),
  ).length

  return {
    totalProductCodes: products.length || Number(brand.totalCodes ?? 0),
    scannedProducts,
    brandPraiseCount: brandPraise.length,
    brandCriticismCount: brandCriticism.length,
    discoveryCount: brandDiscovery.length,
    codesWithPraise,
    codesWithDiscovery,
    codesWithComplaint,
    codesWithAnyBrandSignal,
    scannedNoBrandChat,
    totalTalkTimeSeconds: brand.totalTalkTimeSeconds ?? 0,
    recentPraise: brandPraise.slice(-5).reverse(),
    recentDiscovery: brandDiscovery.slice(-5).reverse(),
  }
}
