"use client";

import Link from "next/link";
import { CSSProperties } from "react";

interface CreateInvoiceLinkProps {
  jobId: string;
  className?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
}

export default function CreateInvoiceLink({
  jobId,
  className,
  style,
  children,
}: CreateInvoiceLinkProps) {
  return (
    <Link
      href={`/admin/invoices/new?jobId=${jobId}`}
      onClick={(e) => e.stopPropagation()}
      className={className}
      style={style}
    >
      {children}
    </Link>
  );
}
