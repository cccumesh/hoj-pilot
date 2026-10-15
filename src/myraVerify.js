import { askGeminiViaProxy, USE_API_PROXY } from './apiProxy.js'
import { usageFromResponse } from './geminiUsage.js'
import { VERIFY_MODEL_CHAIN } from './geminiModels.js'

const GEMINI_API_KEY = String(import.meta.env.VITE_GEMINI_API_KEY ?? '').trim()
const VERIFY_RETRIES = 1

/** Pilot test card in ledger (code_no 0) — Kotty print. */
export const PILOT_HOJ_TEST_CODE = 'HOJ-KOTTY'

/** Kotty test card — visible "Kotty" branding on physical card. */
export const PILOT_HOJ_KOTTY_CODE = 'HOJ-KOTTY'

/** @deprecated Use PILOT_HOJ_TEST_CODE */
export const PILOT_RICHERA_TEST_CODE = PILOT_HOJ_TEST_CODE

/** @deprecated Use PILOT_HOJ_TEST_CODE */
export const RICHERA_VERIFICATION_CODE = PILOT_HOJ_TEST_CODE

/** 3-layer verify outcomes from Gemini. */
export const VERIFY_FAIL_REASON = {
  REAL: 'REAL',
  PHOTO_SPOOF: 'PHOTO_SPOOF',
  NO_HOJ: 'NO_HOJ',
  BAD_FRAME: 'BAD_FRAME',
  UNCERTAIN: 'UNCERTAIN',
}

/** @deprecated Use VERIFY_FAIL_REASON.NO_HOJ */
VERIFY_FAIL_REASON.NO_RICHERA = VERIFY_FAIL_REASON.NO_HOJ

const VERIFY_SYSTEM = `You are the Akxerai House of Jewels product verifier. Analyze ONE live camera frame.

LAYER 1 — PRODUCT ID (gift box/card in frame):
PASS if ANY of these is clearly visible on the physical product:
  A) "Kotty" branding (pilot test card — maps to ledger code HOJ-KOTTY), OR
  B) "House of Jewels" or "HOJ" branding, OR
  C) A product code starting with HOJ- readable on the card/box (read suffix after HOJ-).

CODE rules when LAYER1 PASS (priority order):
1) If HOJ- is visible with a readable suffix → CODE: the FULL code exactly as printed (example HOJ-9U491S). Uppercase. Keep hyphen after HOJ.
2) Else if Kotty name is visible on the product → CODE: HOJ-KOTTY
3) Else if House of Jewels / HOJ branding only (no readable HOJ- suffix) → CODE: HOJ-KOTTY
Never invent or guess missing HOJ- characters. If HOJ- is visible but suffix too blurry → LAYER1 FAIL.

FAIL LAYER1 if: no Kotty, no House of Jewels/HOJ, and no readable HOJ- code; only partial fragments; must guess the code.

LAYER 2 — LIVENESS (real box/card, not a photo trick):
PASS only if this looks like a REAL physical gift box or card held in front of the camera right now (Richera pilot card or House of Jewels packaging both OK).
FAIL if: product on a phone/tablet/laptop/monitor screen, photo of packaging, screenshot, monitor glare, moiré from photographing a screen.

LAYER 3 — FRAME (proper scan capture):
PASS if the box, card, or packaging is reasonably visible — not extreme crop, not random background only.
FAIL if the product is mostly missing, wrong object, or blur/darkness blocks reading.

OUTPUT FORMAT — reply with exactly these 5 lines and nothing else:
LAYER1: PASS or FAIL
LAYER2: PASS or FAIL
LAYER3: PASS or FAIL
CODE: HOJ-KOTTY or HOJ-XXXXXX or NONE
RESULT: REAL or PHOTO_SPOOF or NO_HOJ or BAD_FRAME or UNCERTAIN

RESULT rules:
- REAL = all three layers PASS and CODE is not NONE
- PHOTO_SPOOF = LAYER2 FAIL
- NO_HOJ = LAYER1 FAIL
- BAD_FRAME = LAYER1 PASS and LAYER3 FAIL
- UNCERTAIN = cannot decide safely or CODE missing when layers pass
Priority if multiple fail: PHOTO_SPOOF > NO_HOJ > BAD_FRAME > UNCERTAIN`

const VERIFY_USER_PROMPT =
  'Run all 3 verification layers. Read Kotty OR House of Jewels branding OR the full HOJ- code from the box/card. Kotty or HOJ-only branding → CODE HOJ-KOTTY. HOJ- suffix readable → full HOJ- code. Reply with LAYER1, LAYER2, LAYER3, CODE, and RESULT only.'

let geminiClient = null

async function getGeminiClient() {
  if (USE_API_PROXY || !GEMINI_API_KEY) return null
  if (!geminiClient) {
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    geminiClient = new GoogleGenerativeAI(GEMINI_API_KEY)
  }
  return geminiClient
}

export function isGeminiVerifyConfigured() {
  return USE_API_PROXY || Boolean(GEMINI_API_KEY)
}

function parseDataUrl(dataUrl) {
  const match = String(dataUrl).match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return null
  return { mimeType: match[1], data: match[2] }
}

function compressImageForVerify(dataUrl, maxSize = 768) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const width = Math.max(1, Math.round(img.width * scale))
      const height = Math.max(1, Math.round(img.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(dataUrl)
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

function normalizeFailReason(value) {
  const key = String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_')

  if (key === 'REAL') return VERIFY_FAIL_REASON.REAL
  if (key === 'PHOTO_SPOOF' || key === 'PHOTO' || key === 'SPOOF') {
    return VERIFY_FAIL_REASON.PHOTO_SPOOF
  }
  if (key === 'NO_HOJ' || key === 'NOHOJ' || key === 'NO_RICHERA' || key === 'NORICHERA' || key === 'FALSE') {
    return VERIFY_FAIL_REASON.NO_HOJ
  }
  if (key === 'BAD_FRAME' || key === 'BADFRAME' || key === 'FRAME') {
    return VERIFY_FAIL_REASON.BAD_FRAME
  }
  if (key === 'UNCERTAIN' || key === 'UNKNOWN') return VERIFY_FAIL_REASON.UNCERTAIN
  return null
}

export function normalizeVerificationCode(raw) {
  let text = String(raw ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')

  if (!text || text === 'NONE') return null
  if (text === 'HOJRICHER' || text === 'RICHERA') return PILOT_HOJ_KOTTY_CODE
  if (text === 'HOJKOTTY') return PILOT_HOJ_KOTTY_CODE
  if (text.startsWith('HOJ') && !text.startsWith('HOJ-')) {
    text = `HOJ-${text.slice(3)}`
  }
  if (text === PILOT_HOJ_TEST_CODE) return PILOT_HOJ_TEST_CODE
  if (text === PILOT_HOJ_KOTTY_CODE) return PILOT_HOJ_KOTTY_CODE
  if (/^HOJ-[A-Z0-9]{4,8}$/.test(text)) return text
  return null
}

export function parseVerifyResponse(text) {
  const raw = String(text ?? '').trim()
  const resultMatch = raw.match(
    /RESULT:\s*(REAL|PHOTO[_\s-]?SPOOF|NO[_\s-]?(?:HOJ|RICHERA)|BAD[_\s-]?FRAME|UNCERTAIN)/i,
  )
  const codeMatch = raw.match(/CODE:\s*(\S+)/i)
  const failReason = normalizeFailReason(resultMatch?.[1]) ?? VERIFY_FAIL_REASON.UNCERTAIN
  const verificationCode = normalizeVerificationCode(codeMatch?.[1])

  if (failReason === VERIFY_FAIL_REASON.REAL) {
    if (!verificationCode) {
      return { verified: false, failReason: VERIFY_FAIL_REASON.UNCERTAIN, verificationCode: null }
    }
    return { verified: true, failReason: VERIFY_FAIL_REASON.REAL, verificationCode }
  }

  return { verified: false, failReason, verificationCode: null }
}

async function askGeminiVerify(imagePart) {
  const generationConfig = { temperature: 0, topP: 0.8 }

  if (USE_API_PROXY) {
    const payload = await askGeminiViaProxy({
      userPrompt: VERIFY_USER_PROMPT,
      systemInstruction: VERIFY_SYSTEM,
      models: VERIFY_MODEL_CHAIN,
      imagePart,
      generationConfig,
    })
    return {
      parsed: parseVerifyResponse(payload.text),
      model: payload.model,
      usage: payload.usage,
    }
  }

  const client = await getGeminiClient()
  if (!client) {
    throw new Error('Gemini not configured — add VITE_GEMINI_API_KEY for verify')
  }

  let lastError = null

  for (const modelName of VERIFY_MODEL_CHAIN) {
    for (let attempt = 1; attempt <= VERIFY_RETRIES; attempt += 1) {
      try {
        const model = client.getGenerativeModel({
          model: modelName,
          systemInstruction: VERIFY_SYSTEM,
          generationConfig,
        })

        const parts = [
          {
            inlineData: {
              mimeType: imagePart.mimeType,
              data: imagePart.data,
            },
          },
          { text: VERIFY_USER_PROMPT },
        ]

        const result = await model.generateContent({ contents: [{ role: 'user', parts }] })
        const text = result.response.text()
        return {
          parsed: parseVerifyResponse(text),
          model: modelName,
          usage: usageFromResponse(result.response),
        }
      } catch (error) {
        lastError = error
        console.warn(`[Verify] ${modelName} attempt ${attempt} failed`, error)
      }
    }
  }

  throw lastError ?? new Error('Gemini verify failed')
}

/** Backend gate: 3-layer verify — REAL passes with ledger verification_code from box/card. */
export async function verifyHojProduct(imageDataUrl) {
  const compressed = await compressImageForVerify(imageDataUrl)
  const imagePart = parseDataUrl(compressed)
  if (!imagePart) {
    throw new Error('Scan frame could not be encoded')
  }

  const { parsed, model, usage } = await askGeminiVerify(imagePart)
  const { verified, failReason, verificationCode } = parsed

  return {
    verified,
    verificationCode: verified ? verificationCode : null,
    failReason: verified ? VERIFY_FAIL_REASON.REAL : failReason,
    usage,
    model,
  }
}

/** @deprecated Use verifyHojProduct */
export const verifyRicheraProduct = verifyHojProduct
