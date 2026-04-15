"use server";

import { getInvoiceById, updateInvoice } from "@/lib/db";
import { getBillingInvoiceById, updateBillingInvoice } from "@/lib/billing-db";

async function verifyPaystackTransaction(reference: string): Promise<boolean> {
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecret) {
    console.error("PAYSTACK_SECRET_KEY not configured");
    return false;
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to verify Paystack transaction");
      return false;
    }

    const data = await response.json();
    return data.status && data.data.status === "success";
  } catch (error) {
    console.error("Error verifying Paystack transaction:", error);
    return false;
  }
}

export async function verifyAndUpdatePayment(
  invoiceId: string,
  transactionReference: string | undefined,
): Promise<{ success: boolean; shouldRedirect?: string }> {
  const legacyInvoice = await getInvoiceById(invoiceId);
  const billingInvoice = legacyInvoice ? null : await getBillingInvoiceById(invoiceId);

  if (!legacyInvoice && !billingInvoice) {
    return { success: false, shouldRedirect: "/404" };
  }

  // Already paid - success
  if (legacyInvoice?.status === "Paid" || billingInvoice?.status === "paid") {
    return { success: true };
  }

  // No reference - shouldn't be on success page
  if (!transactionReference) {
    return { success: false, shouldRedirect: `/pay/${invoiceId}` };
  }

  // Verify payment with Paystack
  const isVerified = await verifyPaystackTransaction(transactionReference);

  if (isVerified) {
    const paidAt = new Date().toISOString();

    if (legacyInvoice) {
      await updateInvoice(
        invoiceId,
        {
          status: "Paid",
          paidAt,
          paystackReference: transactionReference,
        },
        legacyInvoice.companyId
      );
    } else if (billingInvoice) {
      await updateBillingInvoice(invoiceId, billingInvoice.companyId, {
        status: "paid",
        amountPaid: billingInvoice.total,
        amountOutstanding: 0,
        activityLog: [
          ...(billingInvoice.activityLog ?? []),
          {
            id: Math.random().toString(36).slice(2, 10),
            type: "paid",
            timestamp: paidAt,
            description: `Invoice ${billingInvoice.documentNumber} paid`,
            metadata: { transactionReference },
          },
        ],
      });
    }
    return { success: true };
  } else {
    return { success: false, shouldRedirect: `/pay/${invoiceId}?error=verification_failed` };
  }
}
