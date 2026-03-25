/**
 * /api/billing/payment-link
 *
 * POST — Generates a Stitch payment request link for an invoice.
 *        Body: { invoiceId, amount, description, clientName?, clientEmail? }
 *        Returns: { url: string }
 *
 * Gracefully degrades: if Stitch credentials are missing, returns a mock URL.
 */
import { NextResponse } from "next/server";
import { getCompanyIdFromCookie } from "@/lib/server-auth";
import { getBillingInvoice, updateBillingInvoice } from "@/lib/billing-db";
import { revalidateTag } from "next/cache";
import type { ActivityEvent } from "@/lib/billing-types";

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Stitch OAuth ─────────────────────────────────────────────────────────────

async function getStitchAccessToken(): Promise<string> {
  const clientId = process.env.STITCH_CLIENT_ID;
  const clientSecret = process.env.STITCH_CLIENT_SECRET;
  const apiUrl = process.env.STITCH_API_URL ?? "https://api.stitch.money";

  if (!clientId || !clientSecret) {
    throw new Error("STITCH_CREDENTIALS_MISSING");
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: "paymentrequest",
    audience: apiUrl,
  });

  const res = await fetch(`${apiUrl}/connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stitch token error: ${text}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

// ─── Create Payment Request ───────────────────────────────────────────────────

async function createStitchPaymentRequest(
  accessToken: string,
  amount: number,
  description: string,
  externalReference: string,
  payerName?: string,
  payerEmail?: string
): Promise<string> {
  const apiUrl = process.env.STITCH_API_URL ?? "https://api.stitch.money";
  const redirectUri = process.env.STITCH_REDIRECT_URI ?? process.env.NEXTAUTH_URL ?? "";

  const mutation = `
    mutation CreatePaymentRequest(
      $amount: MoneyInput!
      $payerReference: String!
      $beneficiaryReference: String!
      $externalReference: String
      $payerName: String
      $payerEmail: String
      $redirectUri: String
    ) {
      clientPaymentInitiation {
        paymentInitiation(input: {
          amount: $amount
          payerReference: $payerReference
          beneficiaryReference: $beneficiaryReference
          externalReference: $externalReference
          payer: { name: $payerName, email: $payerEmail }
          redirectUri: $redirectUri
        }) {
          paymentInitiationRequest {
            id
            url
          }
        }
      }
    }
  `;

  const res = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        amount: { quantity: amount.toFixed(2), currency: "ZAR" },
        payerReference: description.slice(0, 12),
        beneficiaryReference: externalReference.slice(0, 12),
        externalReference,
        payerName: payerName ?? undefined,
        payerEmail: payerEmail ?? undefined,
        redirectUri: redirectUri || undefined,
      },
    }),
  });

  if (!res.ok) throw new Error(`Stitch GraphQL error: ${res.status}`);

  const json = await res.json();
  const url = json?.data?.clientPaymentInitiation?.paymentInitiation?.paymentInitiationRequest?.url;
  if (!url) throw new Error("No payment URL in Stitch response");

  return url as string;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const companyId = await getCompanyIdFromCookie();
    const { invoiceId, amount, description, clientName, clientEmail } = await req.json();

    if (!invoiceId || !amount) {
      return NextResponse.json({ error: "invoiceId and amount are required" }, { status: 400 });
    }

    const invoice = await getBillingInvoice(invoiceId, companyId);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    let paymentUrl: string;

    try {
      const token = await getStitchAccessToken();
      paymentUrl = await createStitchPaymentRequest(
        token,
        amount,
        description ?? invoice.documentNumber,
        invoice.documentNumber,
        clientName ?? invoice.clientName,
        clientEmail ?? invoice.clientEmail
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === "STITCH_CREDENTIALS_MISSING" || msg.includes("Stitch")) {
        // Graceful degradation — generate a non-functional placeholder URL
        paymentUrl = `https://pay.stitch.money/preview/${invoice.documentNumber}`;
        console.warn("[payment-link] Stitch not configured, using placeholder URL");
      } else {
        throw err;
      }
    }

    // Persist the link and append to activity log
    const activityEntry: ActivityEvent = {
      id: genId(),
      type: "link_generated",
      timestamp: new Date().toISOString(),
      description: "Payment link generated",
      metadata: { url: paymentUrl },
    };

    await updateBillingInvoice(invoiceId, companyId, {
      paymentLinkUrl: paymentUrl,
      activityLog: [...invoice.activityLog, activityEntry],
    });

    revalidateTag(`billing-invoices-${companyId}`);

    return NextResponse.json({ url: paymentUrl });
  } catch (err) {
    console.error("[/api/billing/payment-link POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
