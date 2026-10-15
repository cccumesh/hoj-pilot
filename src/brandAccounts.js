import { supabase } from './supabaseClient.js'

export const DEFAULT_BRAND_SLUG = 'house-of-jewels'
export const BRAND_WALLET_VIEW = 'brand_wallet_snapshot'

export async function fetchBrandAccount(brandSlug = DEFAULT_BRAND_SLUG) {
  if (!supabase || !brandSlug) return null

  const { data, error } = await supabase
    .from('brand_accounts')
    .select(
      'brand_slug, brand_label, axerai_ai_balance, axerai_voice_balance, per_code_ai_budget, per_code_voice_budget, account_mode, codes_allocated',
    )
    .eq('brand_slug', brandSlug)
    .maybeSingle()

  if (error) {
    console.warn('[Brand] account fetch failed:', error.message)
    return null
  }

  return data
}

/** Live wallet — pools + used + remaining from DB view (not UI math). */
export async function fetchBrandWalletSnapshot(brandSlug = DEFAULT_BRAND_SLUG) {
  if (!supabase || !brandSlug) return null

  const { data, error } = await supabase
    .from(BRAND_WALLET_VIEW)
    .select(
      'brand_slug, axerai_ai_pool, axerai_voice_pool, per_code_ai_cap, per_code_voice_cap, axerai_ai_used, axerai_voice_used, axerai_ai_remaining, axerai_voice_remaining',
    )
    .eq('brand_slug', brandSlug)
    .maybeSingle()

  if (error) {
    console.warn('[Brand] wallet snapshot fetch failed:', error.message)
    return null
  }

  return data
}

export function walletSnapshotToDashboard(wallet) {
  if (!wallet) return null
  return {
    aiBalance: Number(wallet.axerai_ai_pool) || 0,
    voiceBalance: Number(wallet.axerai_voice_pool) || 0,
    aiUsed: Number(wallet.axerai_ai_used) || 0,
    voiceUsed: Number(wallet.axerai_voice_used) || 0,
    aiRemaining: Number(wallet.axerai_ai_remaining) || 0,
    voiceRemaining: Number(wallet.axerai_voice_remaining) || 0,
    perCodeAiCap: Number(wallet.per_code_ai_cap) || 0,
    perCodeVoiceCap: Number(wallet.per_code_voice_cap) || 0,
  }
}
