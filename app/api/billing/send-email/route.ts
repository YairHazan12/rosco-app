import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import { getCompanyIdFromCookie } from "@/lib/server-auth";
import { getBillingInvoice, getQuote } from "@/lib/billing-db";
import { InvoicePDF, QuotePDF } from "@/lib/pdf-templates";
import { formatZAR, formatDate } from "@/lib/billing-types";

export const dynamic = "force-dynamic";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
}

/**
 * POST /api/billing/send-email
 * Send invoice or quote via email with PDF attachment
 * Body: { docType: "invoice" | "quote", id: string, recipientEmail?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyIdFromCookie();
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { docType, id, recipientEmail } = await request.json();

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
    let subject;
    let htmlBody;
    let toEmail;

    if (docType === "invoice") {
      document = await getBillingInvoice(id, companyId);
      if (!document) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }
      
      toEmail = recipientEmail || document.clientEmail;
      if (!toEmail) {
        return NextResponse.json(
          { error: "No email address available for this client" },
          { status: 400 }
        );
      }

      pdfComponent = InvoicePDF({ invoice: document });
      filename = `${document.documentNumber}_${document.clientName.replace(/\s+/g, "_")}.pdf`;
      subject = `Invoice ${document.documentNumber} – ${document.title}`;
      
      htmlBody = `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0F1A14; margin-bottom: 8px;">Invoice ${document.documentNumber}</h2>
          <p style="color: #7A8F82; font-size: 14px; margin-bottom: 24px;">Hi ${document.clientName},</p>
          
          <p style="color: #1C2B22; line-height: 1.6; margin-bottom: 16px;">
            Please find your invoice attached.
          </p>
          
          <div style="background: #F5F8F6; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #7A8F82; font-size: 13px; padding: 8px 0;">Document Number:</td>
                <td style="color: #0F1A14; font-weight: 600; text-align: right; padding: 8px 0;">${document.documentNumber}</td>
              </tr>
              <tr>
                <td style="color: #7A8F82; font-size: 13px; padding: 8px 0;">Issue Date:</td>
                <td style="color: #0F1A14; text-align: right; padding: 8px 0;">${formatDate(document.issueDate)}</td>
              </tr>
              <tr>
                <td style="color: #7A8F82; font-size: 13px; padding: 8px 0;">Due Date:</td>
                <td style="color: #F07028; font-weight: 600; text-align: right; padding: 8px 0;">${formatDate(document.dueDate)}</td>
              </tr>
              <tr style="border-top: 2px solid #E5E5E5;">
                <td style="color: #0F1A14; font-size: 16px; font-weight: 700; padding: 12px 0 8px;">Amount Due:</td>
                <td style="color: #F07028; font-size: 20px; font-weight: 700; text-align: right; padding: 12px 0 8px;">${formatZAR(document.amountOutstanding)}</td>
              </tr>
            </table>
          </div>

          ${document.paymentLinkUrl ? `
          <div style="margin: 24px 0;">
            <a href="${document.paymentLinkUrl}" style="display: inline-block; background: #4A80FF; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">
              Pay Online
            </a>
          </div>
          ` : ''}

          ${document.bankName ? `
          <div style="margin: 24px 0; padding: 16px; background: white; border: 1px solid #E5E5E5; border-radius: 8px;">
            <p style="color: #7A8F82; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Banking Details</p>
            <table style="width: 100%; font-size: 13px;">
              ${document.bankName ? `<tr><td style="color: #7A8F82; padding: 4px 0;">Bank:</td><td style="color: #1C2B22;">${document.bankName}</td></tr>` : ''}
              ${document.bankAccountHolder ? `<tr><td style="color: #7A8F82; padding: 4px 0;">Account Holder:</td><td style="color: #1C2B22;">${document.bankAccountHolder}</td></tr>` : ''}
              ${document.bankAccountNumber ? `<tr><td style="color: #7A8F82; padding: 4px 0;">Account Number:</td><td style="color: #1C2B22;">${document.bankAccountNumber}</td></tr>` : ''}
              ${document.branchCode ? `<tr><td style="color: #7A8F82; padding: 4px 0;">Branch Code:</td><td style="color: #1C2B22;">${document.branchCode}</td></tr>` : ''}
            </table>
          </div>
          ` : ''}

          ${document.notes ? `
          <p style="color: #7A8F82; font-size: 13px; line-height: 1.6; margin: 24px 0;">
            ${document.notes}
          </p>
          ` : ''}

          <p style="color: #1C2B22; margin-top: 32px;">Thank you for your business!</p>
          
          ${document.companyEmail ? `
          <p style="color: #7A8F82; font-size: 13px; margin-top: 8px;">
            ${document.companyEmail}
          </p>
          ` : ''}
        </div>
      `;
    } else {
      // Quote
      document = await getQuote(id, companyId);
      if (!document) {
        return NextResponse.json({ error: "Quote not found" }, { status: 404 });
      }

      toEmail = recipientEmail || document.clientEmail;
      if (!toEmail) {
        return NextResponse.json(
          { error: "No email address available for this client" },
          { status: 400 }
        );
      }

      pdfComponent = QuotePDF({ quote: document });
      filename = `${document.documentNumber}_${document.clientName.replace(/\s+/g, "_")}.pdf`;
      subject = `Quote ${document.documentNumber} – ${document.title}`;
      
      htmlBody = `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0F1A14; margin-bottom: 8px;">Quote ${document.documentNumber}</h2>
          <p style="color: #7A8F82; font-size: 14px; margin-bottom: 24px;">Hi ${document.clientName},</p>
          
          <p style="color: #1C2B22; line-height: 1.6; margin-bottom: 16px;">
            Please find your quote attached.
          </p>
          
          <div style="background: #F5F8F6; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #7A8F82; font-size: 13px; padding: 8px 0;">Document Number:</td>
                <td style="color: #0F1A14; font-weight: 600; text-align: right; padding: 8px 0;">${document.documentNumber}</td>
              </tr>
              <tr>
                <td style="color: #7A8F82; font-size: 13px; padding: 8px 0;">Issue Date:</td>
                <td style="color: #0F1A14; text-align: right; padding: 8px 0;">${formatDate(document.issueDate)}</td>
              </tr>
              <tr>
                <td style="color: #7A8F82; font-size: 13px; padding: 8px 0;">Valid Until:</td>
                <td style="color: #0F1A14; text-align: right; padding: 8px 0;">${formatDate(document.validUntil)}</td>
              </tr>
              <tr style="border-top: 2px solid #E5E5E5;">
                <td style="color: #0F1A14; font-size: 16px; font-weight: 700; padding: 12px 0 8px;">Total:</td>
                <td style="color: #3CC864; font-size: 20px; font-weight: 700; text-align: right; padding: 12px 0 8px;">${formatZAR(document.total)}</td>
              </tr>
              ${document.depositRequired && document.depositAmount ? `
              <tr>
                <td style="color: #F07028; font-size: 13px; padding: 8px 0;">Deposit Required (${document.depositPercentage}%):</td>
                <td style="color: #F07028; font-weight: 600; text-align: right; padding: 8px 0;">${formatZAR(document.depositAmount)}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          ${document.paymentLinkUrl ? `
          <div style="margin: 24px 0;">
            <a href="${document.paymentLinkUrl}" style="display: inline-block; background: #3CC864; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">
              Pay Deposit
            </a>
          </div>
          ` : ''}

          ${document.notes ? `
          <p style="color: #7A8F82; font-size: 13px; line-height: 1.6; margin: 24px 0;">
            ${document.notes}
          </p>
          ` : ''}

          <p style="color: #1C2B22; margin-top: 32px;">This quote is valid until ${formatDate(document.validUntil)}</p>
          
          ${document.companyEmail ? `
          <p style="color: #7A8F82; font-size: 13px; margin-top: 8px;">
            ${document.companyEmail}
          </p>
          ` : ''}
        </div>
      `;
    }

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(pdfComponent);

    // Send email with Resend
    const fromEmail = process.env.RESEND_FROM_EMAIL || "billing@rosco.app";
    const resend = getResendClient();
    
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject,
      html: htmlBody,
      attachments: [
        {
          filename,
          content: pdfBuffer,
        },
      ],
    });

    return NextResponse.json({
      success: true,
      sentTo: toEmail,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
