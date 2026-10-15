/** @typedef {'p'|'pull'|'h2'|'h3'|'ul'|'table'|'diagram'|'label'} BlockType */

export const parts = [
  { id: 'I', title: 'Part I · The question', heading: 'The question', blurb: 'Why the box goes silent — and why that silence is a market failure, not a customer preference.' },
  { id: 'II', title: 'Part II · The idea', heading: 'What AKXERAI is', blurb: 'A platform thesis: verified physical identity, persona, conversation, memory, and metered economics.' },
  { id: 'III', title: 'Part III · The system', heading: 'How it works', blurb: 'From scan to ledger — honest separation of what runs today and what the architecture is designed to become.' },
  { id: 'IV', title: 'Part IV · Experiences', heading: 'Experience modes', blurb: 'Direct retail is the core path. Keepsake and gifting are modes built on the same door — not the definition of the company.' },
  { id: 'V', title: 'Part V · The business', heading: 'Economics and moat', blurb: 'Prepaid wallet, per-unit codes, margin targets, and why brands pay for post-purchase relationship — not for a QR link.' },
  { id: 'VI', title: 'Part VI · The proof', heading: 'Founder and pilot', blurb: 'From a water-bottle sketch to a House of Jewels launchpad — what is built, what is being validated, and what must not be invented.' },
  { id: 'VII', title: 'Part VII · Trust and company', heading: 'Trust and building', blurb: 'Privacy, refusal to become surveillance, team phases, and brand versus platform ownership.' },
  { id: 'VIII', title: 'Part VIII · The future', heading: 'Scale and timeline', blurb: 'Self-serve SaaS, owned voice, categories, and 2026–2031 scenarios — labeled, not promised.' },
  { id: 'IX', title: 'Part IX · The standard', heading: 'Feature to standard', blurb: 'When customers expect a life on the object — and when infrastructure replaces novelty.' },
]

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

export const chaptersPart1 = [
  {
    part: 'I',
    title: 'The silent product',
    kicker: 'Scene',
    blocks: [
      p('Picture a premium box after the ribbon is cut. For a minute the room is full — colour, weight, the smell of new things. Then the box becomes cardboard. The brand that spent months on texture and embossing is no longer in the room. The customer is alone with the object.'),
      p('This is not a failure of marketing before purchase. Brands are extraordinarily good at attention before and during the sale: advertising, social, showroom, apps, CRM. The break is <em>after</em> checkout, when the physical product enters real life and often becomes digitally silent.'),
      pull('The relationship between a brand and a customer does not have to end at checkout. The physical product can become the beginning of the relationship.'),
      p('AKXERAI is built around that gap. Not to replace the counter or the website, but to give the <em>unit that left the store</em> a verified identity, a brand-controlled persona, a conversation, memory, and measurable engagement — without asking the customer to install an app.'),
    ],
  },
  {
    part: 'I',
    title: 'What happens after checkout?',
    blocks: [
      p('Ask a brand owner a question they rarely hear in a planning meeting: “What happens after checkout?” For most categories the honest answer is: we hope they like it, we hope they come back, we hope they tell a friend. Hope is not infrastructure.'),
      h2('What brands lose when the box goes quiet'),
      p('After purchase, many brands cannot see: who opened which unit, when, for how long, what they asked, what they cared about, whether they returned, or which physical serial generated the interaction. First-party data often stops at the transaction. The product — the thing that actually lives in the home — does not carry the relationship forward.'),
      diagram('Traditional vs AKXERAI (source: Founder Foundation)', `TRADITIONAL PATH
Purchase → box opens → silence → occasional support call

AKXERAI PATH (TARGET ARCHITECTURE)
Purchase → scan on real unit → verify → persona → talk → memory → return / social second scan`),
      p('Standard QR codes tried to bridge this gap. They often redirect to a static page: scroll, exit, forget. No voice, no memory tied to the unit, no liveness, no metered budget. AKXERAI is documented as packaging evolution — not QR replacement alone.'),
    ],
  },
  {
    part: 'I',
    title: 'Why now?',
    blocks: [
      label('Convergence thesis · not “AKXERAI invented AI”', ''),
      p('Generative models, voice synthesis, browser-based experiences, computer vision, and accessible cloud (or rental GPU) infrastructure have converged. AKXERAI did not invent these pieces. The thesis in the source documents is that they can now be combined around <em>authenticated physical units</em> with economic control.'),
      p('WebAR and image tracking allow a persona to anchor on packaging without an app install. Gemini-class models can verify a frame, hold conversation, and summarize sessions. TTS can give the persona a brand voice. A ledger can bind memory and usage to a unique code. Each existed separately; the platform attempt is the fusion gate plus wallet plus analytics.'),
      p('Brands simultaneously face rising acquisition cost and hunger for first-party engagement after sale. Connected packaging as a category has been discussed for years; the difference claimed in AKXERAI materials is <em>metered, verified, stateful</em> conversation on the unit — not a campaign microsite.'),
    ],
  },
  {
    part: 'I',
    title: 'The question AKXERAI asks',
    blocks: [
      pull('Is the physical product real and authorized, and can it activate its digital identity? — Not: “Who gifted it?”'),
      p('That question is the front door. Gifting adds people and emotion; it is a powerful launch market. It is not the universal architecture. A perfume bought for oneself, a shoe box opened in a bedroom, a watch worn daily — each can ask the same gate question without a sender or receiver seat.'),
      p('The emotional endgame described in founder conversations: customers should someday feel, <em>“Arre yaar, is par AKXERAI hona chahiye tha”</em> — the box feels incomplete without a life on the object. That is a standard thesis, not a current market fact.'),
    ],
  },
  {
    part: 'II',
    title: 'What is AKXERAI?',
    blocks: [
      label('Definition · Founder Foundation + Platform Blueprint', ''),
      p('AKXERAI is documented as an AI-native packaging operating system: it transforms physical products into intelligent digital touchpoints — conversation, memory, and measurable engagement on every coded unit. App-less WebAR, generative AI, digital identity, and analytics are combined in one platform story.'),
      p('More precisely for this book: AKXERAI is infrastructure that gives physical products <strong>verified digital identity</strong>, a <strong>brand-owned AI persona</strong>, <strong>conversational capability</strong>, <strong>memory/continuity</strong>, <strong>measurable engagement</strong>, and <strong>usage economics</strong> (prepaid wallet, per-code budget, ledger metering).'),
      diagram('Central platform stack (normalized from source docs)', `PHYSICAL PRODUCT
  ↓ REAL OBJECT VERIFICATION
  ↓ UNIQUE PRODUCT / UNIT IDENTITY
  ↓ BRAND PERSONA
  ↓ CONVERSATION
  ↓ MEMORY / CONTINUITY
  ↓ TOKEN / USAGE LEDGER
  ↓ RECHARGE / ECONOMIC CONTROL
  ↓ BRAND ANALYTICS`),
      p('The brand owns story, persona direction, voice character, and customer relationship policy. AKXERAI provides activation, verification, orchestration, ledger, metering, and dashboard infrastructure.'),
    ],
  },
  {
    part: 'II',
    title: 'What AKXERAI is not',
    blocks: [
      p('Source documents and product philosophy repeatedly draw boundaries. AKXERAI is attempting to become digital relationship infrastructure for physical products — not:'),
      p('<ul><li>Only a QR-code company or redirect tool</li><li>Only an AR filter gimmick</li><li>A generic website chatbot unbound to the unit</li><li>A social network or surveillance system</li><li>A marketplace of characters</li><li>Only a gifting product or only a jewellery product</li><li>Only a voice character (Myra is an example persona for one pilot, not the platform identity)</li></ul>'),
      pull('Information is a feature. Conversation is the experience.'),
    ],
  },
  {
    part: 'II',
    title: 'The product becomes the interface',
    blocks: [
      p('In AKXERAI’s thesis, the interface is not primarily a phone screen or a browser tab. The <em>physical unit</em> is the anchor. The QR is an entry mechanism. The code is the ledger key. The camera frame is the authenticity test.'),
      p('Contrast: “A QR that opens a webpage” versus “A physical product that activates its own digital relationship.” The Platform Blueprint describes one box, one code, one budget envelope — counterfeit or unregistered codes fail at the fusion gate.'),
      p('Example shape (illustrative identity format from technical docs): a serialized code such as <code>HOJ-XXXXXX</code> or a pilot test mapping — not a single URL shared by ten thousand units.'),
    ],
  },
  {
    part: 'II',
    title: 'Physical identity per unit',
    blocks: [
      label('Platform capability · pilot implements coded ledger rows', 'pilot'),
      p('Ten thousand boxes that look identical on a shelf are ten thousand separate economic and narrative opportunities if each carries a unique identity. Per-unit identity enables: engagement attribution, memory binding, token consumption accounting, analytics, and lifecycle planning — as documented in the Blueprint and Backend reference.'),
      p('The House of Jewels engineering seed documented in the Backend FULL reference: <strong>101 product codes</strong>, <strong>202 ledger rows</strong> (sender and receiver threads per code in the pilot configuration), plus brand wallet pools in <code>brand_accounts</code>. That is a <em>pilot implementation</em> of per-code identity — not the claim that every future product uses two threads.'),
    ],
  },
  {
    part: 'II',
    title: 'The real-object problem',
    blocks: [
      p('Start with a story the patent background and MVP verify docs agree on: a photograph of a product is not possession of the product. A screenshot is not the box on the table. If digital life opens for any flat image, the system becomes a content player, not a trust layer — and AI spend burns on fraud.'),
      p('Customers and brands both lose when spoofing is easy. The emotional promise (“someone was waiting inside the box”) collapses if the box was never there.'),
      pull('Trust comes first. Then conversation.'),
    ],
  },
  {
    part: 'II',
    title: 'Verification — MVP today vs patent vision',
    blocks: [
      label('Current MVP · myraVerify.js + MindAR (Backend doc)', 'pilot'),
      label('Extended claims · Provisional Specification (not granted)', 'patent'),
      p('<strong>Pilot implementation (documented):</strong> Layer A — MindAR image target; persona can appear when target is tracked. Layer B — Gemini vision reads House of Jewels / Richera pilot branding or <code>HOJ-</code> suffix codes. Layer C — liveness and frame quality; photo/screen failures; one verify cycle per session with lock on fail.'),
      p('<strong>Provisional specification (legal document):</strong> broader language — Physical Tangible Entity (PTE), Physical Access Point (PAP), multi-layer detection matrix, material liveness, spoof resistance, stateful generative personas, persistent records, hardware-agnostic anchoring, and extended roadmap claims (pixel-level encodings, SoC indexing, edge/cloud orchestration). This book does not state that all claims are shipped in the August 2026 pilot.'),
      diagram('Verification layers (Blueprint + Backend)', `Layer A — Product visible / tracked (fast reveal)
Layer B — Which exact unit? Code + ledger lookup
Layer C — Real surface vs photo / screen / replay
Fusion gate — Session authorized only if signals pass + budget remains`),
    ],
  },
  {
    part: 'II',
    title: 'Brand persona and conversation',
    blocks: [
      p('The brand defines character, name, voice direction, tone, product knowledge boundaries, and approved claims. AKXERAI provides the infrastructure to activate and operate that persona on the verified unit. Myra (House of Jewels Memory Keeper) is a <em>pilot example</em>, documented in prompts as natkhat Hinglish bestie energy — not the universal platform character.'),
      p('Product prompts (forensic receiver payload and myraPrompt.js) describe experience scenarios including <strong>Scenario A: Direct Retail</strong> — entertain, brand vibe, new friendship — without sender/receiver split in the ledger. Scenario B keepsake and Scenario C gifting are separate modes.'),
      p('Conversation philosophy from Experience Blueprint: emotion first, information inside flow; persona as friend not salesman; technology invisible, experience remembered.'),
    ],
  },
  {
    part: 'II',
    title: 'Memory and continuity',
    blocks: [
      label('Implemented · ledger columns + summaries (Backend doc)', 'pilot'),
      p('The persona should not feel like it forgets everything on every scan. Documented pilot behavior: conversation text and session summaries on <code>ledger_threads</code>; archivist-style summaries; dialogue digest lines; return-gap headers for reunion tone; dashboard parsing for praise and topics where supported.'),
      p('This is not unlimited human memory. It is structured persistence per code (and per thread where the pilot uses sender/receiver rows). Future platform docs describe richer fleet analytics and self-serve persona tooling — labeled future vision in Blueprint Part IV.'),
    ],
  },
]
