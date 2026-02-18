import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Wrench } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ invoiceId: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { invoiceId } = await params;
  const { session_id } = await searchParams;

  // Mark invoice as paid
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { job: true },
  });

  if (!invoice) notFound();

  // Update to paid if not already
  if (invoice.status !== "Paid") {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "Paid",
        paidAt: new Date(),
        ...(session_id && { stripeSessionId: session_id }),
      },
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Wrench className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-gray-900">ROSCO</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-500 mb-1">
            Thank you, <strong>{invoice.job.clientName}</strong>
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Your payment has been received. We appreciate your business!
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500">Invoice</p>
            <p className="font-mono text-sm font-medium">
              #{invoice.id.slice(-8).toUpperCase()}
            </p>
            <p className="text-lg font-bold text-green-600 mt-1">
              ₪{invoice.total.toFixed(2)}
            </p>
          </div>

          <Link
            href={`/pay/${invoiceId}`}
            className="text-sm text-blue-500 hover:underline"
          >
            View Invoice →
          </Link>
        </div>
      </div>
    </div>
  );
}
