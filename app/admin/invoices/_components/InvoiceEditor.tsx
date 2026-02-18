"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ServicePreset {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
}

interface Job {
  id: string;
  clientName: string;
  title: string;
}

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function InvoiceEditor({
  job,
  presets,
}: {
  job: Job;
  presets: ServicePreset[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [vatEnabled, setVatEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const VAT_RATE = 0.17;

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const vatAmount = vatEnabled ? subtotal * VAT_RATE : 0;
  const total = subtotal + vatAmount;

  const addItem = () =>
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);

  const removeItem = (i: number) =>
    setItems(items.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: keyof LineItem, value: string | number) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    setItems(updated);
  };

  const addPreset = (preset: ServicePreset) => {
    setItems([...items, { description: preset.name, quantity: 1, unitPrice: preset.price }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.some((i) => !i.description)) {
      toast.error("All items need a description");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          items: items.map((item) => ({ ...item, total: item.quantity * item.unitPrice })),
          vatEnabled,
          vatRate: VAT_RATE,
          subtotal,
          vatAmount,
          total,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const invoice = await res.json();
      toast.success("Invoice created!");
      router.push(`/admin/invoices/${invoice.id}`);
    } catch {
      toast.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const groupedPresets = presets.reduce(
    (acc, preset) => {
      const cat = preset.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(preset);
      return acc;
    },
    {} as Record<string, ServicePreset[]>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-10">
      {/* Quick Add Presets */}
      {presets.length > 0 && (
        <div>
          <p className="ios-section-header mb-2">Quick Add Service</p>
          <div className="ios-card p-4">
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {Object.entries(groupedPresets).map(([category, categoryPresets]) => (
                <div key={category}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "var(--label-tertiary)" }}
                  >
                    {category}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categoryPresets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => addPreset(preset)}
                        className="text-[13px] font-medium px-3 py-1.5 rounded-full transition-opacity active:opacity-70"
                        style={{
                          background: "rgba(0,122,255,0.1)",
                          color: "var(--ios-blue)",
                          border: "none",
                        }}
                      >
                        {preset.name} — ₪{preset.price}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Line Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="ios-section-header">Invoice Items</p>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-[14px] font-semibold min-h-[44px] px-2"
            style={{ color: "var(--brand)" }}
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        <div className="ios-card p-4 space-y-4">
          {items.map((item, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[13px] font-medium" style={{ color: "var(--label-tertiary)" }}>
                  Item {i + 1}
                </p>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    style={{ color: "var(--ios-red)" }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(i, "description", e.target.value)}
                  className="h-11 text-[16px] rounded-xl"
                  style={{
                    background: "var(--bg-primary)",
                    borderColor: "var(--border)",
                    color: "var(--label-primary)",
                  }}
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label
                      className="text-[12px]"
                      style={{ color: "var(--label-tertiary)" }}
                    >
                      Quantity
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)}
                      className="h-11 text-[16px] rounded-xl mt-1"
                      style={{
                        background: "var(--bg-primary)",
                        borderColor: "var(--border)",
                        color: "var(--label-primary)",
                      }}
                    />
                  </div>
                  <div>
                    <Label
                      className="text-[12px]"
                      style={{ color: "var(--label-tertiary)" }}
                    >
                      Unit Price ₪
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.unitPrice}
                      onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)}
                      className="h-11 text-[16px] rounded-xl mt-1"
                      style={{
                        background: "var(--bg-primary)",
                        borderColor: "var(--border)",
                        color: "var(--label-primary)",
                      }}
                    />
                  </div>
                </div>
                {(item.quantity > 1 || item.unitPrice > 0) && (
                  <p className="text-[13px] text-right" style={{ color: "var(--label-tertiary)" }}>
                    ₪{(item.quantity * item.unitPrice).toFixed(2)}
                  </p>
                )}
              </div>
              {i < items.length - 1 && (
                <div className="mt-4 border-t" style={{ borderColor: "var(--separator)" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* VAT + Totals */}
      <div>
        <p className="ios-section-header mb-2">Summary</p>
        <div className="ios-card p-4">
          {/* VAT toggle */}
          <div
            className="flex items-center justify-between mb-4 pb-4"
            style={{ borderBottom: "0.5px solid var(--separator)" }}
          >
            <div>
              <p className="font-medium text-[15px]" style={{ color: "var(--label-primary)" }}>
                Include VAT
              </p>
              <p className="text-[13px] mt-0.5" style={{ color: "var(--label-tertiary)" }}>
                17% — Israeli standard
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={vatEnabled}
                onChange={(e) => setVatEnabled(e.target.checked)}
                className="sr-only"
              />
              <div
                className="w-12 h-7 rounded-full transition-colors"
                style={{
                  background: vatEnabled ? "var(--ios-green)" : "var(--separator)",
                }}
              >
                <div
                  className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform"
                  style={{
                    transform: vatEnabled ? "translateX(21px)" : "translateX(2px)",
                  }}
                />
              </div>
            </label>
          </div>

          {/* Totals */}
          <div className="space-y-2.5">
            <div className="flex justify-between text-[14px]" style={{ color: "var(--label-tertiary)" }}>
              <span>Subtotal</span>
              <span>₪{subtotal.toFixed(2)}</span>
            </div>
            {vatEnabled && (
              <div className="flex justify-between text-[14px]" style={{ color: "var(--label-tertiary)" }}>
                <span>VAT (17%)</span>
                <span>₪{vatAmount.toFixed(2)}</span>
              </div>
            )}
            <div
              className="flex justify-between pt-2.5"
              style={{ borderTop: "0.5px solid var(--separator)" }}
            >
              <span className="font-bold text-[18px]" style={{ color: "var(--label-primary)" }}>
                Total
              </span>
              <span
                className="font-bold text-[22px]"
                style={{ color: "var(--brand)", letterSpacing: "-0.3px" }}
              >
                ₪{total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="ios-btn-brand"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Creating Invoice...</>
        ) : (
          "Create Invoice"
        )}
      </button>
    </form>
  );
}
