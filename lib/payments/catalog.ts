// Prices in USD. Shared by the pages (for display) and the payment API (as the source of truth).

export type PlanId = "basic" | "premium"
export type BillingCycle = "monthly" | "yearly"

export const PLAN_PRICES_USD: Record<PlanId, Record<BillingCycle, number>> = {
  basic: { monthly: 1, yearly: 10 },
  premium: { monthly: 5, yearly: 50 },
}

export const SESSION_PRICE_USD = 5

export type PaymentProduct =
  | { type: "subscription"; plan: PlanId; billingCycle: BillingCycle }
  | { type: "session"; specialistId: string; timeSlot: string }

export type PaymentAsset = "XLM" | "USDC"

// Validates untrusted input and returns the product with its price, or null if it isn't for sale
export function priceProduct(input: unknown): { product: PaymentProduct; usd: number } | null {
  if (!input || typeof input !== "object") return null
  const p = input as Record<string, unknown>

  if (p.type === "subscription") {
    const plan = p.plan as PlanId
    const billingCycle = p.billingCycle as BillingCycle
    const usd = PLAN_PRICES_USD[plan]?.[billingCycle]
    if (usd === undefined) return null
    return { product: { type: "subscription", plan, billingCycle }, usd }
  }

  if (p.type === "session") {
    if (typeof p.specialistId !== "string" || typeof p.timeSlot !== "string") return null
    if (!p.specialistId || p.specialistId.length > 64 || !p.timeSlot || p.timeSlot.length > 64) return null
    return { product: { type: "session", specialistId: p.specialistId, timeSlot: p.timeSlot }, usd: SESSION_PRICE_USD }
  }

  return null
}
