import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { job: true, items: true },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  // Check if Stripe is configured
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey === "sk_test_placeholder") {
    // Return a mock payment link for demo purposes
    const mockLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pay/${invoice.id}`;
    await prisma.invoice.update({
      where: { id },
      data: { stripePaymentLink: mockLink, status: "Sent" },
    });
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
          product_data: {
            name: item.description,
          },
          unit_amount: Math.round(item.unitPrice * 100),
        },
        quantity: item.quantity,
      })),
      ...(invoice.vatEnabled && {
        automatic_tax: { enabled: false },
      }),
      mode: "payment",
      success_url: `${appUrl}/pay/${invoice.id}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pay/${invoice.id}`,
      metadata: {
        invoiceId: invoice.id,
        clientName: invoice.job.clientName,
      },
      customer_email: invoice.job.clientEmail || undefined,
    });

    await prisma.invoice.update({
      where: { id },
      data: {
        stripePaymentLink: session.url,
        stripeSessionId: session.id,
        status: "Sent",
      },
    });

    return NextResponse.json({ paymentLink: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: "Failed to create payment link" },
      { status: 500 }
    );
  }
}
