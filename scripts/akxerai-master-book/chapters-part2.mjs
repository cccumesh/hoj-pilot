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

export const chaptersPart2 = [
  {
    part: 'III',
    title: 'How AKXERAI works — end to end',
    blocks: [
      label('August 2026 HOJ pilot stack · Backend FULL', 'pilot'),
      p('Documented request flow: phone browser loads React app → MindAR tracks packaging target → camera frame captured → Gemini verify → on success, chat loop with streaming tokens → Inworld TTS (server proxy) → ledger read/write on Supabase → session summary on exit → brand dashboard reads aggregates.'),
      diagram('Scan to memory (Backend doc)', `MindAR Scan → Gemini Verify → Ledger R/W
Supabase: brand_accounts · ledger_threads
Netlify Functions: gemini · inworld-tts · deepgram (optional)
No custom server — static CDN + serverless`),
      p('Production keys for Gemini and Inworld sit in Netlify functions in production; client uses API proxy. Engineering status in Backend doc: ~90% complete for pilot deploy; brand creative (targets, stickers, persona copy refinement) listed as brand-owned inputs.'),
    ],
  },
  {
    part: 'III',
    title: 'WebAR, voice, and AI routing',
    blocks: [
      p('Stack documented across Backend and MVP Technical: React 19, Vite, Three.js, MindAR image tracking, FBX persona, Gemini Flash-Lite chains for verify/chat, Gemini Flash for session summary with fallback, Inworld TTS-2 via proxy, optional Deepgram STT, browser speech fallback if voice disabled.'),
      p('Streaming chat (<code>VITE_MYRA_STREAM_CHAT</code>) sends NDJSON tokens to sentence buffer → TTS queue for lower perceived latency. This is pilot engineering detail — future platform may abstract model routing per brand tier.'),
    ],
  },
  {
    part: 'III',
    title: 'Wallet, recharge, and token lifecycle',
    blocks: [
      label('Economics Playbook + Blueprint', 'scenario'),
      p('Target SaaS loop documented: brand signs up → recharges wallet → chooses Light / Standard / Plus / Deep packages → generates N unique codes (wallet debits N × retail) → prints QR + code stickers → ships → customer scan triggers ledger meter → dashboard → top-up.'),
      p('One code = one physical unit envelope. No scan = no AI cost (idle inventory free beyond sticker print). Soft exit when ~200–300 voice characters remain (pilot band documented ~200–250) — persona goodbye, session closes without surprise overage.'),
      diagram('Token lifecycle', `Brand wallet (prepaid)
  → per-code budget at generation
  → verify + session start checks ledger
  → voice chars + AI tokens decrement
  → soft exit → session closed
  → analytics + recharge`),
    ],
  },
  {
    part: 'III',
    title: 'Analytics — implemented vs roadmap',
    blocks: [
      label('Pilot dashboard · AdminDashboard.jsx', 'pilot'),
      p('Documented pilot dashboard tabs: Overview (scan rate, talk time, wallet donuts), All Codes table, Feedback. Ledger supports praise parsing, AXERAI experience feedback, verify insight counters when column present, sender/receiver talk split in evolved builds.'),
      p('Blueprint future: fleet-wide sentiment, topics, self-serve exports, enterprise SLA tier — not claimed as fully live in August 2026 pilot doc.'),
    ],
  },
  {
    part: 'IV',
    title: 'Direct retail — the core experience',
    blocks: [
      label('Scenario A · forensic + myraPrompt', 'pilot'),
      p('The cleanest AKXERAI story in product prompts: customer buys product → scans real unit → verification passes → brand persona activates → conversation (party, office, taste, jokes, product facts) → memory on return → optional second person scans and social layer activates (“arre yeh Chetan ka perfume hai re”). No sender/receiver requirement in Scenario A.'),
      p('This is the perfume-bro energy the founder describes for scale categories: footwear, deodorant, earbuds, beauty — character is category-specific, infrastructure is common.'),
      pull('Gifting is a mode. Direct retail is the platform’s default shape.'),
    ],
  },
  {
    part: 'IV',
    title: 'Personal keepsake',
    blocks: [
      label('Scenario B · prompt architecture', 'pilot'),
      p('Documented as personal keepsake mode — wise continuity from soul ledger history where supported. Do not overclaim beyond prompt and ledger behavior in pilot. Distinct from corporate retail banter and from two-party gift delivery.'),
    ],
  },
  {
    part: 'IV',
    title: 'Gifting — experience mode on AKXERAI',
    blocks: [
      label('Scenario C · HOJ pilot emphasis', 'pilot'),
      p('Gifting mode: SENDER → PRODUCT → RECEIVER. Sender confides; recipient receives drip delivery from digest — not a courier reading a card. Pilot implements max two device threads per code (sender + receiver) with third device rejected — documented in Backend §9.'),
      p('Why jewellery led launch (Founder Foundation Phase 2): emotion, premium packaging, natural two-person story, measurable share moments, high trust context. <strong>Launch wedge psychology:</strong> gifting generates more scans and marketing highlight than solo retail at introduction — not because AKXERAI equals gifting.'),
      diagram('Core vs gifting mode', `CORE:  Product → Customer (any category)

GIFT MODE:  Sender → Product → Receiver
(same verify · same persona infra · extra memory shape)`),
    ],
  },
  {
    part: 'IV',
    title: '20,000 + 2,000 — deployment illustration',
    blocks: [
      label('Illustrative deployment model · not a live contract figure', 'scenario'),
      p('To prevent readers from equating AKXERAI with gifting only, use an illustrative fleet split: <strong>20,000</strong> standard unit identities (core retail path) and <strong>2,000</strong> gift-mode identities (sender/receiver shaped campaigns). This framing is a planning illustration for platform storytelling — align operational pilots to actual brand batch sizes (HOJ engineering seed: 101 codes; Foundation pilot scope mentions ~200 uniquely identified products in validation planning).'),
    ],
  },
  {
    part: 'IV',
    title: 'Why would anyone scan?',
    blocks: [
      p('Honest answer from Foundation: curiosity first — “chalo dekhte hain kya hai.” QR alone is weak; the experience must deliver surprise, voice, persona, entertainment, guidance, or emotional gift reveal. Brands must earn the scan. Adoption is not assumed.'),
      p('Documented motivations: human-like interaction, personalized experience, brand character, product discovery, gifting memory, social show-and-tell after a positive first session.'),
    ],
  },
  {
    part: 'IV',
    title: 'Why would they return?',
    blocks: [
      p('Repeat loops documented: continuity on return scan, new beats not identical reboot, product use guidance, special occasion, gift story for recipient mode, relationship over time. Explicit limit: repeat engagement must be earned; AKXERAI cannot force attachment.'),
      p('Experience Blueprint success line (customer voice): “Yaar… ye expected se bhi zyada mast tha.” Brand voice: “Is brand ne sirf product nahi diya, ek experience diya.” — aspiration language from source, not a guaranteed pilot outcome.'),
    ],
  },
  {
    part: 'V',
    title: 'Why brands pay',
    blocks: [
      p('Phase 5 Founder Foundation: brands invest in post-purchase value — first-party engagement, storytelling on the unit, measurable interaction, differentiation, not replacing traditional advertising but extending the product itself.'),
      p('Observable potential (where implemented): scans, talk time, token consumption, topics/praise, repeat scans, per-code activation. Future: fleet sentiment and CRM integrations listed as custom/chargeable in brand journey doc.'),
    ],
  },
  {
    part: 'V',
    title: 'Pricing, margin, and documented numbers',
    blocks: [
      label('Economics Playbook · August 2026', 'scenario'),
      p('Prepaid B2B SaaS: brands buy interaction packages (Light ~12 min, Standard ~30 min ⭐, Plus ~45 min, Deep ~60 min). Cloud launch Standard all-in cost documented ~₹27; owned-voice scale target ~₹5; retail examples ₹8–10 at 30–40% target margin after costs.'),
      p('Per-box planning formula (documented): ₹ per box sold = scan rate × retail per scan. Example: 10% scan × ₹8 Standard = ₹0.80 per box sold on a ₹15,000 footwear illustration.'),
      p('House of Jewels planning figures used in earlier book draft (label as <strong>PILOT PLANNING MODEL</strong>): ~17,000 box catalogue planning, ~1,500 expected conversations, ~₹1,09,426 expected billing in one model, full-use ceiling ~₹20.7 lakh if every box maxes — ceiling shown so top is not a surprise, not forecast as likely.'),
      pull('Never invoice your cost. Invoice the standard. (Economics philosophy — margin expands when voice is owned while retail holds.)'),
    ],
  },
  {
    part: 'V',
    title: 'Competition and moat',
    blocks: [
      p('Categories to compare (Blueprint): static QR, NFC pages, chatbot widgets, AR gimmicks, enterprise custom apps, CRM/loyalty. AKXERAI’s attempted combination: physical identity + authentication + persona + conversation + memory + usage economics + analytics.'),
      p('Potential moat layers (current vs future separated): fusion gate + ledger metering (pilot), persona studio + brand integrations (building), owned voice economics (roadmap), operational trust (earned). Do not claim “AI is the moat.”'),
    ],
  },
  {
    part: 'VI',
    title: 'Founder journey — documented origin',
    blocks: [
      label('Founder Foundation · provisional filing', 'pilot'),
      p('Documented origin: idea began with a water bottle brand concept — QR scan, AR character explaining product; evolved to natural conversation; research showed packaging goes silent across industries; direction shifted from selling one bottle to building technology any brand could use.'),
      p('Applicant on provisional specification: <strong>Chetan Chandrakant Chaudhari</strong> and <strong>Mangala Chandrakant Chaudhari</strong>, Jalgaon. Provisional describes authenticated spatial anchoring and stateful generative personas — filing is not grant. Founder non-traditional technical background: product thinking, architecture framing, modern AI tools to accelerate build — not hiding tool assistance.'),
      pull('Non-technical is not the same as empty-headed. Product thinking was the requirement.'),
    ],
  },
  {
    part: 'VI',
    title: 'First build and MVP',
    blocks: [
      p('Foundation states Phase 2 pilot objective is not to prove technology exists — MVP already demonstrates loop — but to validate customer and brand value in real environment. Backend doc lists engineering ~90% complete: schema, verify, budgets, streaming speech, dashboard; deploy pending user action; brand assets pending.'),
      p('Do not invent customer counts or emotional quotes from pilot. Validation metrics in Foundation are <strong>targets</strong> (e.g. 30–40% scan rate aspiration, ~50% of budget reached on average) — not reported results in these source PDFs.'),
    ],
  },
]
