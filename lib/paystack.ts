/**
 * Paystack API helpers - Server-side only
 * DO NOT import this file in client components
 */

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_API_BASE = "https://api.paystack.co";

if (!PAYSTACK_SECRET_KEY) {
  console.warn("⚠️  PAYSTACK_SECRET_KEY not set - subaccount creation will fail");
}

export interface CreateSubaccountParams {
  businessName: string;
  settlementBank: string;     // Bank code (e.g., "044" for Access Bank)
  accountNumber: string;
  description?: string;
}

export interface PaystackSubaccount {
  subaccount_code: string;
  business_name: string;
  settlement_bank: string;
  account_number: string;
  percentage_charge?: number;
  description: string;
  is_verified: boolean;
  currency: string;
}

export interface PaystackErrorResponse {
  status: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaystackSuccessResponse {
  status: true;
  message: string;
  data: PaystackSubaccount;
}

/**
 * Create a Paystack subaccount for a company
 * Platform revenue split: 5% to ROSCO, 95% to company
 * @returns Subaccount code (e.g., "ACCT_xxxxxxxxxx")
 */
export async function createPaystackSubaccount(
  params: CreateSubaccountParams
): Promise<PaystackSubaccount> {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("Paystack secret key not configured");
  }

  const response = await fetch(`${PAYSTACK_API_BASE}/subaccount`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      business_name: params.businessName,
      settlement_bank: params.settlementBank,
      account_number: params.accountNumber,
      percentage_charge: 5, // Platform (ROSCO) keeps 5%, company receives 95%
      description: params.description || `ROSCO Platform - ${params.businessName}`,
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.status) {
    const errorMsg = (result as PaystackErrorResponse).message || "Failed to create subaccount";
    const errors = (result as PaystackErrorResponse).errors;
    
    if (errors) {
      const errorDetails = Object.entries(errors)
        .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
        .join("; ");
      throw new Error(`${errorMsg}: ${errorDetails}`);
    }
    
    throw new Error(errorMsg);
  }

  return (result as PaystackSuccessResponse).data;
}

/**
 * Get list of supported banks from Paystack
 * Useful for populating bank selection dropdowns
 */
export async function getPaystackBanks(): Promise<Array<{ name: string; code: string }>> {
  if (!PAYSTACK_SECRET_KEY) {
    return [];
  }

  try {
    const response = await fetch(`${PAYSTACK_API_BASE}/bank?currency=ZAR`, {
      headers: {
        "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const result = await response.json();
    
    if (result.status && result.data) {
      return result.data.map((bank: any) => ({
        name: bank.name,
        code: bank.code,
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Failed to fetch banks:", error);
    return [];
  }
}
