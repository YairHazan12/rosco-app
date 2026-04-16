import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { BillingInvoice, Quote } from "./billing-types";
import { formatZAR, formatDate } from "./billing-types";

// Register fonts (using default Helvetica family)
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#0F1A14",
  },
  header: {
    marginBottom: 20,
  },
  docLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A80FF",
    marginBottom: 4,
    letterSpacing: 1,
  },
  docNumber: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  title: {
    fontSize: 12,
    color: "#7A8F82",
  },
  statusBadge: {
    backgroundColor: "#F5F8F6",
    padding: "4 8",
    borderRadius: 4,
    fontSize: 8,
    fontWeight: "bold",
    color: "#7A8F82",
    marginTop: 4,
    alignSelf: "flex-start",
  },
  twoColumn: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  column: {
    width: "48%",
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#7A8F82",
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  companyName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
  },
  text: {
    fontSize: 10,
    marginBottom: 2,
    color: "#1C2B22",
  },
  textSmall: {
    fontSize: 9,
    marginBottom: 2,
    color: "#7A8F82",
  },
  divider: {
    borderBottom: "1 solid #E5E5E5",
    marginVertical: 15,
  },
  table: {
    marginTop: 15,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1 solid #7A8F82",
    paddingBottom: 6,
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#7A8F82",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5 solid #E5E5E5",
    paddingVertical: 8,
  },
  tableCell: {
    fontSize: 10,
  },
  tableCellBold: {
    fontSize: 10,
    fontWeight: "bold",
  },
  itemName: {
    width: "45%",
    paddingRight: 8,
  },
  itemQty: {
    width: "15%",
    textAlign: "center",
  },
  itemPrice: {
    width: "20%",
    textAlign: "right",
  },
  itemTotal: {
    width: "20%",
    textAlign: "right",
  },
  totalsSection: {
    marginTop: 20,
    alignSelf: "flex-end",
    width: "45%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: "#7A8F82",
  },
  totalValue: {
    fontSize: 10,
    textAlign: "right",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTop: "1 solid #0F1A14",
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
  },
  notesSection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#F5F8F6",
    borderRadius: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#7A8F82",
    textAlign: "center",
    borderTop: "0.5 solid #E5E5E5",
    paddingTop: 10,
  },
  amountDueBox: {
    backgroundColor: "#FFF5F0",
    border: "1 solid #F07028",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  amountDueLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#F07028",
    marginBottom: 2,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  amountDueValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F07028",
  },
  bankingSection: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#F5F8F6",
    borderRadius: 4,
  },
});

interface InvoicePDFProps {
  invoice: BillingInvoice;
}

export function InvoicePDF({ invoice }: InvoicePDFProps) {
  const hasVat = invoice.lineItems.some((i) => i.vatApplicable);
  const isOverdue = invoice.status === "overdue";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.docLabel}>TAX INVOICE</Text>
          <Text style={styles.docNumber}>{invoice.documentNumber}</Text>
          <Text style={styles.title}>{invoice.title}</Text>
          <View style={styles.statusBadge}>
            <Text>{invoice.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Two-column layout: Company & Client */}
        <View style={styles.twoColumn}>
          {/* Company Details */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>From</Text>
            <Text style={styles.companyName}>{invoice.companyName || "ROSCO"}</Text>
            {invoice.companyRegistrationNumber && (
              <Text style={styles.textSmall}>Reg: {invoice.companyRegistrationNumber}</Text>
            )}
            {invoice.companyVatNumber && (
              <Text style={styles.textSmall}>VAT: {invoice.companyVatNumber}</Text>
            )}
            {invoice.companyAddress && <Text style={styles.textSmall}>{invoice.companyAddress}</Text>}
            {invoice.companyPhone && <Text style={styles.textSmall}>{invoice.companyPhone}</Text>}
            {invoice.companyEmail && <Text style={styles.textSmall}>{invoice.companyEmail}</Text>}
          </View>

          {/* Client Details */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={styles.companyName}>{invoice.clientName}</Text>
            {invoice.clientVatNumber && <Text style={styles.textSmall}>VAT: {invoice.clientVatNumber}</Text>}
            {invoice.clientEmail && <Text style={styles.textSmall}>{invoice.clientEmail}</Text>}
            {invoice.clientPhone && <Text style={styles.textSmall}>{invoice.clientPhone}</Text>}
            {invoice.clientAddress && <Text style={styles.textSmall}>{invoice.clientAddress}</Text>}
          </View>
        </View>

        {/* Invoice Details */}
        <View style={styles.twoColumn}>
          <View style={styles.column}>
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.sectionTitle}>Issue Date</Text>
              <Text style={styles.text}>{formatDate(invoice.issueDate)}</Text>
            </View>
            {invoice.poNumber && (
              <View>
                <Text style={styles.sectionTitle}>PO Number</Text>
                <Text style={styles.text}>{invoice.poNumber}</Text>
              </View>
            )}
          </View>

          <View style={styles.column}>
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.sectionTitle}>Due Date</Text>
              <Text style={[styles.text, isOverdue ? { color: "#F07028" } : {}]}>{formatDate(invoice.dueDate)}</Text>
            </View>
            {invoice.paymentTerms && (
              <View>
                <Text style={styles.sectionTitle}>Payment Terms</Text>
                <Text style={styles.text}>{invoice.paymentTerms}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Amount Outstanding */}
        {invoice.amountOutstanding > 0 && (
          <View style={styles.amountDueBox}>
            <Text style={styles.amountDueLabel}>
              {isOverdue ? "OVERDUE AMOUNT" : "AMOUNT OUTSTANDING"}
            </Text>
            <Text style={styles.amountDueValue}>{formatZAR(invoice.amountOutstanding)}</Text>
          </View>
        )}

        <View style={styles.divider} />

        {/* Line Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.itemName]}>Item</Text>
            <Text style={[styles.tableHeaderCell, styles.itemQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.itemPrice]}>Unit Price</Text>
            <Text style={[styles.tableHeaderCell, styles.itemTotal]}>Total</Text>
          </View>

          {/* Table Rows */}
          {invoice.lineItems.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <View style={styles.itemName}>
                <Text style={styles.tableCellBold}>{item.name}</Text>
                {item.description && (
                  <Text style={[styles.textSmall, { marginTop: 2 }]}>{item.description}</Text>
                )}
              </View>
              <Text style={[styles.tableCell, styles.itemQty]}>
                {item.quantity} {item.unit}
              </Text>
              <Text style={[styles.tableCell, styles.itemPrice]}>{formatZAR(item.unitPrice)}</Text>
              <Text style={[styles.tableCellBold, styles.itemTotal]}>{formatZAR(item.lineTotal)}</Text>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal (excl. VAT)</Text>
            <Text style={styles.totalValue}>{formatZAR(invoice.subtotal)}</Text>
          </View>
          {hasVat && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>VAT (15%)</Text>
              <Text style={styles.totalValue}>{formatZAR(invoice.vatTotal)}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>TOTAL</Text>
            <Text style={styles.grandTotalValue}>{formatZAR(invoice.total)}</Text>
          </View>

          {invoice.amountPaid > 0 && (
            <>
              <View style={[styles.totalRow, { marginTop: 8 }]}>
                <Text style={[styles.totalLabel, { color: "#3CC864" }]}>Amount Paid</Text>
                <Text style={[styles.totalValue, { color: "#3CC864" }]}>{formatZAR(invoice.amountPaid)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { fontWeight: "bold" }]}>Outstanding</Text>
                <Text style={[styles.totalValue, { fontWeight: "bold", color: "#F07028" }]}>
                  {formatZAR(invoice.amountOutstanding)}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Banking Details */}
        {invoice.bankName && invoice.amountOutstanding > 0 && (
          <View style={styles.bankingSection}>
            <Text style={styles.sectionTitle}>Banking Details</Text>
            <Text style={styles.text}>Bank: {invoice.bankName}</Text>
            {invoice.bankAccountHolder && <Text style={styles.text}>Account Holder: {invoice.bankAccountHolder}</Text>}
            {invoice.bankAccountNumber && <Text style={styles.text}>Account Number: {invoice.bankAccountNumber}</Text>}
            {invoice.branchCode && <Text style={styles.text}>Branch Code: {invoice.branchCode}</Text>}
            {invoice.bankAccountType && <Text style={styles.text}>Account Type: {invoice.bankAccountType}</Text>}
          </View>
        )}

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.text}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
          {invoice.companyEmail && <Text style={{ marginTop: 2 }}>{invoice.companyEmail}</Text>}
        </View>
      </Page>
    </Document>
  );
}

interface QuotePDFProps {
  quote: Quote;
}

export function QuotePDF({ quote }: QuotePDFProps) {
  const hasVat = quote.lineItems.some((i) => i.vatApplicable);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.docLabel, { color: "#3CC864" }]}>QUOTATION</Text>
          <Text style={styles.docNumber}>{quote.documentNumber}</Text>
          <Text style={styles.title}>{quote.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: "#E8F5EE" }]}>
            <Text>{quote.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Two-column layout: Company & Client */}
        <View style={styles.twoColumn}>
          {/* Company Details */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>From</Text>
            <Text style={styles.companyName}>{quote.companyName || "ROSCO"}</Text>
            {quote.companyRegistrationNumber && (
              <Text style={styles.textSmall}>Reg: {quote.companyRegistrationNumber}</Text>
            )}
            {quote.companyVatNumber && <Text style={styles.textSmall}>VAT: {quote.companyVatNumber}</Text>}
            {quote.companyAddress && <Text style={styles.textSmall}>{quote.companyAddress}</Text>}
            {quote.companyPhone && <Text style={styles.textSmall}>{quote.companyPhone}</Text>}
            {quote.companyEmail && <Text style={styles.textSmall}>{quote.companyEmail}</Text>}
          </View>

          {/* Client Details */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Quote For</Text>
            <Text style={styles.companyName}>{quote.clientName}</Text>
            {quote.clientVatNumber && <Text style={styles.textSmall}>VAT: {quote.clientVatNumber}</Text>}
            {quote.clientEmail && <Text style={styles.textSmall}>{quote.clientEmail}</Text>}
            {quote.clientPhone && <Text style={styles.textSmall}>{quote.clientPhone}</Text>}
            {quote.clientAddress && <Text style={styles.textSmall}>{quote.clientAddress}</Text>}
          </View>
        </View>

        {/* Quote Details */}
        <View style={styles.twoColumn}>
          <View style={styles.column}>
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.sectionTitle}>Issue Date</Text>
              <Text style={styles.text}>{formatDate(quote.issueDate)}</Text>
            </View>
            {quote.poNumber && (
              <View>
                <Text style={styles.sectionTitle}>PO Number</Text>
                <Text style={styles.text}>{quote.poNumber}</Text>
              </View>
            )}
          </View>

          <View style={styles.column}>
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.sectionTitle}>Valid Until</Text>
              <Text style={styles.text}>{formatDate(quote.validUntil)}</Text>
            </View>
            {quote.paymentTerms && (
              <View>
                <Text style={styles.sectionTitle}>Payment Terms</Text>
                <Text style={styles.text}>{quote.paymentTerms}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Line Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.itemName]}>Item</Text>
            <Text style={[styles.tableHeaderCell, styles.itemQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.itemPrice]}>Unit Price</Text>
            <Text style={[styles.tableHeaderCell, styles.itemTotal]}>Total</Text>
          </View>

          {/* Table Rows */}
          {quote.lineItems.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <View style={styles.itemName}>
                <Text style={styles.tableCellBold}>{item.name}</Text>
                {item.description && (
                  <Text style={[styles.textSmall, { marginTop: 2 }]}>{item.description}</Text>
                )}
              </View>
              <Text style={[styles.tableCell, styles.itemQty]}>
                {item.quantity} {item.unit}
              </Text>
              <Text style={[styles.tableCell, styles.itemPrice]}>{formatZAR(item.unitPrice)}</Text>
              <Text style={[styles.tableCellBold, styles.itemTotal]}>{formatZAR(item.lineTotal)}</Text>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal (excl. VAT)</Text>
            <Text style={styles.totalValue}>{formatZAR(quote.subtotal)}</Text>
          </View>
          {hasVat && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>VAT (15%)</Text>
              <Text style={styles.totalValue}>{formatZAR(quote.vatTotal)}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>TOTAL</Text>
            <Text style={styles.grandTotalValue}>{formatZAR(quote.total)}</Text>
          </View>

          {quote.depositRequired && quote.depositAmount && (
            <View style={[styles.totalRow, { marginTop: 8, paddingTop: 8, borderTop: "0.5 solid #E5E5E5" }]}>
              <Text style={[styles.totalLabel, { color: "#F07028", fontWeight: "bold" }]}>
                Deposit Required ({quote.depositPercentage}%)
              </Text>
              <Text style={[styles.totalValue, { color: "#F07028", fontWeight: "bold" }]}>
                {formatZAR(quote.depositAmount)}
              </Text>
            </View>
          )}
        </View>

        {/* Banking Details */}
        {quote.bankName && quote.depositRequired && (
          <View style={styles.bankingSection}>
            <Text style={styles.sectionTitle}>Banking Details</Text>
            <Text style={styles.text}>Bank: {quote.bankName}</Text>
            {quote.bankAccountHolder && <Text style={styles.text}>Account Holder: {quote.bankAccountHolder}</Text>}
            {quote.bankAccountNumber && <Text style={styles.text}>Account Number: {quote.bankAccountNumber}</Text>}
            {quote.branchCode && <Text style={styles.text}>Branch Code: {quote.branchCode}</Text>}
            {quote.bankAccountType && <Text style={styles.text}>Account Type: {quote.bankAccountType}</Text>}
          </View>
        )}

        {/* Notes */}
        {quote.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.text}>{quote.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This quote is valid until {formatDate(quote.validUntil)}</Text>
          {quote.companyEmail && <Text style={{ marginTop: 2 }}>{quote.companyEmail}</Text>}
        </View>
      </Page>
    </Document>
  );
}
