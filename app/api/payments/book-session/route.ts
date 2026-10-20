import { NextResponse } from "next/server"
import { PaymentError, paymentErrorResponse, verifyPayment } from "@/lib/payments/server"
import { tryAwardPurchaseRewards } from "@/lib/stellar/admin"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const payment = await verifyPayment(body.token, body.txHash)
    if (payment.product.type !== "session") throw new PaymentError("Payment is not for a session")

    const { specialistId, timeSlot } = payment.product
    const booking = {
      id: `booking_${payment.txHash.substring(0, 16)}`,
      wallet: payment.payer,
      specialistId,
      timeSlot,
      amountUsd: payment.usd,
      paid: { asset: payment.asset, amount: payment.amount, txHash: payment.txHash },
      status: "confirmed",
      meetingLink: `https://meet.stoneale.com/${payment.txHash.substring(0, 16)}`,
      createdAt: new Date(),
    }

    const rewards = await tryAwardPurchaseRewards(payment.payer, payment.usd, payment.txHash)

    return NextResponse.json({ success: true, booking, rewards })
  } catch (error) {
    const { body, status } = paymentErrorResponse(error)
    return NextResponse.json(body, { status })
  }
}
