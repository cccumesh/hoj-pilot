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
function table(headers, rows) {
  return { type: 'table', headers, rows }
}

export const chaptersPart4 = [
  {
    part: 'III',
    title: 'Product codes and the ledger',
    blocks: [
      label('Backend FULL · pilot schema', 'pilot'),
      p('Each activated unit maps to a unique code (e.g. <code>HOJ-XXXXXX</code>). The ledger table <code>ledger_threads</code> holds conversation state, voice budgets, summaries, and — in the House of Jewels pilot configuration — separate sender and receiver threads per code. Engineering seed: <strong>101 codes</strong>, <strong>202 thread rows</strong>, brand wallet in <code>brand_accounts</code>.'),
      p('Per-code voice budget in production SQL defaults to <strong>15,000 characters</strong> with brand-level caps configurable. Planning documents for HOJ also discuss showing houses a <strong>25,000 character ceiling</strong> for generous full-use modeling — distinguish operational default from commercial planning envelope.'),
      diagram('One code, one envelope', `Unique code printed on unit
  → ledger row(s) created at provisioning
  → verify binds session to code + thread
  → voice/AI usage decrements budget
  → soft exit near low balance
  → summary written on session end`),
    ],
  },
  {
    part: 'III',
    title: 'MVP versus future platform',
    blocks: [
      label('Explicit comparison · Backend + Blueprint', ''),
      table(
        ['', 'Current MVP / pilot', 'Future platform (vision)'],
        [
          ['Delivery', 'Browser, app-less, WebAR (MindAR)', 'Self-serve brand onboarding, multi-brand fleet'],
          ['Verify', 'Gemini vision + MindAR target + session lock', 'Stronger liveness, patent roadmap layers'],
          ['Persona', 'Brand-configured prompts (Myra = HOJ example)', 'Persona studio, multiple characters per brand'],
          ['Memory', 'Summaries, digest, per-thread ledger', 'Fleet analytics, exports, enterprise controls'],
          ['Economics', 'Prepaid wallet, per-code metering', 'Scale pricing tiers, owned voice at volume'],
          ['Modes', 'Direct retail + keepsake + gifting threads', 'Category templates, enterprise CRM hooks'],
        ],
      ),
      p('Do not describe future rows as shipped in the August 2026 pilot unless a source documents deployment.'),
    ],
  },
  {
    part: 'V',
    title: 'The post-purchase market gap',
    blocks: [
      p('Founder Foundation frames AKXERAI as answering a gap brands already feel: acquisition and pre-purchase storytelling are mature; post-purchase physical engagement is fragmented. QR campaigns often measure clicks, not relationship. CRM knows the buyer, not necessarily which unit was opened tonight.'),
      pull('What happens after checkout? is a planning question most category decks skip.'),
      p('AKXERAI attempts product-level first-party engagement: the unit that was sold becomes the sensor for conversation, return, and usage — when the customer chooses to scan.'),
    ],
  },
  {
    part: 'V',
    title: 'Scaling — products to infrastructure',
    blocks: [
      label('Mechanism · not a forecast', 'scenario'),
      diagram('Scale logic (Blueprint themes)', `100 units → learn verify + persona
1,000 → ops + print discipline
20,000 → wallet economics matter
200,000 → owned voice + trust team
Millions → platform SLA + standard thesis`),
      p('Revenue follows engaged scans × package price + platform fees, not box shipments alone. Quiet codes stay cheap — usage is the meter. Illustrative fleet split: 20,000 core retail identities + 2,000 gift-mode identities shows how gifting layers on the same door without defining the company.'),
    ],
  },
  {
    part: 'VI',
    title: 'October 2026 — the hinge page',
    blocks: [
      label('Status from company book + Backend · not revenue achieved', 'pilot'),
      p('As of the documented October 2026 picture: provisional filing behind; bottle origin behind as sketch, ahead as category; product described as <strong>pilot-ready</strong>; brand runs as AKXERAI platform; House of Jewels chosen as launchpad; verify refuses photo/spoof patterns in design; third device rejected in two-seat gifting configuration; dashboard can surface talk and scans; live code voice meter documented at fifteen thousand characters; HOJ planning models discuss seventeen thousand boxes in catalogue planning, fifteen hundred expected average conversations, roughly ₹1.09 lakh expected front billing, full-use ceiling near ₹20.7 lakh — all <strong>planning figures</strong>, not closed revenue.'),
      pull('About twenty percent of the company may be built. One hundred percent of the invention’s feeling can be testable. Do not confuse the two.'),
      p('What is not yet documented as accomplished in technical PDFs: second brand signed, national logos, owned-voice fleet, unicorn valuation. Those belong to later chapters marked scenario.'),
    ],
  },
  {
    part: 'VI',
    title: 'Who deserves the first pilot',
    blocks: [
      p('The selection question in Foundation is not which logo towers on a slide but which human situation makes AKXERAI undeniable. A pilot that only proves software runs teaches little. A pilot that changes how two people experience a gift — or how one person experiences a retail purchase — teaches the category.'),
      p('Jewellery led because emotion and trust are native, ticket size punishes cheapness, and gifting is frequent. House of Jewels, Jalgaon (Bafna family) is documented as launchpad: trust legacy, multi-floor showroom, gifting intensity. AKXERAI powers the moment after the box leaves; it does not become the floors.'),
    ],
  },
  {
    part: 'VI',
    title: 'Gifting mode — sender and receiver',
    blocks: [
      label('Pilot configuration · not universal architecture', 'pilot'),
      p('In gifting mode the emotional arc is SENDER → PRODUCT → RECEIVER. Sender scans the real card and talks; memory stores what was actually said. Receiver on another phone scans the same object and meets the persona — not a courier reading a card. Product prompts forbid inventing scenes the sender never spoke.'),
      p('Pilot ledger policy: first device takes sender seat, second distinct device takes receiver seat, third device refused — documented manners for gift privacy, not the definition of all AKXERAI products. Direct retail (Scenario A) does not require two seats; a perfume buyer can scan alone and still receive brand conversation and memory on that unit.'),
      pull('Two seats are gift-mode manners. The platform question remains: is this real unit authorized to activate its digital life?'),
    ],
  },
  {
    part: 'VI',
    title: 'Rooms that did not become the pilot',
    blocks: [
      label('Founder narrative from earlier company book · lessons, not audited accounts', 'scenario'),
      p('Before the launchpad, rooms asked for a QR brochure, a cheap trick without real-object discipline, or curiosity without boxes and codes. Those nos became product inputs: first minute must not feel like a page; price and feeling must align; without a real coded box there is no customer yet.'),
      p('Do not treat unnamed rooms as verified business facts — treat them as design discipline the founder documented.'),
    ],
  },
  {
    part: 'VI',
    title: 'What proof must look like',
    blocks: [
      label('Success criteria · Founder Foundation', 'pilot'),
      p('Proof is not a dashboard screenshot alone. Documented success: voluntary time spent; memorable experience; brand story communicated; owner sees differentiation; structured report (customer insights, brand insights, technical report, business recommendation). Documented failure: no scans; immediate exit; meaningless engagement; repeated technical breaks; owner sees no value; no interest in future deployment.'),
      p('When scans appear on a live dashboard — one, then another — the class of event matters: a physical unit connected to a person. This book does not attach invented counts or customer names to that moment unless a source records them.'),
    ],
  },
  {
    part: 'VI',
    title: 'The first real signals',
    blocks: [
      p('Signals the system is built to emit: verify pass/fail reasons (photo spoof, unregistered code, exhausted budget); talk time by thread; return scans with summary continuity; praise and feedback parsed where enabled; token/voice consumption against wallet.'),
      p('Marketing signal (aspiration from Experience Blueprint): a scan that looks like a moment, not an ad — if customers choose to film themselves. Manufactured virality is explicitly rejected in product philosophy (no fake receiver, no third seat for metrics).'),
    ],
  },
  {
    part: 'VI',
    title: 'How the system works — the gate in full',
    blocks: [
      label('Pilot implementation · Backend + MVP Technical', 'pilot'),
      p('No app install: browser, camera, packaging image target, 3D persona anchor. One live frame judged in layers: house/card recognition or readable <code>HOJ-</code> suffix; physical presence vs photo/screen/replay; frame quality. Pass requires signals plus registered code with budget. Failure locks session — retrying a lie in the same sitting is not supported.'),
      h2('Talk, memory, models'),
      p('Speech: browser STT in pilot; Deepgram optional in project. Thought chain documented: Gemini Flash-Lite for verify/open/chat; session summary via heavier Flash with fallback. Streaming tokens to TTS queue when enabled. Inworld TTS via server proxy; browser speech as fallback only.'),
      h2('Gifting rows vs retail path'),
      p('Gifting pilot: sender and receiver rows on <code>ledger_threads</code>. Retail Scenario A: conversation on the unit without requiring two humans — same verify and persona infrastructure, different memory shape in prompts.'),
      p('Flow in one breath: object in frame → gate → seat (where mode requires) → persona → talk → summary on exit → return reads memory → spoof/refuse third device in gift mode. Features that require screenshot passes or gossip beyond spoken facts are out of scope for this company’s stated ethics.'),
    ],
  },
  {
    part: 'VII',
    title: 'Security and spoofing',
    blocks: [
      p('Verify fail messaging documented for users: photo spoof, brand/code mismatch, not registered, budget exhausted. Provisional specification describes broader anti-replay and replicated imagery concerns — roadmap, not all shipped in pilot.'),
      p('Operational risk: wrong code batch printed vs ledger — lock behaves correctly but shop experiences “broken.” Lesson category from company narrative: philosophical gate plus operational print discipline both required.'),
    ],
  },
  {
    part: 'VII',
    title: 'Enterprise reality — logo versus door',
    blocks: [
      label('Scenario narrative · 2029 company book arc', 'future'),
      p('Large-brand meetings may tempt: work-for-hire persona, ledger only in brand tenant, remove “Powered by AKXERAI.” Documented founder response pattern in scenario material: character wardrobe may be brand-owned; fusion gate, metering, memory system, and attribution stay platform-owned. Privacy extends contractually — gift data not sold house to house.'),
      pull('The logo was the temptation. The door was the asset.'),
    ],
  },
  {
    part: 'VII',
    title: 'Operations — print, codes, and launch discipline',
    blocks: [
      p('Pilot ops chain: brand wallet recharge → code generation debits wallet → QR/sticker print → unit ships → scan triggers meter. Mismatch between printed code and ledger row is a company failure mode distinct from verify philosophy. Fresh-start scripts in repo generate synchronized SQL seeds for engineering tests — production launch requires the same discipline at print house scale.'),
    ],
  },
  {
    part: 'V',
    title: 'The price is a philosophy',
    blocks: [
      label('Economics Playbook · launchpad planning', 'scenario'),
      p('Brands buy the right for an object to behave as if the house is still present — with manners, memory, and anti-spoof discipline — not a pass-through of vendor tokens. If invoice tracks only falling GPU cost, AKXERAI becomes a line item; standards keep a category floor.'),
      p('Launchpad teaching bill (documented assumptions): ~17,000 boxes in planning scope; ~1,500 expected conversations; ~₹1,09,426 expected billing; voice/thought marked up respectfully over rack (example doc: voice ~$27.50/M chars vs ~$25 rack, thought tiers similarly, FX ~₹96/$); full-use ceiling ~₹20.7 lakh shown so top is not surprise; quiet boxes barely bill.'),
      pull('Never invoice your cost. Invoice the standard.'),
    ],
  },
  {
    part: 'V',
    title: 'Owned voice and machine economics',
    blocks: [
      label('Economics Playbook §05–06 · illustrative', 'scenario'),
      p('Rented voice fits launchpad speed; owned GPU TTS (~₹50k/month ~200M characters capacity in doc) targets ~₹2–10 per conversation band depending on length once live. Illustrative ten-brand year ~4.3M scans ~₹1.5 Cr platform delivery vs multi-crore cloud tax at same volume.'),
      p('Scale sketch: 25M engaged scans × 10k chars → ~250B chars/year → ~105 GPUs at 200M chars/month → ~₹6 Cr rent plus thought → blended delivery ~₹4–6/scan — company cost, not customer price. Size machines for average use; 25k ceiling is burst generosity per excited code, not fleet sizing assumption.'),
    ],
  },
  {
    part: 'V',
    title: 'Launchpad bill versus standard bill',
    blocks: [
      table(
        ['', 'Launchpad planning (2026)', 'Standard picture (scenario)'],
        [
          ['Who', 'One jewellery house; ~17k box planning scope', 'Many houses, many categories'],
          ['Voice', 'Rented, respectful markup', 'Owned slice + backup rented'],
          ['Expected engaged use', '~1,500 conversations (planning)', 'Tens of millions scans (model)'],
          ['Expected pay', '~₹1.09 lakh; ceiling ~₹20.7 lakh', 'Category floor far above unit cost'],
          ['Quiet codes', 'Minimal meter', 'Still minimal — use is the meter'],
        ],
      ),
    ],
  },
  {
    part: 'V',
    title: 'Valuation arithmetic — scenario only',
    blocks: [
      label('SCENARIO ≠ PROMISE · from company book model', 'scenario'),
      p('Illustrative scale year: 25M engaged scans × blended ~₹180/scan ≈ ₹450 Cr usage; platform fees ~₹50 Cr; ~₹500 Cr revenue (~$52M at ₹96/$). Delivery ~₹10–15 Cr with owned voice; people ~180 × ~₹40L loaded ≈ ₹70 Cr. If market applies ~20× revenue multiple → ~$1B valuation conversation. At ~12×, company is strong but not unicorn — book prefers honest multiple range over costume certainty.'),
      p('Billion is market language for repeatable standard proof — not the founder’s purpose sentence. Purpose remains: physical products receive measurable digital relationship infrastructure.'),
    ],
  },
  {
    part: 'VII',
    title: 'Why the best people cost less equity later',
    blocks: [
      label('Company-building scenario · October 2026+', 'scenario'),
      p('Great engineers early in empty months reasonably demand co-founder risk pricing. After pilot-ready system, launchpad scans, second brand, dashboard data — risk falls and equity per seat can fall while salary rises. Show work, then hire; do not pay loneliness with cap table.'),
      p('Early equity candidates after proof: product engineer on gate/ledger; brand lead for rooms; voice director for non-imitation second personas. Later hires: employee equity bands, competitive salary vs large firms.'),
    ],
  },
  {
    part: 'VII',
    title: 'Who sits down, and when',
    blocks: [
      table(
        ['Step', 'Seat', 'Why now'],
        [
          ['After pilot holds', 'Brand lead', 'Founder not only voice in owner rooms'],
          ['Same window', 'Voice / persona director', 'Second presence must be born, not copied'],
          ['Same window', 'Product engineer', 'AR, verify, ledger ownership'],
          ['After two brands', 'Trust engineer', 'Verification beyond clever check'],
          ['When invoices real', 'Finance lead', 'Price floor, payroll, machine rent'],
          ['When brands renew', 'Customer partner', 'Post-sale house success'],
          ['Mid-size', 'Platform, studio, revenue, people heads', 'Founder not single corridor'],
        ],
      ),
      p('Absent at start: large sales army, research lab before gate proven in shop, chief of staff for founder feelings. Headcount follows steps, not ambition posters.'),
    ],
  },
  {
    part: 'VII',
    title: 'Five chances on the road',
    blocks: [
      h2('One — founder + pilot-ready product in emotional category'),
      p('Jewellery launchpad; real box; manners. Available on October page. Win = right to pursue second proof.'),
      h2('Two — same door, second house, three early seats'),
      p('Repetition without founder sleeping in stock room.'),
      h2('Three — bottle category returned'),
      p('When verify mature and content lead exists; harder emotion, wider market.'),
      h2('Four — large national house'),
      p('Only with trust, finance, customer partner real. Illustrative logos in notes — not claimed signed.'),
      h2('Five — non-Indian house'),
      p('Mid-size team; same gate, new language; kickoff ≠ country won.'),
      pull('Team plus product finished for that step — the only luck this company believes in.'),
    ],
  },
  {
    part: 'VIII',
    title: '2027 — repeat the proof',
    blocks: [
      label('Future scenario · company book arc', 'future'),
      p('Narrative planning year: launchpad excitement does not pay second salary alone; second brand takes longer; voice director rejects Myra imitation week; wrong code batch operational failure teaches print discipline; early equity offered with lawyer plainness after data visible. Not reported as accomplished fact in technical PDFs.'),
    ],
  },
  {
    part: 'VIII',
    title: '2028 — voice comes home',
    blocks: [
      label('Future scenario', 'future'),
      p('Owned voice in slices with rented backup; price held when buyer asks for cost-pass-through cut; bottle pilot returns with photo-spoof refusal at distributor; two-seat gift logic tested outside jewellery emotion. Headcount still a room, not a tower.'),
    ],
  },
  {
    part: 'VIII',
    title: '2029 — the large room and the attack',
    blocks: [
      label('Future scenario', 'future'),
      p('National house negotiation tests ownership of door vs character; spoof pattern in wild tightens verify; bad senior hire exited cleanly. Logo temptation vs door asset — scenario telling, not SEC filing.'),
    ],
  },
  {
    part: 'VIII',
    title: '2030 — assumed, not announced',
    blocks: [
      label('Future scenario', 'future'),
      p('"Put it on AKXERAI" becomes shorthand in brand conversations; studio bench of non-cousin personas; volume brand floor negotiation; abroad begins small. Founder day reserved for what AKXERAI must never become: surveillance graph, fake virality, marketplace of masks.'),
    ],
  },
  {
    part: 'VIII',
    title: '2031 — valuation as outcome',
    blocks: [
      label('Future scenario · not current balance sheet', 'future'),
      p('Market may say billion-dollar valuation if ~₹500 Cr revenue picture believed repeatable — founder still on standard seat, not every ticket. Series logic: standard first, price follows proof. Reader in 2026 should see distance and path, not destiny.'),
    ],
  },
  {
    part: 'IX',
    title: 'Why a standard could emerge',
    blocks: [
      p('Repeated problem across categories: how does a physical unit get identity, authentication, persona, memory, metering, and analytics without each brand rebuilding a lab? If AKXERAI solves that stack repeatedly, powered-by becomes expected packaging layer — the founder line about the box feeling incomplete without a life.'),
      p('Standard is vision. Jewellery pilot is evidence gathering. Do not collapse them.'),
    ],
  },
  {
    part: 'IX',
    title: 'The week after October — walkable steps',
    blocks: [
      label('Operating rhythm · scenario playbook', 'scenario'),
      p('Monday: real sender/receiver test on two phones; taste gap = product work. Tuesday: insult tests — photo, screen video, third phone — must fail humanly. Wednesday: dashboard vs lock truth; insights column gap noted honestly. Thursday: second-brand conversation without leading with model names. Friday: write three seat briefs from Monday notes. Weekend: one hour on category after jewellery — bottle, watch, perfume — one sentence each for who the people are in core vs gift mode.'),
    ],
  },
  {
    part: 'IX',
    title: 'A receiver in the room — illustrative scene',
    blocks: [
      label('Illustrative · product intent from forensic prompts', 'scenario'),
      p('Receiver curious, slightly suspicious — correct emotion. First minute: recognition without briefing; sender’s truth kept; not a menu. Second: one new confided beat, not whole diary. Third: ethics — nothing invented; missing detail asked. Return next day separates company from stunt — continuity without re-boot universe. Scale to bottle table or watch birthday: furniture changes; real object, uninvented memory, gift-mode third-phone refusal where mode applies.'),
    ],
  },
  {
    part: 'IX',
    title: 'What can still kill the company',
    blocks: [
      p('Too-big too-early yes on logo’s terms → subcontractor. Cheap year breaking floor → permanent procurement memory. Fake receiver or screenshot pass → life becomes content. Fear cap table → haunted company. Founder refusing specialists → gate rots. Becoming launchpad-only → season ends company.'),
    ],
  },
  {
    part: 'IX',
    title: 'Headquarters — vision of the building',
    blocks: [
      label('Future vision · 2031 scenario', 'future'),
      p('Ground floor shows the door running — object, gate, seat, voice, memory, bill — not trophy wall. Studio floor: distinct presences, rule against inventing sender life. Trust floor: spoof clusters, counsel drawings beside Pune provisional. Revenue with printed category floors; finance beside revenue; people separate from deal adrenaline. Founder room still too findable — flaw to close when renewals solve without him.'),
      p('Building represents engineering, AI, design, research, trust, operations, global brands, millions of units — because original idea survived pilots, failures, fixes, and scale discipline.'),
    ],
  },
  {
    part: 'IX',
    title: 'Patent — provisional learns to walk',
    blocks: [
      label('Provisional filed · not granted', 'patent'),
      p('Pune provisional: PTE/PAP language, multi-layer validation, stateful personas, persistent records, hardware-agnostic anchoring, extended roadmap claims. Small-company work: drawings matching actual gate behavior; extensions when verify tightens; no marketing claim numbers; product grows only where filing can extend.'),
      p('Features breaking gift-mode manners or screenshot policy do not enter build — counsel protects claim; founder protects feeling.'),
    ],
  },
  {
    part: 'VI',
    title: 'The bottle — where the idea began',
    blocks: [
      label('Founder Foundation origin', 'pilot'),
      p('Documented arc: water bottle brand concept with QR + AR character explaining product → natural conversation insight → cross-industry silent packaging research → pivot from selling one bottle to building technology any brand could use. Bottle returns in scenario chapters when verify and team can carry wider categories without embarrassing the standard.'),
    ],
  },
  {
    part: 'VI',
    title: 'Hackathons, equity, and the freelancer not hired',
    blocks: [
      label('Founder journey · Foundation narrative', 'scenario'),
      p('Winter months: unable to pay freelancer; hackathon/equity conversations rejected when fear would co-own the company; provisional filed with empty hands; build accelerated with modern AI-assisted engineering while founder owns problem framing, architecture, persistence, brand vision. Non-technical ≠ empty-headed.'),
    ],
  },
]
