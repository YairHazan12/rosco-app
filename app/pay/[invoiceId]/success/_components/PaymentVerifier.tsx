"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { verifyAndUpdatePayment } from "../actions";
import { Loader2 } from "lucide-react";

interface PaymentVerifierProps {
  invoiceId: string;
  transactionReference: string | undefined;
  alreadyPaid: boolean;
  children: React.ReactNode;
}

export default function PaymentVerifier({
  invoiceId,
  transactionReference,
  alreadyPaid,
  children,
}: PaymentVerifierProps) {
  const router = useRouter();
  const [verifying, setVerifying] = useState(!alreadyPaid);
  const [verified, setVerified] = useState(alreadyPaid);

  useEffect(() => {
    if (alreadyPaid) {
      setVerifying(false);
      setVerified(true);
      return;
    }

    async function verify() {
      const result = await verifyAndUpdatePayment(invoiceId, transactionReference);

      if (result.shouldRedirect) {
        router.replace(result.shouldRedirect);
        return;
      }

      setVerified(result.success);
      setVerifying(false);
    }

    verify();
  }, [invoiceId, transactionReference, alreadyPaid, router]);

  if (verifying) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{ background: "var(--bg-primary)" }}
      >
        <div className="text-center">
          <Loader2
            className="w-12 h-12 animate-spin mx-auto mb-4"
            style={{ color: "var(--brand)" }}
          />
          <p
            className="text-[17px] font-medium"
            style={{ color: "var(--label-primary)" }}
          >
            Verifying payment...
          </p>
          <p
            className="text-[14px] mt-1"
            style={{ color: "var(--label-tertiary)" }}
          >
            Please wait a moment
          </p>
        </div>
      </div>
    );
  }

  if (!verified) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{ background: "var(--bg-primary)" }}
      >
        <div className="text-center">
          <p
            className="text-[17px] font-medium"
            style={{ color: "var(--label-primary)" }}
          >
            Payment verification failed
          </p>
          <p
            className="text-[14px] mt-1"
            style={{ color: "var(--label-tertiary)" }}
          >
            Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
