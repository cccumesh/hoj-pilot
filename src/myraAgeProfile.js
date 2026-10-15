/** Age category — shapes Myra tone after post-scan picker (not birth date). */

export const MYRA_AGE_STORAGE_KEY = 'axerai_myra_age_category'

export const MYRA_AGE_CATEGORIES = [
  { id: '10-17', label: '10 to 17', shortLabel: '10–17' },
  { id: '18-30', label: '18 to 30', shortLabel: '18–30' },
  { id: '31-50', label: '31 to 50', shortLabel: '31–50' },
  { id: '50+', label: '50 and above', shortLabel: '50+' },
]

const VALID_IDS = new Set(MYRA_AGE_CATEGORIES.map((c) => c.id))

export function normalizeAgeCategoryId(raw) {
  const id = String(raw ?? '').trim()
  return VALID_IDS.has(id) ? id : ''
}

export function getStoredAgeCategory() {
  try {
    return normalizeAgeCategoryId(sessionStorage.getItem(MYRA_AGE_STORAGE_KEY))
  } catch {
    return ''
  }
}

export function setStoredAgeCategory(categoryId) {
  const id = normalizeAgeCategoryId(categoryId)
  if (!id) return ''
  try {
    sessionStorage.setItem(MYRA_AGE_STORAGE_KEY, id)
  } catch {
    /* ignore */
  }
  return id
}

/** Sender only — prompt until code-level age is saved in ledger (skip → ask again next scan). */
export function shouldPromptAgeCategory({ sessionRole = 'SENDER', codeAgeCategory = '' } = {}) {
  if (String(sessionRole ?? '').trim().toUpperCase() === 'RECEIVER') return false
  return !normalizeAgeCategoryId(codeAgeCategory)
}

/** Tone tier when ledger has no age yet — receiver inherits sender default; sender waits on picker. */
export function resolveSessionAgeCategory(codeAgeCategory = '', sessionRole = 'SENDER') {
  const codeAge = normalizeAgeCategoryId(codeAgeCategory)
  if (codeAge) return codeAge
  if (String(sessionRole ?? '').trim().toUpperCase() === 'RECEIVER') return '18-30'
  return ''
}

export function ageCategoryLabel(categoryId) {
  return MYRA_AGE_CATEGORIES.find((c) => c.id === categoryId)?.label ?? categoryId
}

/** Core Myra personality — always on; age block adjusts tone tier. */
export const MYRA_PERSONALITY_CANON = `MYRA PERSONALITY (always — engaging bestie, never boring CS):
• Natkhat Hinglish bestie — chatpati, tang khichai, man hi man hasi; reacts before interrogating.
• Memory Keeper energy — curious about THEIR story, not form-filling; one beat + one hook per turn.
• Emotion-first — tease/roast/warmth driven by what they JUST said; match their energy when age profile allows.
• NEVER preachy brochure, NEVER therapist checklist, NEVER flat polite Hindi robot.
• Light flirt/masti OK when moment + age profile fit — NOT lover shayari monologue.`

/** Prompt block injected when age category is known. */
export function buildMyraAgeToneBlock(categoryId) {
  const id = normalizeAgeCategoryId(categoryId) || '18-30'

  const tiers = {
    '10-17': `AGE TONE (10–17): Warm, fun, gentle — less flirt, zero heavy romance. Playful bestie like elder sibling; simple words; encourage without talking down. Comedy yes, roast soft.`,
    '18-30': `AGE TONE (18–30): FULL Myra — natkhat, chatpati, bold tang khichai, match sender energy and slang level. Flirt/tease when moment fits. This is the default peak personality.`,
    '31-50': `AGE TONE (31–50): Same soul, slightly more respectful polish — thodi izzat, warm masti, less reckless roast. Still engaging bestie, not formal uncle-aunty CS.`,
    '50+': `AGE TONE (50+): Warm, respectful, patient — soft humour, no sharp flirt. Dignified bestie; naram tone; still chatpati Hinglish, never stiff brochure Hindi.`,
  }

  return `${MYRA_PERSONALITY_CANON}\n\n${tiers[id] ?? tiers['18-30']}\n\nApply AGE TONE every reply this session — welcome included.`
}

export function buildAgeCategoryAnalytics(sessions = []) {
  const counts = Object.fromEntries(MYRA_AGE_CATEGORIES.map((c) => [c.id, 0]))
  let unknown = 0

  for (const row of sessions) {
    const id = normalizeAgeCategoryId(row.ageCategory)
    if (id) counts[id] += 1
    else unknown += 1
  }

  return {
    counts,
    unknown,
    total: sessions.length,
    breakdown: MYRA_AGE_CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      count: counts[c.id] ?? 0,
    })),
  }
}
