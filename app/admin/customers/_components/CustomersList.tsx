"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, User, Mail, Phone, Briefcase } from "lucide-react";
import { format } from "date-fns";

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  totalJobs: number;
  lastJobDate: string;
  createdAt: string;
}

export default function CustomersList({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState(initialCustomers);
  const [loading, setLoading] = useState(false);

  // Filter customers based on search query
  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.phone?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="px-4">
        <div className="relative">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers..."
            className="h-11 text-[16px] rounded-xl border pl-10"
            style={{
              background: "var(--bg-primary)",
              borderColor: "var(--border)",
              color: "var(--label-primary)",
            }}
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: "var(--label-tertiary)" }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="px-4">
        <p className="text-[13px]" style={{ color: "var(--label-secondary)" }}>
          {filteredCustomers.length} {filteredCustomers.length === 1 ? "customer" : "customers"}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      {/* Customers List */}
      <div className="ios-group divide-y" style={{ borderColor: "var(--border)" }}>
        {filteredCustomers.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <User
              className="w-12 h-12 mx-auto mb-3 opacity-30"
              style={{ color: "var(--label-tertiary)" }}
            />
            <p className="text-[15px]" style={{ color: "var(--label-secondary)" }}>
              {searchQuery ? "No customers found" : "No customers yet"}
            </p>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="px-4 py-3">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--ios-blue-alpha)" }}
                >
                  <User className="w-6 h-6" style={{ color: "var(--ios-blue)" }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold text-[16px] mb-1"
                    style={{ color: "var(--label-primary)" }}
                  >
                    {customer.name}
                  </h3>

                  {/* Contact Info */}
                  <div className="space-y-1">
                    {customer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: "var(--label-tertiary)" }}
                        />
                        <a
                          href={`tel:${customer.phone}`}
                          className="text-[14px] hover:underline"
                          style={{ color: "var(--ios-blue)" }}
                        >
                          {customer.phone}
                        </a>
                      </div>
                    )}
                    {customer.email && (
                      <div className="flex items-center gap-2">
                        <Mail
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: "var(--label-tertiary)" }}
                        />
                        <a
                          href={`mailto:${customer.email}`}
                          className="text-[14px] hover:underline truncate"
                          style={{ color: "var(--ios-blue)" }}
                        >
                          {customer.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-2 mt-2">
                    <Briefcase
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: "var(--label-tertiary)" }}
                    />
                    <span className="text-[13px]" style={{ color: "var(--label-secondary)" }}>
                      {customer.totalJobs} {customer.totalJobs === 1 ? "job" : "jobs"}
                      {customer.lastJobDate && (
                        <> · Last: {format(new Date(customer.lastJobDate), "MMM d, yyyy")}</>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
