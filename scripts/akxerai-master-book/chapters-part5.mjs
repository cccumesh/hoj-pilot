function p(html) {
  return { type: 'p', html }
}
function pull(html) {
  return { type: 'pull', html }
}
function h2(text) {
  return { type: 'h2', text }
}
function label(text, kind = '') {
  return { type: 'label', text, kind }
}
function diagram(title, flow) {
  return { type: 'diagram', title, flow }
}

/** Founder / invention year — adapted from company book, architecture-corrected */
export const chaptersPart5 = [
  {
    part: 'VI',
    title: 'Chetan Chandrakant Chaudhari',
    kicker: 'Founder',
    blocks: [
      label('Founder Foundation narrative', 'pilot'),
      p('He was not the person a venture story usually starts with: no lab pedigree, BBA, MBA paused because the work in front became more urgent than the classroom. He could sit with a shop owner and hear what they feared; he could not, at first, implement the system that answered.'),
      p('If he had been a funded engineer, the path might have been shorter and worse — freelancer demo, fall in love with demo. Instead: idea, willingness to file provisional with empty hands, and the question whether a non-technical founder could direct a serious product in the AI-assisted build era.'),
      p('The usable answer: product thinking — object purpose, room dynamics, refusals, feeling, trust criteria — while engineers and tools implement. Financial constraint forced sequence: claim → build without payroll → pilot proof → hires when data lowers equity price.'),
      pull('Non-technical is not the same as empty-headed. Product thinking was the requirement.'),
    ],
  },
  {
    part: 'VI',
    title: 'February 2026 — a bottle first',
    blocks: [
      p('First plan: sell a bottle; AR on label; conversation the packaging cannot hold. Honest seller thinking — physical object that travels, opens away from chooser, gets photographed and gifted. If life can sit on a bottle, it can sit on many categories.'),
      p('Missing pieces: gate (campaign vs authenticated unit), memory, trust for brand feeling, economics. Spark not standard — bottle set aside, not discarded, until company worthy of original sketch.'),
    ],
  },
  {
    part: 'VI',
    title: 'The month the gap became obvious',
    blocks: [
      p('Need outgrew one SKU: almost every physical product’s story dies at open — trust, reason for purchase, name of recipient stay at counter; object leaves alone. Gap = life requiring real object, speech, memory, screenshot refusal — brand-powered layer, not another app.'),
      pull('The market was every object leaving a hand carrying a sentence that currently dies.'),
      p('Survival tactic: large gap in head, narrow first proof in build — architecture of launchpad vs platform.'),
    ],
  },
  {
    part: 'VI',
    title: 'Schedules made with machines',
    blocks: [
      p('Used LLM scheduling sessions for week-level sequencing: before patent talk, before build, before brand sees product. Discipline: feeling first, then gate, then memory, then modes (gift where relevant), then bill.'),
      p('Asked models for objections — gimmick charge, photo attack, third phone on gifts — sharpening argument before code. Product thinking without a compiler.'),
    ],
  },
  {
    part: 'VI',
    title: 'March 2026 — provisional in Pune',
    blocks: [
      label('Provisional specification · filed, not granted', 'patent'),
      p('Filed before MVP: physical product seen and identified; refusal if only picture; life on real thing; spoken truth kept. Stake in ground while product still decision — applicants documented: Chetan Chandrakant Chaudhari and Mangala Chandrakant Chaudhari, Jalgaon.'),
      pull('He did not wait to be legitimate. He dated the invention while his hands were still empty.'),
      p('Later company workstream: verification teeth matching filing; never marketing grant status.'),
    ],
  },
  {
    part: 'VI',
    title: 'The freelancer who was never hired',
    blocks: [
      p('Could not pay for outsourced MVP without becoming client of own company. Phase used as filter: clarity must reach directable build. Hackathon/equity path kept for when seat earned — not panic co-founder weekend.'),
    ],
  },
  {
    part: 'VI',
    title: 'Can a non-technical founder build this?',
    blocks: [
      p('Era answer: yes, with product thinking; no, if confusion is the spec. Requirement: know feeling, refusals, memory ethics, brand embarrassment lines, economic meter — then tools accelerate execution. Hackathon half-company rejected; boring specificity accepted as build-ready signal.'),
    ],
  },
  {
    part: 'VI',
    title: 'Product thinking — the real degree',
    blocks: [
      p('Weeks of argument: gift dynamics, spoof, return scan tone, hide-the-matrix rules, usage-based quiet boxes, price as respect not utility token. Scope settled pre-brand-yes: house gets character; AKXERAI is multi-house infrastructure.'),
      p('Architecture note for readers: gifting uses two device threads in pilot; core retail path centers on unit → customer with same verify and persona stack. One code per unit; modes differ, door does not.'),
    ],
  },
  {
    part: 'VI',
    title: 'Pilot-ready, not toy',
    blocks: [
      label('Backend ~90% · deploy + brand assets pending', 'pilot'),
      p('Build via modern AI-assisted engineering (e.g. Cursor) with founder demanding server-side secrets, three-layer verify + lock, ledger, dashboard, HOJ test codes, Myra as example persona — pilot-ready handoff, not hollow demo. MVP and pilot not separated by shame valley; choosing worthy first pilot is the October decision.'),
      pull('He did not buy a demo. He arrived specific at something that could be placed in a human hand.'),
    ],
  },
  {
    part: 'IV',
    title: 'Experience modes compared',
    blocks: [
      diagram('Direct retail vs keepsake vs gifting', `DIRECT RETAIL (A)
Buy → scan → verify → persona → talk → return memory

KEEPSAKE (B)
Personal continuity from soul ledger where supported

GIFTING (C)
Sender scan → confide → receiver scan → deliver digest
Pilot: max two devices per code`),
      p('Forensic product prompts encode Scenario A/B/C internally; user never hears “sender/receiver” labels — illusion discipline.'),
    ],
  },
  {
    part: 'V',
    title: 'Interaction packages',
    blocks: [
      label('Economics Playbook · retail examples', 'scenario'),
      p('Documented package bands: Light (~12 min voice life), Standard (~30 min, starred default), Plus (~45 min), Deep (~60 min). Cloud all-in cost example ~₹27 Standard slot; owned-voice target ~₹5; retail to brand ~₹8–10 with 30–40% margin target after costs — illustrative, not universal contract.'),
      p('Brand journey: prepaid recharge → pick package → generate codes (wallet debits per code) → print → ship → meter on engagement.'),
    ],
  },
  {
    part: 'II',
    title: 'WebAR as entry, not the product',
    blocks: [
      p('MindAR image tracking places persona on packaging in browser — lowers friction vs app install. WebAR is delivery; product is verified identity + persona + memory + economics. AR without gate is marketing; AR after gate is AKXERAI experience layer.'),
    ],
  },
  {
    part: 'II',
    title: 'Voice and the illusion contract',
    blocks: [
      p('Inworld TTS via proxy; persona writes speakable Hinglish; rules forbid breaking character with backend jargon. Pilot fallback: browser speech — not marketed as final quality bar. Voice director seat exists because thin owned-voice migration can break trust.'),
    ],
  },
  {
    part: 'VII',
    title: 'Privacy and the two-device gift rule',
    blocks: [
      p('Gift mode: sender memory not public performance; third phone refused so gift does not become content broadcast. Brand analytics see aggregates — not surveillance of private confessions for unrelated ads. Refusal list includes social graph and marketplace of masks.'),
    ],
  },
  {
    part: 'VIII',
    title: 'Second brand — why repetition matters',
    blocks: [
      label('Future scenario', 'future'),
      p('Second house tests platform transfer: new persona, same gate, ledger, dashboard, bill, manners. Global logo as second brand = wrong test; emotionally adjacent house with small code batch = right test. Myra does not copy-paste — voice director authority required.'),
    ],
  },
]
