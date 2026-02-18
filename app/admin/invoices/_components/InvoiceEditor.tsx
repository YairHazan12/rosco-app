"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
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

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (i: number) => {
    setItems(items.filter((_, idx) => idx !== i));
  };

  const updateItem = (i: number, field: keyof LineItem, value: string | number) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    setItems(updated);
  };

  const addPreset = (preset: ServicePreset) => {
    setItems([
      ...items,
      {
        description: preset.name,
        quantity: 1,
        unitPrice: preset.price,
      },
    ]);
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
          items: items.map((item) => ({
            ...item,
            total: item.quantity * item.unitPrice,
          })),
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

  // Group presets by category
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quick Add from Presets */}
      <Card>
        <CardContent className="pt-4">
          <h3 className="font-semibold text-sm text-gray-700 mb-3">Quick Add Service</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {Object.entries(groupedPresets).map(([category, categoryPresets]) => (
              <div key={category}>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{category}</p>
                <div className="flex flex-wrap gap-2">
                  {categoryPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => addPreset(preset)}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-3 py-1 transition-colors"
                    >
                      {preset.name} — ₪{preset.price}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-gray-700">Invoice Items</h3>
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
              <Plus className="w-3 h-3" /> Add Item
            </Button>
          </div>

          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-6">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(i, "description", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min={1}
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="Price ₪"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* VAT Toggle */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <input
              type="checkbox"
              id="vat"
              checked={vatEnabled}
              onChange={(e) => setVatEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="vat" className="cursor-pointer">
              Include VAT (17% — Israeli standard)
            </Label>
          </div>

          {/* Totals */}
          <div className="space-y-1 text-sm pt-2 border-t">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₪{subtotal.toFixed(2)}</span>
            </div>
            {vatEnabled && (
              <div className="flex justify-between text-gray-500">
                <span>VAT (17%)</span>
                <span>₪{vatAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>₪{total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? "Creating Invoice..." : "Create Invoice"}
      </Button>
    </form>
  );
}
