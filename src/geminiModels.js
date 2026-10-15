/** Shared Gemini model routing — one API key, task-specific chains with retry/fallback. */

export const GEMINI_LITE_PRIMARY = 'gemini-3.5-flash-lite'
export const GEMINI_LITE_FALLBACK = 'gemini-3.1-flash-lite'
export const GEMINI_FLASH_PRIMARY = 'gemini-3.6-flash'

/** Summary / story Flash — retry 503/overload before lite fallback (Netlify gemini.mjs matches). */
export const GEMINI_RETRIES_FULL_FLASH = 3
export const GEMINI_RETRIES_LITE = 2

export function geminiRetriesForModel(modelName) {
  if (String(modelName ?? '').trim() === GEMINI_FLASH_PRIMARY) {
    return GEMINI_RETRIES_FULL_FLASH
  }
  return GEMINI_RETRIES_LITE
}

/** Lite chain — verify, post-verify opening, sender chat, receiver fallback. */
export const GEMINI_LITE_CHAIN = [GEMINI_LITE_PRIMARY, GEMINI_LITE_FALLBACK]

/** Session end summary — sender OR receiver — always 3.6 Flash first → lite fallback. */
export const SUMMARY_MODEL_CHAIN = [GEMINI_FLASH_PRIMARY, ...GEMINI_LITE_CHAIN]

/** Every scan after verify — scan 1, 2, 3… sender OR receiver welcome/resume opening. */
export const OPENING_AFTER_VERIFY_MODEL_CHAIN = GEMINI_LITE_CHAIN

export const VERIFY_MODEL_CHAIN = GEMINI_LITE_CHAIN
export const WELCOME_MODEL_CHAIN = OPENING_AFTER_VERIFY_MODEL_CHAIN
export const SENDER_CHAT_MODEL_CHAIN = GEMINI_LITE_CHAIN

/** Receiver mid-chat (turn 2+ after opening) — lite for speed (same as sender). */
export const RECEIVER_CHAT_MODEL_CHAIN = GEMINI_LITE_CHAIN

/** Screen reel / social story — Flash first for richer monologue, then lite fallback. */
export const MYRA_SOCIAL_STORY_MODEL_CHAIN = [GEMINI_FLASH_PRIMARY, ...GEMINI_LITE_CHAIN]

export const SOCIAL_STORY_MAX_OUTPUT_TOKENS = 920

/** @deprecated aliases */
export const GEMINI_CHAT_PRIMARY = GEMINI_LITE_PRIMARY
export const GEMINI_CHAT_FALLBACK = GEMINI_LITE_FALLBACK
export const MYRA_CHAT_LITE_CHAIN = GEMINI_LITE_CHAIN
export const MYRA_CHAT_FLASH_CHAIN = RECEIVER_CHAT_MODEL_CHAIN

export const MYRA_FLASH_GENERATION = { temperature: 0.95, topP: 0.95, topK: 40 }
export const MYRA_LITE_GENERATION = { temperature: 0.85, topP: 0.88, topK: 32 }

export function myraGenerationConfig(tier = 'lite') {
  return tier === 'flash' ? MYRA_FLASH_GENERATION : MYRA_LITE_GENERATION
}

export const RECEIVER_TURN_SHORT = 'short'
export const RECEIVER_TURN_NORMAL = 'normal'
export const RECEIVER_TURN_DEEP = 'deep'

const SHORT_ACK_PATTERN =
  /^(ha+h?a?|haan|han|ji+h?|yes|yep|yeah|yup|no|na+h?i?|nope|nah|ok(ay)?|k+|hmm+|hm+|achha|accha|theek|thik|sahi|ya+|arre|oye|hii+|hi+|hello|bye|thanks|thank you)$/i

export function classifyReceiverTurnBucket(userText = '') {
  const text = String(userText ?? '').trim()
  if (!text) return RECEIVER_TURN_SHORT

  const words = text.split(/\s+/).filter(Boolean)
  const wordCount = words.length
  const normalized = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (wordCount <= 4) {
    if (SHORT_ACK_PATTERN.test(normalized)) return RECEIVER_TURN_SHORT
    if (wordCount <= 2 && text.length <= 22) return RECEIVER_TURN_SHORT
    if (/^(ha+\s*(na|nahi)?|na+\s*(hi)?|nahi+\s*(yaar|re)?)$/i.test(normalized)) {
      return RECEIVER_TURN_SHORT
    }
  }

  const deepByLength = wordCount >= 26
  const deepByIntent =
    /aur bata|detail me|poori kahani|suna(oo)? mujhe|samjha(o)?|matlab kya|kyu |kyon |please|ro rahi|ro raha|bahut|itna sab/i.test(
      text,
    )
  if (deepByLength || deepByIntent || (wordCount >= 14 && text.includes('?'))) {
    return RECEIVER_TURN_DEEP
  }

  return RECEIVER_TURN_NORMAL
}

const RECEIVER_MAX_OUTPUT_TOKENS = {
  [RECEIVER_TURN_SHORT]: 130,
  [RECEIVER_TURN_NORMAL]: 380,
  [RECEIVER_TURN_DEEP]: 650,
}

export function myraChatGenerationConfig(tier = 'lite', { receiverTurnBucket, socialStoryMode } = {}) {
  if (socialStoryMode) {
    return {
      ...myraGenerationConfig('flash'),
      maxOutputTokens: SOCIAL_STORY_MAX_OUTPUT_TOKENS,
    }
  }
  const base = myraGenerationConfig(tier)
  const bucket = String(receiverTurnBucket ?? '').trim()
  const cap = RECEIVER_MAX_OUTPUT_TOKENS[bucket]
  if (!cap) return base
  return { ...base, maxOutputTokens: cap }
}

/**
 * Chat model pick:
 * - isOpeningAfterVerify → lite always (sender/receiver, scan 1 or return scan N)
 * - sender mid-chat → lite only
 * - receiver mid-chat → lite always; bucket drives LENGTH hint + token cap only
 */
export function resolveMyraChatModels({
  sessionRole = '',
  isWelcome = false,
  isOpeningAfterVerify = false,
  userText = '',
  screenRecordingForStory = false,
} = {}) {
  const role = String(sessionRole ?? '')
    .trim()
    .toUpperCase()

  if (screenRecordingForStory) {
    return {
      models: MYRA_SOCIAL_STORY_MODEL_CHAIN,
      tier: 'flash',
      reason: 'social-story-flash',
      socialStoryMode: true,
    }
  }

  if (isOpeningAfterVerify || isWelcome) {
    return {
      models: OPENING_AFTER_VERIFY_MODEL_CHAIN,
      tier: 'lite',
      reason: 'opening-after-verify-lite',
    }
  }

  if (role === 'SENDER') {
    return {
      models: SENDER_CHAT_MODEL_CHAIN,
      tier: 'lite',
      reason: 'sender-lite',
    }
  }

  if (role === 'RECEIVER') {
    const bucket = classifyReceiverTurnBucket(userText)
    const reason =
      bucket === RECEIVER_TURN_SHORT
        ? 'receiver-short-lite'
        : bucket === RECEIVER_TURN_DEEP
          ? 'receiver-deep-lite'
          : 'receiver-lite'
    return {
      models: RECEIVER_CHAT_MODEL_CHAIN,
      tier: 'lite',
      reason,
      receiverTurnBucket: bucket,
    }
  }

  return {
    models: GEMINI_LITE_CHAIN,
    tier: 'lite',
    reason: 'lite-default',
  }
}
