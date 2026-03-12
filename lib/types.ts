export interface Customer {
  id: string;
  companyId: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  searchTokens: string[];
  totalJobs: number;
  lastJobDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Handyman {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  companyId: string;
  specialties?: string[];
  status?: string;
  createdAt: string;
}

export interface Job {
  id: string;
  companyId: string;
  customerId?: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  title: string;
  description?: string;
  date: string; // ISO string
  location: string;
  status: "Pending" | "In Progress" | "Completed";
  handymanId?: string;
  handymanName?: string; // denormalized
  invoiceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  companyId: string;
  jobId: string;
  // Denormalized job fields for display
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  jobTitle: string;
  jobDate: string;
  jobLocation: string;
  handymanName?: string;
  // Invoice data
  items: InvoiceItem[];
  subtotal: number;
  vatEnabled: boolean;
  vatRate: number;
  vatAmount: number;
  total: number;
  status: "Draft" | "Sent" | "Paid" | "Outstanding";
  paystackReference?: string;
  paystackAccessCode?: string;
  paystackAuthorizationUrl?: string;
  handymanSubaccountCode?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServicePreset {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
}

export interface AppSettings {
  currency: "ILS" | "USD" | "EUR" | "GBP";
  language: "en" | "he" | "ru" | "ar";
  timezone: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface HandymanSettings {
  pushNotifications?: boolean;
  // Add more settings fields as needed
}
