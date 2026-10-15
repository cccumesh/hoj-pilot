import { getHojBrandKnowledgeSections } from './hojBrandKnowledge.js'

const MAX_BRAND_SEARCH_CHARS = 8000

function trimBrandSearchBlock(text) {
  const t = String(text ?? '').trim()
  if (t.length <= MAX_BRAND_SEARCH_CHARS) return t
  return `${t.slice(0, MAX_BRAND_SEARCH_CHARS)}\n...(brand search truncated — answer from visible sections only)`
}

export function buildBrandSearchBlock(intent = 'overview') {
  const sections = getHojBrandKnowledgeSections(intent)

  return trimBrandSearchBlock(
    [
      'BRAND KNOWLEDGE REFERENCE (House of Jewels — live Myra reads USER_JUST_SAID and uses ONLY what this turn needs):',
      'HOUSE OF JEWELS DEEP REFERENCE (truth for this turn — storyteller bestie voice, not Wikipedia dump):',
      sections,
      'USE RULE: You decide from USER_JUST_SAID whether brand depth is needed. If they ask shop/brand/keepsake/showroom/trust — answer from sections above in natkhat Hinglish. If they are mid love-story collect — ignore this block. Never invent facts not listed. Never read sections as bullet list.',
    ].join('\n\n'),
  )
}

/** Deep HOJ reference for live chat — no regex intent gate; Myra picks from USER_JUST_SAID. */
export function buildBrandDeepSearchForPrompt(userText) {
  if (!String(userText ?? '').trim()) return ''
  return buildBrandSearchBlock('overview')
}
