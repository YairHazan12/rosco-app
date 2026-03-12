"use server";

import { getInvoice, updateInvoice } from "@/lib/db";

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
  companyId: string = "DEMO"
): Promise<{ success: boolean; shouldRedirect?: string }> {
  const invoice = await getInvoice(invoiceId, companyId);

  if (!invoice) {
    return { success: false, shouldRedirect: "/404" };
  }

  // Already paid - success
  if (invoice.status === "Paid") {
    return { success: true };
  }

  // No reference - shouldn't be on success page
  if (!transactionReference) {
    return { success: false, shouldRedirect: `/pay/${invoiceId}` };
  }

  // Verify payment with Paystack
  const isVerified = await verifyPaystackTransaction(transactionReference);

  if (isVerified) {
    await updateInvoice(
      invoiceId,
      {
        status: "Paid",
        paidAt: new Date().toISOString(),
        paystackReference: transactionReference,
      },
      companyId
    );
    return { success: true };
  } else {
    return { success: false, shouldRedirect: `/pay/${invoiceId}?error=verification_failed` };
  }
}
