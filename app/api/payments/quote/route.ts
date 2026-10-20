import { NextResponse } from "next/server"
import { priceProduct } from "@/lib/payments/catalog"
import { createQuote, PaymentError, paymentErrorResponse } from "@/lib/payments/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { asset, payer } = body

    const priced = priceProduct(body.product)
    if (!priced) throw new PaymentError("Unknown product")
    if (asset !== "XLM" && asset !== "USDC") throw new PaymentError("Unsupported asset")

    const { quote, token } = await createQuote(priced.product, priced.usd, asset, payer)
    return NextResponse.json({ quote, token })
  } catch (error) {
    const { body, status } = paymentErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}
