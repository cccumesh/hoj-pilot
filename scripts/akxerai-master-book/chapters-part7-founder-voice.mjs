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

/**
 * Founder moments from documented Cursor build sessions (Jul–Aug 2026).
 * Not invented customer stories — founder + product-build diary.
 */
export const chaptersPart7 = [
  {
    part: 'VI',
    title: 'Founder voice — why this chapter exists',
    blocks: [
      label('Build diary · Cursor sessions with Chetan · supplements PDFs', 'pilot'),
      p('The master book is grounded first in Founder Foundation, Blueprint, Economics, Backend, MVP, and provisional specification. But AKXERAI was also shaped in long build sessions — memory bugs, voice tuning, prompt fights, and moments when the founder said what the company must become. Those lines are not marketing. They are how the product thinking was pressure-tested.'),
      p('This chapter records only what the founder actually said or clearly intended in those sessions — not fake shop dialogue, not invented pilot revenue. Where the founder planned a personal gift test (sender story for someone close), it is described as <em>product intent and rehearsal</em>, not as a published case study outcome unless a source later documents it.'),
    ],
  },
  {
    part: 'VI',
    title: 'Pehli baar — “Myra sahi track pe thi”',
    kicker: 'Moment · July 2026',
    blocks: [
      label('Founder words · after a strong sender session', 'pilot'),
      p('After one of the first long Hinglish conversations — Chetan, gift-for, occasion, story beats landing — the founder wrote in plain language that the chat finally felt fun, that for the first time it seemed Myra was on the right track. Not perfect. Not every scan. But a class of moment: the persona stopped feeling like a form and started feeling like a bindaas dost on the product.'),
      pull('Infrastructure is built in the weeks when the founder can say: pehli baar laga sahi track pe hai — and then asks why the next scan broke it.'),
      p('The book treats that feeling as the emotional bar for the pilot: not “AI spoke,” but “a human would tell a friend about this.” Every later chapter on memory, voice volume, and receiver drip exists because that bar slipped on the very next scan when summaries contradicted locked facts.'),
    ],
  },
  {
    part: 'VI',
    title: 'When memory betrayed the magic',
    blocks: [
      p('Documented frustration — not abstract QA: the system “knew” sender name and gift-for from a long session, yet opened the next scan by asking again kiske liye liya. The founder’s reaction was not polite bug report language; it was personal — <em>pata hai, fir bhi puch rahi hai</em>. That sentence belongs in company history because it redirected architecture: separate locked profile from noisy per-scan hooks; boot versus return; soul ledger digest instead of repeating OPEN HOOK traps.'),
      p('Lesson written into the product ethic: if memory humiliates the user, the brand is embarrassed too. Trust is not a feature slide. It is the moment the persona remembers without interrogating.'),
    ],
  },
  {
    part: 'VI',
    title: '“Prompt rulebook lag rahi hai — Myra kahan hai?”',
    kicker: 'Moment · August 2026',
    blocks: [
      label('Founder critique of over-templated prompts', 'pilot'),
      p('Mid-build, the founder said the prompt had started to feel like a rulebook — core concept and Myra’s personality were missing. What he wanted back: natkhat tang khichai, thodi masti, smart and romantic when the moment earns it, ghussa when the user deserves a roast — comedy poori chat, not therapist, not courier narrator.'),
      p('That critique led to concept-based prompts (welcome / drip / delivery recipes) instead of mandate stacks — a company decision that belongs in the book because it explains why AKXERAI refuses to sound like a call centre even when enterprise buyers ask for “safe.”'),
    ],
  },
  {
    part: 'VI',
    title: 'Receiver reveal — the scene in the founder’s head',
    blocks: [
      label('Product intent · documented in build sessions', 'pilot'),
      p('The founder described the receiver scan as ceremony, not interview: celebrate occasion first; Myra introduces as Richera soul; emotional hook that the bracelet holds someone’s love; permission before drip — <em>jaanna chahogi usne kya bataya?</em> Only when the recipient asks does Myra deliver sender facts in fresh Hinglish, not quote dump. Brand flex and experience flex blend — technology invisible, wonder visible.'),
      p('This is the gifting-mode north star for jewellery and keepsake launches. Direct retail uses the same persona infrastructure with a different memory shape — perfume buyer does not need a sender seat to get brand story and club cross-sell in the long vision.'),
    ],
  },
  {
    part: 'VI',
    title: 'The vision chat — perfume, club, first-party data',
    kicker: 'August 2026',
    blocks: [
      label('Founder stated company goal · not achieved market fact', 'pilot'),
      p('In a documented August 2026 session the founder separated what was being built in the repo from what AKXERAI must become: every physical product with its own code; scan activates the brand’s living voice; post-purchase facts, cross-sell, club join, first-party relationship — not third-party ad noise. Sender → receiver gift flow is real work in progress, but in the founder’s words it is also <strong>market entry ticket</strong> — scan rate, habit, magic moment — not the full definition of the company.'),
      pull('Asli company: purchase ke baad product silent nahi — brand ko pata chale kaun, kya pucha, kya feel hua, kis unit ne interaction generate kiya.'),
      p('Sequence he named: polish gift flow in this codebase → scale codes toward HOJ pilot readiness → wedge opens market → core platform (retail scan, per-code memory, wallet) carries the business. The master book architecture chapters follow this clarification; they do not treat gifting as the only AKXERAI story.'),
    ],
  },
  {
    part: 'VI',
    title: 'Wapas is repo par — jab pilot project toota',
    blocks: [
      p('Documented context: a separate pilot-ready HOJ codebase was damaged when chat misapplied changes to core files; the founder returned to the richera build to finish sender/receiver correctly before regenerating hundreds of codes for House of Jewels. That is not drama for investors — it is why October 2026 shows a founder with a system and a choice, not a crowd. The feeling: idea zyada bada hai, week chhota hai — scope large in head, narrow in the next proof.'),
    ],
  },
  {
    part: 'IX',
    title: 'Sapna — “is par AKXERAI hona chahiye tha”',
    blocks: [
      label('Standard thesis · founder aspiration', 'future'),
      p('Across PDFs and build sessions the same end emotion appears: a customer opens a premium box and, if nothing lives on the object, something feels missing — <em>arre yaar, is par AKXERAI hona chahiye tha</em>. That is not a claim that the market already expects powered-by AKXERAI. It is the founder’s name for the standard the company is trying to earn — one verified unit, one honest conversation, one recharge at a time.'),
      h2('2031 building — dream as blueprint, not deed'),
      p('Earlier company-book material walks a future headquarters: platform floor running the door, studio floor refusing copied personas, trust floor with spoof clusters, revenue floor with category price floors printed on the wall. The founder may imagine walking that building because the original idea survived pilots, failures, fixes, and discipline — not because the lease is signed. Label: <strong>FUTURE VISION</strong>.'),
      pull('Sapna standard ka hai. Proof pilot ka hai. Book dono ko alag rakhti hai taaki reader confuse na ho.'),
    ],
  },
  {
    part: 'IX',
    title: 'What the founder refused to optimize for',
    blocks: [
      p('From build sessions and company philosophy combined: do not become surveillance; do not stage fake receivers for virality; do not seat a third phone to inflate scans; do not pass screenshots through the gate for a campaign; do not sell the company for a logo deal that steals the ledger. The feeling behind refusals is personal — the gift must stay private, the object must stay real, the persona must stay human.'),
      p('That is the emotional core the reader should carry: someone had an idea → built through nights of broken memory and quiet fixes → wants physical products to carry relationship → asks if it can scale without lying about what already happened.'),
    ],
  },
]
