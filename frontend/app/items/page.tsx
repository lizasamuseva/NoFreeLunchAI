"use client"

import Link from "next/link"
import { useState } from "react"

interface Item {
  id: number
  name: string
  price: number
}

const items: Item[] = [
  { id: 1, name: "Item 10000", price: 10 },
  { id: 2, name: "Item 200", price: 5 },
  { id: 3, name: "Item 3", price: 5 },
  { id: 4, name: "Item 10000", price: 10 },
  { id: 5, name: "Item 200", price: 5 },
  { id: 6, name: "Item 3", price: 5 },
  { id: 7, name: "Item 10000", price: 10 },
  { id: 8, name: "Item 200", price: 5 },
  { id: 9, name: "Item 3", price: 5 },
  { id: 10, name: "Item 10000", price: 10 },
  { id: 11, name: "Item 200", price: 5 },
  { id: 12, name: "Item 3", price: 5 },
  { id: 13, name: "Item 10000", price: 10 },
  { id: 14, name: "Item 200", price: 5 },
  { id: 15, name: "Item 3", price: 5 },
  { id: 16, name: "Item 10000", price: 10 },
  { id: 17, name: "Item 200", price: 5 },
  { id: 18, name: "Item 3", price: 5 },
]

interface SelectedItem {
  id: number
  percentage: number
}

export default function ItemsPage() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])

  const toggleItemSelection = (itemId: number) => {
    setSelectedItems((prev) => {
      const existing = prev.find((s) => s.id === itemId)
      if (existing) {
        return prev.filter((s) => s.id !== itemId)
      }
      return [...prev, { id: itemId, percentage: 100 }]
    })
  }

  const updatePercentage = (itemId: number, percentage: number) => {
    setSelectedItems((prev) =>
      prev.map((s) => (s.id === itemId ? { ...s, percentage } : s))
    )
  }

  const calculateTotal = () => {
    return selectedItems.reduce((total, selected) => {
      const item = items.find((i) => i.id === selected.id)
      if (item) {
        return total + (item.price * selected.percentage) / 100
      }
      return total
    }, 0)
  }

  const handleSubmit = () => {
    const total = calculateTotal()
    alert(`Your total is $${total.toFixed(2)}`)
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
          {items.map((item) => {
            const selected = selectedItems.find((s) => s.id === item.id)
            const isSelected = !!selected

            return (
              <div key={item.id} className="flex items-center gap-3">
                <button
                  onClick={() => toggleItemSelection(item.id)}
                  className={`
                    flex items-center py-4 px-5 rounded-2xl font-medium
                    transition-all duration-300 ease-out flex-1 min-w-0 overflow-hidden
                    active:scale-[0.98]
                    ${
                      isSelected
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                        : "bg-white border-2 border-gray-100 text-foreground hover:border-emerald-200 hover:shadow-md"
                    }
                  `}
                >
                  <span className="w-24 shrink-0 truncate text-left">{item.name}</span>
                  <span className={`flex-1 mx-1 overflow-hidden text-right tracking-[0.2em] whitespace-nowrap ${isSelected ? "opacity-30" : "opacity-30"}`}>
                    {"...................."}
                  </span>
                  <span className="shrink-0 whitespace-nowrap w-10 text-right font-semibold">{item.price}$</span>
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
                      const rawValue = e.target.value.replace(/^0+(?=\d)/, "")
                      if (rawValue === "" || /^\d+$/.test(rawValue)) {
                        const numValue = rawValue === "" ? 0 : Math.min(100, Number(rawValue))
                        updatePercentage(item.id, numValue)
                      }
                    }}
                    onBlur={() => {
                      if (selected?.percentage === 0) {
                        toggleItemSelection(item.id)
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-12 h-11 text-center border-2 border-gray-200 rounded-xl bg-white text-foreground font-semibold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                  <span className="text-muted-foreground font-medium">%</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <div className="flex items-baseline justify-between mb-6">
            <span className="text-muted-foreground font-medium">Your total</span>
            <span className="font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground">
              {calculateTotal().toFixed(2).replace(".", ",")}$
            </span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={selectedItems.length === 0}
            className="w-full py-5 px-8 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400
              text-white font-semibold text-lg rounded-2xl 
              hover:shadow-lg hover:shadow-emerald-200 
              active:scale-[0.98] transition-all duration-200
              disabled:shadow-none disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>
      </div>
    </main>
  )
}
