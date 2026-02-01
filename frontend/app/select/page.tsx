"use client";

import Link from "next/link";

export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase/client";

interface Item {
  id: number;
  name: string;
  price: number;
}

// Supabase/PostgREST may return the joined Item as a single object or an array
type ReceiptItemRow = { Item: Item | Item[] | null };

interface SelectedItem {
  id: number;
  percentage: number;
}

function getReceiptId(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("receipt");
  if (fromUrl) return fromUrl;
  const fromTelegram = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
  return fromTelegram ?? null;
}

export default function SelectPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const rid = getReceiptId();
    setReceiptId(rid);
    if (!rid) {
      setLoading(false);
      setError("No receipt ID. Use ?receipt=123 or open via Telegram.");
      return;
    }

    async function fetchItems() {
      try {
        const { data, error: qError } = await getSupabase()
          .from("Receipt_Item")
          .select("Item(id, name, price)")
          .eq("receipt_id", rid);

        if (qError) {
          setError(qError.message);
          setItems([]);
          return;
        }

        const flatItems: Item[] = (data ?? []).flatMap((row: ReceiptItemRow) => {
          const item = row.Item;
          if (item == null) return [];
          return Array.isArray(item) ? item : [item];
        });
        setItems(flatItems);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load items");
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems((prev) => {
      const existing = prev.find((s) => s.id === itemId);
      if (existing) return prev.filter((s) => s.id !== itemId);
      return [...prev, { id: itemId, percentage: 100 }];
    });
  };

  const updatePercentage = (itemId: number, percentage: number) => {
    setSelectedItems((prev) =>
      prev.map((s) => (s.id === itemId ? { ...s, percentage } : s))
    );
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, selected) => {
      const item = items.find((i) => i.id === selected.id);
      if (item) return total + (item.price * selected.percentage) / 100;
      return total;
    }, 0);
  };

  const WEBHOOK_URL =
    "https://lizavetasamuseva.app.n8n.cloud/webhook/8ae4519f-4b20-4560-93a6-68c94a475aac";

  const handleSubmit = async () => {
    if (!receiptId || selectedItems.length === 0) return;
    setSubmitError(null);
    const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    const telegramUserId = telegramUser?.id ?? null;
    const telegramUserName =
      telegramUser &&
      [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(" ") ||
      telegramUser?.username ||
      null;
    const chosenItems = selectedItems.map((sel) => {
      const item = items.find((i) => i.id === sel.id)!;
      return {
        id: item.id,
        name: item.name,
        price: item.price,
        percentage: sel.percentage,
      };
    });
    const payload = {
      receipt_id: receiptId,
      telegram_user_id: telegramUserId,
      telegram_user_name: telegramUserName,
      items: chosenItems,
    };
    setSubmitting(true);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responseText = await res.text();
      if (!res.ok) {
        const detail = responseText || res.statusText || `HTTP ${res.status}`;
        throw new Error(`Webhook error ${res.status}: ${detail}`);
      }
      const total = calculateTotal();
      alert(`Submitted! Your total is $${total.toFixed(2)}`);
    } catch (e) {
      let message: string;
      if (e instanceof TypeError && e.message === "Failed to fetch") {
        message =
          "Failed to fetch. Possible causes: no internet, CORS blocked, or webhook unreachable. Check browser console (F12) for details.";
      } else if (e instanceof Error) {
        message = `${e.name}: ${e.message}`;
      } else {
        message = String(e);
      }
      console.error("Submit error:", e);
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-svh bg-gradient-to-b from-emerald-50 to-white flex flex-col items-center justify-center px-6 py-8">
        <p className="text-muted-foreground">Loading items…</p>
      </main>
    );
  }

  if (error || !receiptId) {
    return (
      <main className="min-h-svh bg-gradient-to-b from-emerald-50 to-white flex flex-col items-center justify-center px-6 py-8">
        <p className="text-destructive">{error ?? "Missing receipt"}</p>
        <Link href="/" className="mt-4 text-emerald-600 hover:underline">
          Back home
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-svh bg-gradient-to-b from-emerald-50 to-white flex flex-col px-6 py-8">
      <div className="max-w-md mx-auto w-full flex flex-col flex-1">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 -ml-1 py-2"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back</span>
        </Link>

        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground mb-2 tracking-tight">
          Choose items
        </h1>
        <p className="text-muted-foreground mb-8">
          Select what you want to pay for
        </p>

        <div className="flex flex-col gap-3 flex-1 overflow-y-auto overflow-x-hidden pb-4">
          {items.length === 0 ? (
            <p className="text-muted-foreground">No items on this receipt.</p>
          ) : (
            items.map((item) => {
              const selected = selectedItems.find((s) => s.id === item.id);
              const isSelected = !!selected;
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <button
                    onClick={() => toggleItemSelection(item.id)}
                    className={`
                      flex items-center justify-between py-4 px-5 rounded-2xl font-medium
                      transition-all duration-300 ease-out flex-1 min-w-0
                      active:scale-[0.98]
                      ${
                        isSelected
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                          : "bg-white border-2 border-gray-100 text-foreground hover:border-emerald-200 hover:shadow-md"
                      }
                    `}
                  >
                    <span className="truncate text-left">
                      {item.name}
                    </span>
                    <span className="shrink-0 whitespace-nowrap ml-4 font-semibold">
                      {item.price}$
                    </span>
                  </button>
                  <div
                    className={`
                      flex items-center gap-1 shrink-0
                      transition-all duration-300 ease-out
                      ${isSelected ? "w-[76px] opacity-100" : "w-0 opacity-0 overflow-hidden"}
                    `}
                  >
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={selected?.percentage ?? 100}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/^0+(?=\d)/, "");
                        if (rawValue === "" || /^\d+$/.test(rawValue)) {
                          const numValue =
                            rawValue === "" ? 0 : Math.min(100, Number(rawValue));
                          updatePercentage(item.id, numValue);
                        }
                      }}
                      onBlur={() => {
                        if (selected?.percentage === 0)
                          toggleItemSelection(item.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-12 h-11 text-center border-2 border-gray-200 rounded-xl bg-white text-foreground font-semibold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                    />
                    <span className="text-muted-foreground font-medium">%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <div className="flex items-baseline justify-between mb-6">
            <span className="text-muted-foreground font-medium">Your total</span>
            <span className="font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground">
              {calculateTotal().toFixed(2).replace(".", ",")}$
            </span>
          </div>
          {submitError && (
            <p className="mb-4 text-sm text-destructive break-words">
              {submitError}
            </p>
          )}
          <button
            onClick={handleSubmit}
            disabled={selectedItems.length === 0 || submitting}
            className="w-full py-5 px-8 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400
              text-white font-semibold text-lg rounded-2xl
              hover:shadow-lg hover:shadow-emerald-200
              active:scale-[0.98] transition-all duration-200
              disabled:shadow-none disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>
    </main>
  );
}
