"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`/admin/invoices/new?jobId=${jobId}`);
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      style={style}
      type="button"
    >
      {children}
    </button>
  );
}
