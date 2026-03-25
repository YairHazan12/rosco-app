"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  GripVertical,
  Search,
  Check,
  X,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import type { Customer, ServicePreset } from "@/lib/types";
import type { Company } from "@/lib/auth-types";
import { calcLineTotal, calcTotals, formatZAR } from "@/lib/billing-types";
import type { LineItem } from "@/lib/billing-types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mx-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between rounded-[12px] px-4 py-3.5 mb-2 transition-opacity active:opacity-75"
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0px 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <span style={{ fontSize: "15px", fontWeight: 600, color: "#0F1A14" }}>{title}</span>
        {open ? (
          <ChevronDown className="w-4 h-4" style={{ color: "#7A8F82" }} strokeWidth={1.75} />
        ) : (
          <ChevronRight className="w-4 h-4" style={{ color: "#7A8F82" }} strokeWidth={1.75} />
        )}
      </button>
      {open && (
        <div
          className="rounded-[16px] overflow-hidden mb-3"
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0px 1px 3px rgba(0,0,0,0.06), 0px 4px 12px rgba(0,0,0,0.04)",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-4 space-y-4">{children}</div>;
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="block mb-1.5"
        style={{ fontSize: "12px", fontWeight: 600, color: "#7A8F82", textTransform: "uppercase", letterSpacing: "0.06em" }}
      >
        {label}
        {required && <span style={{ color: "#F07028" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  readOnly,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <input
      type="text"
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-[10px] px-3 py-2.5 transition-all"
      style={{
        fontSize: "15px",
        background: readOnly ? "#F5F8F6" : "#FFFFFF",
        border: "1px solid #E4EDE7",
        color: readOnly ? "#7A8F82" : "#1C2B22",
        fontFamily: "inherit",
      }}
    />
  );
}

function DateInput({
  value,
  onChange,
  min,
}: {
  value: string;
  onChange: (v: string) => void;
  min?: string;
}) {
  return (
    <input
      type="date"
      value={value}
      min={min}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-[10px] px-3 py-2.5 transition-all"
      style={{
        fontSize: "15px",
        background: "#FFFFFF",
        border: "1px solid #E4EDE7",
        color: "#1C2B22",
        fontFamily: "inherit",
      }}
    />
  );
}

// ─── New Client Sheet ─────────────────────────────────────────────────────────

function NewClientSheet({
  onCreated,
  onClose,
  prefillName,
}: {
  onCreated: (c: Customer) => void;
  onClose: () => void;
  prefillName: string;
}) {
  const [name, setName] = useState(prefillName);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone || undefined, email: email || undefined, address: address || undefined }),
      });
      if (!res.ok) throw new Error();
      const customer = await res.json();
      onCreated(customer);
    } catch {
      toast.error("Could not create client");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        className="relative w-full rounded-t-[24px] overflow-hidden"
        style={{ background: "#FFFFFF", maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(0,0,0,0.12)" }} />
        </div>

        <div className="px-5 pb-2 flex items-center justify-between">
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0F1A14" }}>New Client</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: "rgba(0,0,0,0.06)" }}>
            <X className="w-4 h-4" style={{ color: "#7A8F82" }} strokeWidth={1.75} />
          </button>
        </div>

        <div className="px-5 pb-6 space-y-4">
          <div>
            <label className="block mb-1.5" style={{ fontSize: "12px", fontWeight: 600, color: "#7A8F82", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Name <span style={{ color: "#F07028" }}>*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Smith"
              className="w-full rounded-[10px] px-3 py-2.5"
              style={{ fontSize: "15px", border: "1px solid #E4EDE7", color: "#1C2B22", fontFamily: "inherit" }}
            />
          </div>
          <div>
            <label className="block mb-1.5" style={{ fontSize: "12px", fontWeight: 600, color: "#7A8F82", textTransform: "uppercase", letterSpacing: "0.06em" }}>Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 082 555 1234"
              className="w-full rounded-[10px] px-3 py-2.5"
              style={{ fontSize: "15px", border: "1px solid #E4EDE7", color: "#1C2B22", fontFamily: "inherit" }}
            />
          </div>
          <div>
            <label className="block mb-1.5" style={{ fontSize: "12px", fontWeight: 600, color: "#7A8F82", textTransform: "uppercase", letterSpacing: "0.06em" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@example.com"
              className="w-full rounded-[10px] px-3 py-2.5"
              style={{ fontSize: "15px", border: "1px solid #E4EDE7", color: "#1C2B22", fontFamily: "inherit" }}
            />
          </div>
          <div>
            <label className="block mb-1.5" style={{ fontSize: "12px", fontWeight: 600, color: "#7A8F82", textTransform: "uppercase", letterSpacing: "0.06em" }}>Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 45 Main Road, Sandton"
              className="w-full rounded-[10px] px-3 py-2.5"
              style={{ fontSize: "15px", border: "1px solid #E4EDE7", color: "#1C2B22", fontFamily: "inherit" }}
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={saving || !name.trim()}
            className="w-full rounded-[14px] font-semibold text-white h-[52px] transition-all active:scale-[0.97] disabled:opacity-50"
            style={{ fontSize: "15px", background: "#F07028", boxShadow: "0px 4px 16px rgba(240,112,40,0.28)" }}
          >
            {saving ? "Creating…" : "Create Client"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Client search ────────────────────────────────────────────────────────────

interface ClientSearchProps {
  customers: Customer[];
  selected: Customer | null;
  onSelect: (c: Customer | null) => void;
}

function ClientSearch({ customers, selected, onSelect }: ClientSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [allCustomers, setAllCustomers] = useState(customers);
  const [showNewSheet, setShowNewSheet] = useState(false);

  const filtered = query.trim()
    ? allCustomers.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.phone?.includes(query) ||
        c.email?.toLowerCase().includes(query.toLowerCase())
      )
    : allCustomers.slice(0, 8);

  function handleCreated(c: Customer) {
    setAllCustomers((prev) => [c, ...prev]);
    onSelect(c);
    setShowNewSheet(false);
    setOpen(false);
    setQuery("");
    toast.success(`Client "${c.name}" created`);
  }

  if (selected) {
    return (
      <div
        className="rounded-[12px] p-4"
        style={{ background: "#F5F8F6", border: "1px solid rgba(0,0,0,0.06)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#0F1A14" }}>{selected.name}</p>
            {selected.email && (
              <p className="mt-0.5" style={{ fontSize: "13px", color: "#7A8F82" }}>{selected.email}</p>
            )}
            {selected.phone && (
              <p className="mt-0.5" style={{ fontSize: "13px", color: "#7A8F82" }}>{selected.phone}</p>
            )}
            {selected.address && (
              <p className="mt-0.5" style={{ fontSize: "13px", color: "#7A8F82" }}>{selected.address}</p>
            )}
          </div>
          <button
            onClick={() => onSelect(null)}
            className="w-7 h-7 flex items-center justify-center rounded-full"
            style={{ background: "rgba(0,0,0,0.06)" }}
          >
            <X className="w-4 h-4" style={{ color: "#7A8F82" }} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showNewSheet && (
        <NewClientSheet
          prefillName={query}
          onCreated={handleCreated}
          onClose={() => setShowNewSheet(false)}
        />
      )}

      <div className="relative">
        {open && <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />}
        <div
          className="flex items-center gap-2 rounded-[10px] px-3 relative z-20"
          style={{ border: "1px solid #E4EDE7", background: "#FFFFFF" }}
        >
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#7A8F82" }} strokeWidth={1.75} />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Search clients..."
            className="flex-1 py-2.5 outline-none bg-transparent"
            style={{ fontSize: "15px", color: "#1C2B22", fontFamily: "inherit" }}
          />
        </div>

        {open && (
          <div
            className="absolute left-0 right-0 top-full mt-1 rounded-[12px] overflow-hidden z-20"
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              maxHeight: "240px",
              overflowY: "auto",
            }}
          >
            {filtered.map((c) => (
              <button
                key={c.id}
                className="w-full px-4 py-3 text-left hover:bg-[#F5F8F6] transition-colors"
                style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                onClick={() => { onSelect(c); setOpen(false); setQuery(""); }}
              >
                <p style={{ fontSize: "15px", fontWeight: 600, color: "#0F1A14" }}>{c.name}</p>
                {(c.phone || c.email) && (
                  <p style={{ fontSize: "12px", color: "#7A8F82" }}>
                    {[c.phone, c.email].filter(Boolean).join(" · ")}
                  </p>
                )}
              </button>
            ))}

            {/* New client button — always shown at bottom */}
            <button
              onClick={() => { setShowNewSheet(true); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F5F8F6]"
              style={{ borderTop: filtered.length > 0 ? "1px solid rgba(0,0,0,0.06)" : undefined }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(240,112,40,0.10)" }}
              >
                <Plus className="w-4 h-4" style={{ color: "#F07028" }} strokeWidth={2} />
              </div>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#F07028" }}>
                  {query.trim() ? `Create "${query}"` : "New Client"}
                </p>
                <p style={{ fontSize: "11px", color: "#7A8F82" }}>Add a new client to your account</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Line Item Card ───────────────────────────────────────────────────────────

interface LineItemCardProps {
  item: LineItem;
  onChange: (updated: LineItem) => void;
  onDelete: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

function LineItemCard({ item, onChange, onDelete }: LineItemCardProps) {
  function update(patch: Partial<LineItem>) {
    const updated = { ...item, ...patch };
    updated.lineTotal = calcLineTotal(updated);
    onChange(updated);
  }

  return (
    <div
      className="rounded-[12px] mb-2"
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(0,0,0,0.06)",
        padding: "14px",
      }}
    >
      {/* Header row: drag handle + name + delete */}
      <div className="flex items-start gap-2 mb-3">
        <GripVertical
          className="w-4 h-4 mt-1 flex-shrink-0 cursor-grab"
          style={{ color: "#D0D9D4" }}
          strokeWidth={1.75}
        />
        <input
          type="text"
          value={item.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Item name"
          className="flex-1 font-semibold bg-transparent outline-none"
          style={{ fontSize: "15px", color: "#0F1A14", fontFamily: "inherit" }}
        />
        <button
          onClick={onDelete}
          className="w-7 h-7 flex items-center justify-center rounded-[6px] flex-shrink-0"
          style={{ background: "rgba(240,112,40,0.08)" }}
        >
          <Trash2 className="w-4 h-4" style={{ color: "#F07028" }} strokeWidth={1.75} />
        </button>
      </div>

      {/* Description */}
      <input
        type="text"
        value={item.description ?? ""}
        onChange={(e) => update({ description: e.target.value })}
        placeholder="Add description..."
        className="w-full mb-3 bg-transparent outline-none"
        style={{
          fontSize: "13px",
          color: "#7A8F82",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          paddingBottom: "10px",
          fontFamily: "inherit",
        }}
      />

      {/* Qty / Unit / Unit price */}
      <div className="flex gap-3 mb-3">
        <div style={{ width: "70px" }}>
          <label className="block mb-1" style={{ fontSize: "10px", fontWeight: 600, color: "#7A8F82", textTransform: "uppercase", letterSpacing: "0.06em" }}>Qty</label>
          <input
            type="number"
            min={0}
            value={item.quantity}
            onChange={(e) => update({ quantity: parseFloat(e.target.value) || 0 })}
            className="w-full rounded-[8px] px-2 py-1.5 text-center"
            style={{ fontSize: "14px", border: "1px solid #E4EDE7", fontFamily: "inherit", color: "#1C2B22" }}
          />
        </div>
        <div style={{ width: "80px" }}>
          <label className="block mb-1" style={{ fontSize: "10px", fontWeight: 600, color: "#7A8F82", textTransform: "uppercase", letterSpacing: "0.06em" }}>Unit</label>
          <input
            type="text"
            value={item.unit}
            onChange={(e) => update({ unit: e.target.value })}
            placeholder="hrs"
            className="w-full rounded-[8px] px-2 py-1.5"
            style={{ fontSize: "14px", border: "1px solid #E4EDE7", fontFamily: "inherit", color: "#1C2B22" }}
          />
        </div>
        <div className="flex-1">
          <label className="block mb-1" style={{ fontSize: "10px", fontWeight: 600, color: "#7A8F82", textTransform: "uppercase", letterSpacing: "0.06em" }}>Unit Price</label>
          <div className="flex items-center rounded-[8px] px-2 py-1.5" style={{ border: "1px solid #E4EDE7" }}>
            <span style={{ fontSize: "14px", color: "#7A8F82", marginRight: "4px" }}>R</span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={item.unitPrice}
              onChange={(e) => update({ unitPrice: parseFloat(e.target.value) || 0 })}
              className="flex-1 text-right bg-transparent outline-none"
              style={{ fontSize: "14px", fontFamily: "inherit", color: "#1C2B22" }}
            />
          </div>
        </div>
      </div>

      {/* VAT toggle */}
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <button
            role="switch"
            aria-checked={item.vatApplicable}
            onClick={() => update({ vatApplicable: !item.vatApplicable })}
            className="relative flex-shrink-0 rounded-full transition-colors duration-200"
            style={{
              width: "36px",
              height: "20px",
              background: item.vatApplicable ? "#3CC864" : "#E4EDE7",
            }}
          >
            <span
              className="absolute rounded-full bg-white transition-transform duration-200"
              style={{
                width: "16px",
                height: "16px",
                top: "2px",
                left: item.vatApplicable ? "18px" : "2px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              }}
            />
          </button>
          <span style={{ fontSize: "13px", color: "#7A8F82" }}>
            VAT ({(item.vatRate * 100).toFixed(0)}%)
          </span>
          {item.vatApplicable && (
            <span style={{ fontSize: "12px", color: "#3CC864", fontWeight: 500 }}>
              +{formatZAR(item.quantity * item.unitPrice * item.vatRate)}
            </span>
          )}
        </label>
        <span
          className="stat-number"
          style={{ fontSize: "16px", fontWeight: 700, color: "#0F1A14" }}
        >
          {formatZAR(item.lineTotal)}
        </span>
      </div>
    </div>
  );
}

// ─── Add Item Sheet ───────────────────────────────────────────────────────────

function AddItemSheet({
  presets,
  onAdd,
  onClose,
}: {
  presets: ServicePreset[];
  onAdd: (item: Omit<LineItem, "id" | "sortOrder">) => void;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"choose" | "custom" | null>(null);
  const [query, setQuery] = useState("");
  const [custom, setCustom] = useState({ name: "", quantity: 1, unit: "unit", unitPrice: 0, vatApplicable: true, vatRate: 0.15 });

  const filteredPresets = query
    ? presets.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : presets;

  function addCustom() {
    if (!custom.name.trim()) return;
    onAdd({ ...custom, description: "", lineTotal: calcLineTotal({ ...custom, lineTotal: 0, id: "", sortOrder: 0 }) });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        className="relative w-full max-w-2xl mx-auto rounded-t-[20px] overflow-hidden"
        style={{ background: "#FFFFFF", maxHeight: "70vh", display: "flex", flexDirection: "column" }}
      >
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0F1A14" }}>Add Line Item</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.06)" }}>
            <X className="w-4 h-4" style={{ color: "#7A8F82" }} strokeWidth={1.75} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 pb-8">
          {mode === null && (
            <div className="space-y-3 pt-2">
              <button
                onClick={() => setMode("choose")}
                className="w-full flex items-center gap-3 rounded-[14px] px-4 py-4 text-left transition-opacity active:opacity-75"
                style={{ background: "#F5F8F6", border: "1px solid rgba(0,0,0,0.06)" }}
              >
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: "rgba(60,200,100,0.10)" }}>
                  <Search className="w-5 h-5" style={{ color: "#3CC864" }} strokeWidth={1.75} />
                </div>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#0F1A14" }}>Choose from saved services</p>
                  <p style={{ fontSize: "13px", color: "#7A8F82" }}>{presets.length} preset{presets.length !== 1 ? "s" : ""} available</p>
                </div>
              </button>

              <button
                onClick={() => setMode("custom")}
                className="w-full flex items-center gap-3 rounded-[14px] px-4 py-4 text-left transition-opacity active:opacity-75"
                style={{ background: "#F5F8F6", border: "1px solid rgba(0,0,0,0.06)" }}
              >
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: "rgba(240,112,40,0.10)" }}>
                  <Plus className="w-5 h-5" style={{ color: "#F07028" }} strokeWidth={1.75} />
                </div>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#0F1A14" }}>Add custom item</p>
                  <p style={{ fontSize: "13px", color: "#7A8F82" }}>Enter name, quantity, and price</p>
                </div>
              </button>
            </div>
          )}

          {mode === "choose" && (
            <div className="pt-2 space-y-2">
              <button onClick={() => setMode(null)} className="flex items-center gap-1 mb-2" style={{ color: "#7A8F82", fontSize: "14px" }}>
                <ChevronLeft className="w-4 h-4" strokeWidth={1.75} /> Back
              </button>
              <div className="flex items-center gap-2 rounded-[10px] px-3" style={{ border: "1px solid #E4EDE7", background: "#FFFFFF" }}>
                <Search className="w-4 h-4" style={{ color: "#7A8F82" }} strokeWidth={1.75} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search services..."
                  className="flex-1 py-2.5 outline-none bg-transparent"
                  style={{ fontSize: "15px", fontFamily: "inherit" }}
                />
              </div>
              {filteredPresets.length === 0 ? (
                <p className="text-center py-8" style={{ color: "#7A8F82", fontSize: "14px" }}>No services found</p>
              ) : (
                filteredPresets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onAdd({ name: p.name, description: p.description ?? "", quantity: 1, unit: "unit", unitPrice: p.price, vatApplicable: true, vatRate: 0.15, lineTotal: p.price * 1.15 });
                      onClose();
                    }}
                    className="w-full flex items-center justify-between rounded-[12px] px-4 py-3 text-left transition-opacity active:opacity-75"
                    style={{ background: "#F5F8F6", border: "1px solid rgba(0,0,0,0.05)" }}
                  >
                    <p style={{ fontSize: "15px", fontWeight: 600, color: "#0F1A14" }}>{p.name}</p>
                    <p className="stat-number" style={{ fontSize: "14px", fontWeight: 700, color: "#3CC864" }}>{formatZAR(p.price)}</p>
                  </button>
                ))
              )}
            </div>
          )}

          {mode === "custom" && (
            <div className="pt-2 space-y-4">
              <button onClick={() => setMode(null)} className="flex items-center gap-1 mb-2" style={{ color: "#7A8F82", fontSize: "14px" }}>
                <ChevronLeft className="w-4 h-4" strokeWidth={1.75} /> Back
              </button>
              <Field label="Item Name" required>
                <TextInput value={custom.name} onChange={(v) => setCustom({ ...custom, name: v })} placeholder="e.g. Labour charge" />
              </Field>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Field label="Qty">
                    <input type="number" min={0} value={custom.quantity} onChange={(e) => setCustom({ ...custom, quantity: parseFloat(e.target.value) || 0 })} className="w-full rounded-[10px] px-3 py-2.5" style={{ fontSize: "15px", border: "1px solid #E4EDE7", fontFamily: "inherit", color: "#1C2B22" }} />
                  </Field>
                </div>
                <div className="flex-1">
                  <Field label="Unit Price (R)">
                    <input type="number" min={0} step={0.01} value={custom.unitPrice} onChange={(e) => setCustom({ ...custom, unitPrice: parseFloat(e.target.value) || 0 })} className="w-full rounded-[10px] px-3 py-2.5" style={{ fontSize: "15px", border: "1px solid #E4EDE7", fontFamily: "inherit", color: "#1C2B22" }} />
                  </Field>
                </div>
              </div>
              <button
                onClick={addCustom}
                className="w-full rounded-[14px] font-semibold text-white h-[52px] transition-all active:scale-[0.97]"
                style={{ fontSize: "15px", background: "#F07028", boxShadow: "0px 4px 16px rgba(240,112,40,0.28)" }}
              >
                Add Item
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Totals Block (sticky) ────────────────────────────────────────────────────

function TotalsBlock({
  lineItems,
  depositRequired,
  depositPercentage,
  onDepositToggle,
  onDepositPctChange,
}: {
  lineItems: LineItem[];
  depositRequired: boolean;
  depositPercentage: number;
  onDepositToggle: () => void;
  onDepositPctChange: (pct: number) => void;
}) {
  const { subtotal, vatTotal, total } = calcTotals(lineItems);
  const hasVat = lineItems.some((i) => i.vatApplicable);
  const depositAmount = depositRequired ? (total * depositPercentage) / 100 : 0;

  return (
    <div
      className="sticky bottom-0 mx-0 z-10"
      style={{
        background: "rgba(245,248,246,0.95)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div className="px-5 py-4 space-y-2">
        {/* Subtotal */}
        <div className="flex justify-between">
          <span style={{ fontSize: "14px", color: "#7A8F82" }}>Subtotal (excl. VAT)</span>
          <span className="stat-number" style={{ fontSize: "14px", color: "#7A8F82" }}>{formatZAR(subtotal)}</span>
        </div>

        {/* VAT */}
        {hasVat && (
          <div className="flex justify-between">
            <span style={{ fontSize: "14px", color: "#7A8F82" }}>VAT (15%)</span>
            <span className="stat-number" style={{ fontSize: "14px", color: "#7A8F82" }}>{formatZAR(vatTotal)}</span>
          </div>
        )}

        {/* Divider */}
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: "8px" }}>
          <div className="flex justify-between items-baseline">
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#0F1A14" }}>TOTAL</span>
            <span className="stat-number" style={{ fontSize: "20px", fontWeight: 700, color: "#0F1A14" }}>{formatZAR(total)}</span>
          </div>
        </div>

        {/* Deposit toggle */}
        <div
          className="flex items-center justify-between rounded-[10px] px-3 py-2.5 mt-1"
          style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)" }}
        >
          <span style={{ fontSize: "13px", color: "#1C2B22", fontWeight: 500 }}>Require deposit before work begins</span>
          <button
            role="switch"
            aria-checked={depositRequired}
            onClick={onDepositToggle}
            className="relative flex-shrink-0 rounded-full transition-colors duration-200 ml-3"
            style={{ width: "40px", height: "22px", background: depositRequired ? "#3CC864" : "#E4EDE7" }}
          >
            <span
              className="absolute rounded-full bg-white transition-transform duration-200"
              style={{ width: "18px", height: "18px", top: "2px", left: depositRequired ? "20px" : "2px", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }}
            />
          </button>
        </div>

        {depositRequired && (
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={100}
              value={depositPercentage}
              onChange={(e) => onDepositPctChange(Math.min(100, Math.max(1, parseInt(e.target.value) || 50)))}
              className="w-20 rounded-[8px] px-2 py-1.5 text-center"
              style={{ fontSize: "15px", border: "1px solid #E4EDE7", fontFamily: "inherit", color: "#1C2B22" }}
            />
            <span style={{ fontSize: "14px", color: "#7A8F82" }}>% deposit</span>
            <span className="flex-1 text-right stat-number" style={{ fontSize: "15px", fontWeight: 600, color: "#F07028" }}>
              = {formatZAR(depositAmount)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main form component ──────────────────────────────────────────────────────

export interface NewDocumentFormProps {
  docType: "quote" | "invoice";
  documentNumber: string;
  customers: Customer[];
  presets: ServicePreset[];
  company: Company | null;
}

export default function NewDocumentForm({
  docType,
  documentNumber,
  customers,
  presets,
  company,
}: NewDocumentFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);

  // ── Document details ─────────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [issueDate, setIssueDate] = useState(today());
  const [dueDate, setDueDate] = useState(addDays(today(), 30));
  const [validUntil, setValidUntil] = useState(addDays(today(), 30));
  const [poNumber, setPoNumber] = useState("");
  const [notes, setNotes] = useState("");

  // ── Client ───────────────────────────────────────────────────────────────
  const [selectedClient, setSelectedClient] = useState<Customer | null>(null);
  const [clientVatNumber, setClientVatNumber] = useState("");

  // ── Payment terms ─────────────────────────────────────────────────────
  const [paymentTerms, setPaymentTerms] = useState(docType === "invoice" ? "30 days" : "");

  // ── Line items ───────────────────────────────────────────────────────────
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  // ── Deposit ──────────────────────────────────────────────────────────────
  const [depositRequired, setDepositRequired] = useState(false);
  const [depositPercentage, setDepositPercentage] = useState(50);

  // ── Add item ─────────────────────────────────────────────────────────────
  function addItem(item: Omit<LineItem, "id" | "sortOrder">) {
    setLineItems((prev) => [...prev, { ...item, id: genId(), sortOrder: prev.length }]);
  }

  function updateItem(id: string, updated: LineItem) {
    setLineItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
  }

  function deleteItem(id: string) {
    setLineItems((prev) => prev.filter((i) => i.id !== id));
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  async function handleSave(status: "draft" | "sent" = "draft") {
    if (!title.trim()) {
      toast.error("Please add a document title");
      return;
    }

    const { subtotal, vatTotal, total } = calcTotals(lineItems);
    const depositAmount = depositRequired ? (total * depositPercentage) / 100 : undefined;

    setSaving(true);
    try {
      const body = {
        docType,
        title,
        status,
        documentNumber,
        // Company details (denormalized for SARS compliance)
        companyName: company?.name,
        companyVatNumber: company?.vatNumber,
        companyRegistrationNumber: company?.registrationNumber,
        companyAddress: company?.address,
        companyPhone: company?.phone ?? company?.settings?.phone,
        companyEmail: company?.email,
        // Banking details
        bankName: company?.bankName,
        bankAccountHolder: company?.accountHolder,
        bankAccountNumber: company?.accountNumber,
        branchCode: company?.branchCode,
        bankAccountType: company?.accountType,
        // Client details
        clientId: selectedClient?.id,
        clientName: selectedClient?.name ?? "Unknown Client",
        clientEmail: selectedClient?.email,
        clientPhone: selectedClient?.phone,
        clientAddress: selectedClient?.address,
        clientVatNumber: clientVatNumber || undefined,
        issueDate,
        ...(docType === "invoice" ? { dueDate } : { validUntil }),
        poNumber: poNumber || undefined,
        paymentTerms: paymentTerms || undefined,
        notes: notes || undefined,
        lineItems,
        subtotal,
        vatTotal,
        total,
        amountPaid: 0,
        amountOutstanding: total,
        depositRequired,
        depositPercentage: depositRequired ? depositPercentage : undefined,
        depositAmount,
        activityLog: [
          {
            id: genId(),
            type: "created",
            timestamp: new Date().toISOString(),
            description: `${docType === "quote" ? "Quote" : "Invoice"} ${documentNumber} created`,
          },
        ],
      };

      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(await res.text());
      const { id } = await res.json();
      router.push(`/admin/billing/${docType === "quote" ? "quotes" : "invoices"}/${id}`);
    } catch {
      toast.error("Could not save document. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const dueDateShortcuts = [
    { label: "On Receipt", days: 0 },
    { label: "7 Days", days: 7 },
    { label: "14 Days", days: 14 },
    { label: "30 Days", days: 30 },
  ];

  return (
    <>
      {/* Fixed header */}
      <div
        className="sticky top-0 z-30"
        style={{
          background: "rgba(245,248,246,0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div
          className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between"
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 transition-opacity active:opacity-70"
            style={{ color: "#3CC864", fontSize: "15px", fontWeight: 500 }}
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.75} />
            Cancel
          </button>
          <span style={{ fontSize: "17px", fontWeight: 600, color: "#0F1A14" }}>
            New {docType === "quote" ? "Quote" : "Invoice"}
          </span>
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="rounded-[10px] px-4 h-9 font-semibold transition-all active:scale-[0.97]"
            style={{ fontSize: "14px", background: "#0F1A14", color: "#FFFFFF", opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="pb-4">
        {/* Document type tag + number */}
        <div className="flex items-center gap-3 px-5 py-4">
          <span
            className="px-3 py-1 rounded-[8px]"
            style={{ background: "rgba(60,200,100,0.10)", color: "#2BA84A", fontSize: "13px", fontWeight: 600 }}
          >
            {docType === "quote" ? "Quote" : "Invoice"}
          </span>
          <span
            className="px-3 py-1 rounded-[8px] flex items-center gap-1.5"
            style={{
              background: "#F5F8F6",
              border: "1px solid rgba(0,0,0,0.06)",
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: "13px",
              fontWeight: 600,
              color: "#7A8F82",
            }}
          >
            {documentNumber}
          </span>
        </div>

        {/* ── Section 1: Document Details ─────────────────────────────── */}
        <Section title="Document Details">
          <FieldGroup>
            <Field label="Title / Subject" required>
              <TextInput
                value={title}
                onChange={setTitle}
                placeholder="e.g. Geyser replacement at 45 Main Rd"
              />
            </Field>

            <Field label="Issue Date">
              <DateInput value={issueDate} onChange={setIssueDate} />
            </Field>

            {docType === "invoice" ? (
              <Field label="Due Date">
                <DateInput value={dueDate} onChange={setDueDate} min={issueDate} />
                {/* Due date shortcuts */}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {dueDateShortcuts.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => setDueDate(s.days === 0 ? issueDate : addDays(issueDate, s.days))}
                      className="px-3 py-1 rounded-[100px] transition-opacity active:opacity-70"
                      style={{
                        fontSize: "12px",
                        fontWeight: 500,
                        background: "rgba(60,200,100,0.08)",
                        border: "1px solid rgba(60,200,100,0.20)",
                        color: "#2BA84A",
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </Field>
            ) : (
              <Field label="Valid Until">
                <DateInput value={validUntil} onChange={setValidUntil} min={issueDate} />
              </Field>
            )}

            <Field label="PO Number (optional)">
              <TextInput value={poNumber} onChange={setPoNumber} placeholder="Client PO number (optional)" />
            </Field>

            <Field label="Payment Terms">
              <div className="flex gap-2 flex-wrap mb-2">
                {["On Receipt", "7 days", "14 days", "30 days", "50% upfront"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setPaymentTerms(t)}
                    className="px-3 py-1 rounded-[100px] transition-opacity active:opacity-70"
                    style={{
                      fontSize: "12px",
                      fontWeight: 500,
                      background: paymentTerms === t ? "rgba(60,200,100,0.12)" : "#F5F8F6",
                      border: paymentTerms === t ? "1px solid rgba(60,200,100,0.30)" : "1px solid #E4EDE7",
                      color: paymentTerms === t ? "#2BA84A" : "#7A8F82",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <TextInput value={paymentTerms} onChange={setPaymentTerms} placeholder="e.g. Payment due within 30 days of invoice" />
            </Field>

            <Field label="Notes / Terms">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment terms, special conditions, warranty notes..."
                rows={3}
                className="w-full rounded-[10px] px-3 py-2.5 resize-none"
                style={{ fontSize: "15px", border: "1px solid #E4EDE7", color: "#1C2B22", fontFamily: "inherit", minHeight: "80px" }}
              />
            </Field>
          </FieldGroup>
        </Section>

        {/* ── Section 2: Client ────────────────────────────────────────── */}
        <Section title="Client">
          <FieldGroup>
            <Field label="Select Client">
              <ClientSearch
                customers={customers}
                selected={selectedClient}
                onSelect={setSelectedClient}
              />
            </Field>
            <Field label="Client VAT Number (optional)">
              <TextInput
                value={clientVatNumber}
                onChange={setClientVatNumber}
                placeholder="e.g. 4123456789"
              />
            </Field>
          </FieldGroup>
        </Section>

        {/* ── Section 3: Line Items ─────────────────────────────────────── */}
        <Section title={`Line Items (${lineItems.length})`}>
          <div className="px-4 py-4">
            {lineItems.map((item) => (
              <LineItemCard
                key={item.id}
                item={item}
                onChange={(u) => updateItem(item.id, u)}
                onDelete={() => deleteItem(item.id)}
              />
            ))}

            <button
              onClick={() => setShowAddItem(true)}
              className="w-full flex items-center justify-center gap-2 rounded-[12px] h-12 transition-opacity active:opacity-75"
              style={{
                background: "rgba(60,200,100,0.08)",
                border: "1.5px dashed rgba(60,200,100,0.40)",
              }}
            >
              <Plus className="w-4 h-4" style={{ color: "#2BA84A" }} strokeWidth={1.75} />
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#2BA84A" }}>Add line item</span>
            </button>
          </div>
        </Section>

        {/* ── Save button ───────────────────────────────────────────────── */}
        <div className="px-5 pt-2 pb-4">
          <button
            onClick={() => handleSave("sent")}
            disabled={saving}
            className="w-full rounded-[14px] font-semibold text-white h-[52px] transition-all active:scale-[0.97] active:opacity-90"
            style={{ fontSize: "15px", background: "#F07028", boxShadow: "0px 4px 16px rgba(240,112,40,0.28)", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving..." : `Send ${docType === "quote" ? "Quote" : "Invoice"}`}
          </button>
        </div>
      </div>

      {/* Sticky totals */}
      {lineItems.length > 0 && (
        <TotalsBlock
          lineItems={lineItems}
          depositRequired={depositRequired}
          depositPercentage={depositPercentage}
          onDepositToggle={() => setDepositRequired((v) => !v)}
          onDepositPctChange={setDepositPercentage}
        />
      )}

      {/* Add item sheet */}
      {showAddItem && (
        <AddItemSheet
          presets={presets}
          onAdd={addItem}
          onClose={() => setShowAddItem(false)}
        />
      )}
    </>
  );
}
