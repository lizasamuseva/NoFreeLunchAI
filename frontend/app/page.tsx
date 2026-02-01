import { ChevronRight } from "lucide-react"
import Link from "next/link"

export default function PaymentMethodPage() {
  return (
    <main className="min-h-svh bg-gradient-to-b from-emerald-50 to-white flex flex-col px-6 pt-24 pb-10">
      <div className="max-w-md mx-auto w-full">
        <p className="text-emerald-600 font-medium text-sm uppercase tracking-widest mb-3">
          Bill Splitter
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-5xl font-semibold text-foreground mb-4 tracking-tight text-balance leading-tight">
          How would you like to split?
        </h1>
        <p className="text-muted-foreground text-base mb-12">
          Choose your preferred method below
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href="/items"
            className="group w-full py-5 px-8 bg-white border-2 border-emerald-200 rounded-2xl text-foreground font-medium text-lg
              hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-100 
              active:scale-[0.98] transition-all duration-200 flex items-center justify-between"
          >
            <span>Equally</span>
            <span className="text-emerald-500 group-hover:translate-x-1 transition-transform duration-200">
              <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
            </span>
          </Link>

          <Link
            href="/select"
            className="group w-full py-5 px-8 bg-emerald-500 rounded-2xl text-white font-medium text-lg
              hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200 
              active:scale-[0.98] transition-all duration-200 flex items-center justify-between"
          >
            <span>Custom</span>
            <span className="group-hover:translate-x-1 transition-transform duration-200">
              <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
            </span>
          </Link>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-auto pb-6">
        Split bills with friends, hassle-free
      </p>
    </main>
  )
}
