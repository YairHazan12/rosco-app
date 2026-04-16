import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { put } from "@vercel/blob";
import { getCompanyIdFromCookie } from "@/lib/server-auth";
import { getBillingInvoice, getQuote, updateBillingInvoice, updateQuote } from "@/lib/billing-db";
import { InvoicePDF, QuotePDF } from "@/lib/pdf-templates";

export const dynamic = "force-dynamic";

/**
 * POST /api/billing/generate-pdf
 * Generate PDF for invoice or quote, upload to Vercel Blob, and return URL
 * Body: { docType: "invoice" | "quote", id: string }
 */
export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyIdFromCookie();
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { docType, id } = await request.json();

    if (!docType || !id) {
      return NextResponse.json(
        { error: "Missing docType or id" },
        { status: 400 }
      );
    }

    if (docType !== "invoice" && docType !== "quote") {
      return NextResponse.json(
        { error: "Invalid docType. Must be 'invoice' or 'quote'" },
        { status: 400 }
      );
    }

    // Fetch the document
    let document;
    let pdfComponent;
    let filename;

    if (docType === "invoice") {
      document = await getBillingInvoice(id, companyId);
      if (!document) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }
      pdfComponent = InvoicePDF({ invoice: document });
      filename = `${document.documentNumber}_${document.clientName.replace(/\s+/g, "_")}.pdf`;
    } else {
      document = await getQuote(id, companyId);
      if (!document) {
        return NextResponse.json({ error: "Quote not found" }, { status: 404 });
      }
      pdfComponent = QuotePDF({ quote: document });
      filename = `${document.documentNumber}_${document.clientName.replace(/\s+/g, "_")}.pdf`;
    }

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(pdfComponent);

    // Upload to Vercel Blob
    const blob = await put(filename, pdfBuffer, {
      access: "public",
      contentType: "application/pdf",
    });

    // Update document with PDF URL
    if (docType === "invoice") {
      await updateBillingInvoice(id, companyId, { pdfUrl: blob.url });
    } else {
      await updateQuote(id, companyId, { pdfUrl: blob.url });
    }

    return NextResponse.json({
      url: blob.url,
      filename,
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/billing/generate-pdf?docType=invoice&id=xxx
 * Generate and download PDF directly (no storage)
 */
export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyIdFromCookie();
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const docType = searchParams.get("docType");
    const id = searchParams.get("id");

    if (!docType || !id) {
      return NextResponse.json(
        { error: "Missing docType or id" },
        { status: 400 }
      );
    }

    if (docType !== "invoice" && docType !== "quote") {
      return NextResponse.json(
        { error: "Invalid docType. Must be 'invoice' or 'quote'" },
        { status: 400 }
      );
    }

    // Fetch the document
    let document;
    let pdfComponent;
    let filename;

    if (docType === "invoice") {
      document = await getBillingInvoice(id, companyId);
      if (!document) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }
      pdfComponent = InvoicePDF({ invoice: document });
      filename = `${document.documentNumber}_${document.clientName.replace(/\s+/g, "_")}.pdf`;
    } else {
      document = await getQuote(id, companyId);
      if (!document) {
        return NextResponse.json({ error: "Quote not found" }, { status: 404 });
      }
      pdfComponent = QuotePDF({ quote: document });
      filename = `${document.documentNumber}_${document.clientName.replace(/\s+/g, "_")}.pdf`;
    }

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(pdfComponent);

    // Return PDF as downloadable file
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
