function p(html) {
  return { type: 'p', html }
}
function pull(html) {
  return { type: 'pull', html }
}
function h2(text) {
  return { type: 'h2', text }
}
function diagram(title, flow) {
  return { type: 'diagram', title, flow }
}
function label(text, kind = '') {
  return { type: 'label', text, kind }
}

export const chaptersPart3 = [
  {
    part: 'VI',
    title: 'House of Jewels — why this launchpad',
    blocks: [
      label('Pilot brand · Jalgaon · Backend doc', 'pilot'),
      p('House of Jewels by Bafna — premium multi-floor jewellery in Jalgaon, documented in brand knowledge modules: trust legacy, gifting intensity, showroom experience. Pilot uses <code>HOJ-RICHER</code> Richera test card and <code>HOJ-XXXXXX</code> serialized codes. AKXERAI remains platform; HOJ is launchpad, not company identity.'),
      p('Pilot scope in Foundation: ~10–15 days validation window, ~200 uniquely identified products in planning narrative, real customers, no paid traffic inflation — value proof over scale proof.'),
    ],
  },
  {
    part: 'VI',
    title: 'The pilot story — without inventing history',
    blocks: [
      label('What sources support vs do not', 'pilot'),
      p('Supported: engineering ready for deploy; ledger seeded; verify pipeline; persona prompts; dashboard; intended learning questions (scan behaviour, conversation quality, brand perception, technical stability).'),
      p('Not supported in provided PDFs as completed fact: named customer dialogues, exact scan counts achieved, revenue closed, national brand signatures. Write emotional beats only where grounded — e.g. the founder meaning of “a scan appeared on the dashboard” as <em>class of event</em> when it occurs, not fabricated numbers.'),
      pull('When a real unit connects to a real person, the idea leaves the document. That moment is what pilots exist to produce — once, honestly.'),
    ],
  },
  {
    part: 'VI',
    title: 'What the pilot must prove',
    blocks: [
      p('Foundation failure criteria listed explicitly: customers do not scan; immediate exit; meaningless engagement; repeated technical breaks; brand owner sees no value; no interest in future deployment. Success: voluntary time spent, memorable experience, brand story communicated, owner sees differentiation, structured report delivered (customer insights, brand insights, technical report, business recommendation).'),
    ],
  },
  {
    part: 'VI',
    title: 'Failures and edge cases',
    blocks: [
      label('Book 1 narrative lessons · apply as design discipline', 'scenario'),
      p('Infrastructure is built by surviving edge cases: wrong code batches, operational mismatches between print and ledger, voice quality iterations, verification spoof attempts, enterprise ownership conflicts (logo vs door), hiring misfires. Earlier draft chapters listed these as company-building lessons — use as risk categories, not as claims that each already happened in HOJ pilot unless documented.'),
      p('Backend documents verify fail reasons: PHOTO_SPOOF, NO_CODE / brand fail, NOT_REGISTERED, EXHAUSTED budget — user-facing lock messaging.'),
    ],
  },
  {
    part: 'VII',
    title: 'Trust, privacy, and what we refuse',
    blocks: [
      p('Provisional specification background cites privacy risks of shipping raw biometric/environment data; AKXERAI materials emphasize trust, anti-spoof, and brand-bound memory — not surveillance of gifts for unrelated ads. Product philosophy: two-seat gifting mode as privacy manners; refuse third phone in pilot config; do not become generic social graph.'),
      p('Company refusal list (synthesis from sources + founder direction): not surveillance infrastructure, not fake viral staging, not discounting price to pass-through cost, not letting enterprise strip “Powered by AKXERAI” while taking the ledger.'),
    ],
  },
  {
    part: 'VII',
    title: 'Brand vs AKXERAI — ownership',
    blocks: [
      diagram('Ownership split (Blueprint + Brand Journey)', `BRAND: product, persona, voice direction, story, rules, relationship policy

AKXERAI: verify, identity, orchestration, ledger, metering, analytics infra, WebAR shell`),
      p('Custom development called out separately in Brand Journey: custom 3D, founder avatar, premium animation, CRM — chargeable; core platform remains scalable SKU.'),
    ],
  },
  {
    part: 'VII',
    title: 'Building the team — phased',
    blocks: [
      label('Future org · Book 1 hiring table as scenario', 'scenario'),
      p('Hire after proof: brand lead, persona/voice director, product engineer, then trust engineer, finance, content, platform heads as renewals and categories arrive. Pay best people properly at mid-size; early equity bounded after data reduces risk. Exact headcount not claimed for 2026.'),
    ],
  },
  {
    part: 'VIII',
    title: 'Self-serve platform and categories',
    blocks: [
      label('Blueprint roadmap · future vision', 'future'),
      p('Future brand dashboard onboarding described: register products, upload targets, create/select personas, configure voice, generate codes, monitor analytics — self-managed workflow. Initial market strategy (Foundation): premium jewellery, gifting, luxury lifestyle, perfume, watches, cosmetics — then broader consumer categories.'),
    ],
  },
  {
    part: 'VIII',
    title: 'Owned voice and scale economics',
    blocks: [
      label('Economics Playbook §05–06', 'scenario'),
      p('Cloud voice proves UX; owned GPU TTS (~₹50k/mo ~200M chars capacity in doc) targets ~5× lower platform cost at standard slot. Ten-brand illustrative scenario ~4.3M scans/year ~₹1.5 Cr platform cost at owned blend vs crores at cloud — labeled illustrative, not partnerships confirmed.'),
      p('GPU planning table: monthly scans drive GPU count; lighter session mix reduces worst-case fleet size materially.'),
    ],
  },
  {
    part: 'VIII',
    title: '2026–2031 timeline — scenarios only',
    blocks: [
      label('Future vision · not accomplished fact', 'future'),
      p('Synthesis allowed from Blueprint roadmap + earlier book draft: 2026 MVP/pilot proof → 2027 second brands / ops learning → 2028 owned voice slices → 2029 enterprise governance demands → 2030 multi-category / international beginnings → 2031 platform infrastructure standard thesis. Each year is a planning narrative unless a source documents an achieved milestone.'),
      p('Valuation scenarios (if modeled): e.g. revenue scale with 12–20× multiple — always <strong>SCENARIO</strong>, never promise. Billion-dollar language is investor framing for possible scale, not balance-sheet fact in October 2026 sources.'),
    ],
  },
  {
    part: 'IX',
    title: 'Feature → product → platform → infrastructure → standard',
    blocks: [
      diagram('Staircase (Platform Blueprint closing themes)', `FEATURE — "That box has a character"
PRODUCT — "Deploy AKXERAI on a SKU"
PLATFORM — "Many brands, same playbook"
INFRASTRUCTURE — "Millions of units on the meter"
STANDARD — "Box feels wrong without a life"`),
      p('Standard thesis: if AKXERAI repeatedly solves identity + authentication + persona + memory + economics across categories, the market may treat powered-by as expected packaging layer — the founder line: <em>is par AKXERAI hona chahiye tha</em>.'),
    ],
  },
  {
    part: 'IX',
    title: 'The logo was the temptation. The door was the asset.',
    blocks: [
      pull('The visible persona is what the customer sees. The deeper asset is identity, verification, ledger, memory, trust, and economic infrastructure.'),
      p('Use once, precisely: enterprise may tempt with logo-only deals that strip platform attribution or ledger ownership. The documented response pattern: keep the door — fusion gate, metering, powered-by, data boundaries.'),
    ],
  },
  {
    part: 'IX',
    title: 'The billion is not the point',
    blocks: [
      p('If financial scenarios appear (e.g. ~₹500 crore revenue modeling at scale with margin on packages), they illustrate what <em>could</em> fund a high multiple — not the purpose of founding. Purpose in sources: connected packaging ecosystem, post-purchase relationship, measurable product-level engagement.'),
    ],
  },
  {
    part: 'IX',
    title: 'Objects that remember — closing',
    blocks: [
      p('Emotional progression for the reader: someone had an idea → built a working loop → touched real world through a launchpad pilot → saw that physical and digital can meet on the unit → asked whether thousands, then millions, could run on the same door → asked whether that door could become infrastructure → imagined a standard.'),
      p('AKXERAI — Products receive digital life. Confidential · rebuilt master book · source PDF set · October 2026.'),
      p('The reader should leave thinking: Chetan is building a new digital layer for physical products — and that layer might become infrastructure if proof, economics, and trust compound. Not: “an AI character for one jeweller.”'),
    ],
  },
]
