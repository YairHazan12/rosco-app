"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, User } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  totalJobs: number;
}

interface CustomerAutocompleteProps {
  onSelect: (customer: { name: string; phone: string; email: string } | null) => void;
  initialName?: string;
  initialPhone?: string;
  initialEmail?: string;
}

export default function CustomerAutocomplete({
  onSelect,
  initialName = "",
  initialPhone = "",
  initialEmail = "",
}: CustomerAutocompleteProps) {
  const [searchQuery, setSearchQuery] = useState(initialName);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch customers on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/customers");
        if (res.ok) {
          const data = await res.json();
          setCustomers(data.data || []);
        }
      } catch (e) {
        console.error("Failed to fetch customers:", e);
      }
    };
    fetchCustomers();
  }, []);

  // Filter customers based on search query (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const filtered = customers.filter((c) => {
          return (
            c.name.toLowerCase().includes(query) ||
            c.phone?.toLowerCase().includes(query) ||
            c.email?.toLowerCase().includes(query)
          );
        });
        setFilteredCustomers(filtered);
        setShowDropdown(filtered.length > 0);
      } else {
        setFilteredCustomers([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, customers]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCustomer = (customer: Customer) => {
    setSearchQuery(customer.name);
    setShowDropdown(false);
    onSelect({
      name: customer.name,
      phone: customer.phone || "",
      email: customer.email || "",
    });
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    // If user is typing new data, notify parent that it's a new entry
    if (value && !filteredCustomers.some((c) => c.name === value)) {
      onSelect({
        name: value,
        phone: initialPhone,
        email: initialEmail,
      });
    }
  };

  return (
    <div className="relative space-y-1.5">
      <Label
        htmlFor="customerSearch"
        className="text-[13px] font-medium"
        style={{ color: "var(--label-tertiary)" }}
      >
        Client Name *
      </Label>
      
      <div className="relative">
        <Input
          ref={inputRef}
          id="customerSearch"
          required
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (filteredCustomers.length > 0) {
              setShowDropdown(true);
            }
          }}
          placeholder="Search or enter new client..."
          className="h-11 text-[16px] rounded-xl border pr-10"
          style={{
            background: "var(--bg-primary)",
            borderColor: "var(--border)",
            color: "var(--label-primary)",
          }}
        />
        <Search
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5"
          style={{ color: "var(--label-tertiary)" }}
        />
      </div>

      {/* Dropdown */}
      {showDropdown && filteredCustomers.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 rounded-xl border shadow-lg overflow-hidden"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border)",
            maxHeight: "240px",
            overflowY: "auto",
          }}
        >
          {filteredCustomers.slice(0, 5).map((customer) => (
            <button
              key={customer.id}
              type="button"
              onClick={() => handleSelectCustomer(customer)}
              className="w-full px-4 py-3 text-left hover:bg-opacity-80 transition-colors border-b last:border-b-0"
              style={{
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--ios-blue-alpha)" }}
                >
                  <User
                    className="w-5 h-5"
                    style={{ color: "var(--ios-blue)" }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-[15px] truncate"
                    style={{ color: "var(--label-primary)" }}
                  >
                    {customer.name}
                  </p>
                  <p
                    className="text-[13px] truncate"
                    style={{ color: "var(--label-secondary)" }}
                  >
                    {customer.phone || customer.email || "No contact info"}
                  </p>
                  <p
                    className="text-[12px] mt-0.5"
                    style={{ color: "var(--label-tertiary)" }}
                  >
                    {customer.totalJobs} {customer.totalJobs === 1 ? "job" : "jobs"}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
