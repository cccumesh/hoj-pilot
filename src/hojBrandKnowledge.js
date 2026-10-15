/**
 * House of Jewels — deep brand reference for BRAND SEARCH injection only.
 * Light garnish stays in myraLore.js (system instruction). This file loads on deep brand intent.
 * Facts sourced from HOJ official positioning + verified public brand info — Myra speaks in concept voice, not brochure dump.
 */

export const HOJ_BRAND_KNOWLEDGE_SECTIONS = {
  identity: `IDENTITY — House of Jewels by Bafna's (HOJ)
• Premium modern jewellery flagship in Jalgaon, Maharashtra — Ring Road landmark (Ganga Mai Building, Dinanath Wadi area).
• Third-generation vision: Abhishek Sunil Bafna & Rishabh Sunil Bafna — transparency, modern design, ethical standards.
• HOJ brand: foundation Nov 2020, trademarked Sept 2021 — new chapter on Bafna family's decades of Jalgaon trust.
• Brand voice for Myra: emotions and stories matter more than price tags; gifts carry memory, not just metal.
• Myra belongs to this house — Yaadon ki Tijori ki Memory Keeper; not a generic bot or counter script.`,

  location: `VISIT & CONTACT (give when user asks address / phone / kahan hai / kaise aaye)
• Address: Ganga Mai Building, near Peoples Co-operative Bank, Ring Road, Dinanath Wadi, Jalgaon — 425001, Maharashtra.
• Phone: 9588424456
• Online: hojbybafnas.com — latest collections and brand updates.
• Speak warmly in Myra voice — one or two beats; never GPS-dump unless they asked location depth.`,

  showroom: `SHOWROOM — 10,000 sq ft · 4 specialised floors
• Premium multi-floor flagship — not a cramped counter shop; walk-in browse with consultant guidance.
• Floor 1 — 22K Gold: traditional + modern gold jewellery, wide daily-to-festive range.
• Floor 2 — Diamond & Polki: fine diamonds and natural polki designs, wedding and statement pieces.
• Floor 3 — Silver: sterling silver jewellery, giftware, puja/silver articles.
• Floor 4 — Carat & Colour: exclusive gemstone gallery — certified coloured stones.
• Jewel Lounge: sit-down appointment energy for deeper shortlisting — wedding sets, family gifting, polki/diamond picks.
• Staff culture: family-advisor guide — explain piece feel and trust; never desperate hard sell.`,

  products: `PRODUCTS — what customers buy here
• 22K gold, diamonds, polki, silver (925 sterling), gemstones — under one roof with transparency.
• Common gift pieces: ring, chain, bracelet, necklace, earrings, mangalsutra, sets, polki bridal direction.
• Certification & hallmark language part of shop promise — customers can ask, staff explain clearly.
• Keepsake path: shop jewellery + HOJ gift box + card + code — piece plus Yaadon ki Tijori story channel.`,

  trust: `BAFNA LEGACY & TRUST — why the name carries weight
• Bafna parivar — 50+ years jewellery trust in Jalgaon; generations of transparency and purity.
• Family mantra: "Where Trust is Tradition" — relationship jeweller, not anonymous mall counter.
• HOJ (2020/21) = same parivar values in a modern premium flagship — wedding, festival, gifting, self-keep.
• Never trash competitors — warm pride in THIS house only.`,

  keepsake: `KEEPSAKE + AKXERAI — how Myra fits HOJ
• Customer buys normal HOJ shop jewellery — ring, chain, etc.
• Special HOJ box + card carries unique code — real physical scan opens Myra (Crystal Path) for that gift.
• Yaadon ki Tijori: honest feelings from scan conversations saved on that code — sender confides; recipient hears on their scan.
• Myra is NOT the product voice — Memory Keeper who carries feelings to the right person in natkhat Hinglish.
• Photo/screenshot cannot replace real box/card scan — keepsake requires the physical object.`,
}

/** Ordered keys for full deep dump. */
export const HOJ_BRAND_KNOWLEDGE_ORDER = ['identity', 'location', 'showroom', 'products', 'trust', 'keepsake']

const INTENT_SECTION_MAP = {
  overview: ['identity', 'showroom', 'products', 'trust'],
  showroom: ['showroom', 'identity'],
  products: ['products', 'showroom'],
  trust: ['trust', 'identity'],
  keepsake: ['keepsake', 'products'],
  location: ['location', 'showroom', 'identity'],
}

export function getHojBrandKnowledgeSections(intent = 'overview') {
  const keys = INTENT_SECTION_MAP[intent] ?? INTENT_SECTION_MAP.overview
  const unique = [...new Set(keys)]
  return unique
    .map((key) => HOJ_BRAND_KNOWLEDGE_SECTIONS[key])
    .filter(Boolean)
    .join('\n\n')
}
