import { NextResponse } from "next/server"
import { PaymentError, paymentErrorResponse, verifyPayment } from "@/lib/payments/server"
import { tryAwardPurchaseRewards } from "@/lib/stellar/admin"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const payment = await verifyPayment(body.token, body.txHash)
    if (payment.product.type !== "subscription") throw new PaymentError("Payment is not for a subscription")

    const { plan, billingCycle } = payment.product
    const subscription = {
      id: `sub_${payment.txHash.substring(0, 16)}`,
      wallet: payment.payer,
      plan,
      billingCycle,
      amountUsd: payment.usd,
      paid: { asset: payment.asset, amount: payment.amount, txHash: payment.txHash },
      status: "active",
      startDate: new Date(),
      nextBillingDate: new Date(Date.now() + (billingCycle === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000),
    }

    const rewards = await tryAwardPurchaseRewards(payment.payer, payment.usd, payment.txHash)

    return NextResponse.json({ success: true, subscription, rewards })
  } catch (error) {
    const { body, status } = paymentErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}
