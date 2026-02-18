import { NextResponse } from "next/server";
import { getInvoice, updateInvoice } from "@/lib/db";
import Stripe from "stripe";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey === "sk_test_placeholder") {
    const mockLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pay/${invoice.id}`;
    await updateInvoice(id, { stripePaymentLink: mockLink, status: "Sent" });
    return NextResponse.json({ paymentLink: mockLink });
  }

  try {
    const stripe = new Stripe(stripeKey);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: invoice.items.map((item) => ({
        price_data: {
          currency: "ils",
          product_data: { name: item.description },
          unit_amount: Math.round(item.unitPrice * 100),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${appUrl}/pay/${invoice.id}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pay/${invoice.id}`,
      metadata: { invoiceId: invoice.id },
      customer_email: invoice.clientEmail || undefined,
    });

    await updateInvoice(id, {
      stripePaymentLink: session.url!,
      stripeSessionId: session.id,
      status: "Sent",
    });

    return NextResponse.json({ paymentLink: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Stripe error" }, { status: 500 });
  }
}
