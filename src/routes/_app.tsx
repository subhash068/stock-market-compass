import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Bell, Command, Search } from "lucide-react";
import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { TickerTape } from "@/components/ticker-tape";
import { Input } from "@/components/ui/input";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useLiveTick } from "@/hooks/use-live-tick";
import { getAllStocks } from "@/lib/mock-data";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function MarketClock() {
  useLiveTick(1000);
  const now = new Date();
  return (
    <div className="hidden items-center gap-3 font-mono text-xs text-muted-foreground md:flex">
      <span className="inline-flex items-center gap-1.5">
        <span className="relative inline-flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bull opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-bull" />
        </span>
        MARKET OPEN
      </span>
      <span className="tabular-nums">
        {now.toLocaleTimeString("en-US", { hour12: false })} ET
      </span>
    </div>
  );
}

function SearchBar() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const stocks = getAllStocks();
  const matches = q
    ? stocks.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q.toLowerCase()) ||
          s.name.toLowerCase().includes(q.toLowerCase()),
      ).slice(0, 6)
    : [];

  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search ticker…"
        className="h-8 border-border bg-secondary/60 pl-8 pr-12 font-mono text-xs placeholder:text-muted-foreground/70 focus-visible:ring-primary/40"
      />
      <kbd className="pointer-events-none absolute right-2 top-1/2 inline-flex h-5 -translate-y-1/2 items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground">
        <Command className="h-2.5 w-2.5" />K
      </kbd>
      {open && matches.length > 0 && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-xl">
          {matches.map((s) => (
            <Link
              key={s.symbol}
              to="/stocks/$symbol"
              params={{ symbol: s.symbol }}
              onClick={() => setQ("")}
              className="flex items-center justify-between gap-2 px-3 py-2 text-xs hover:bg-accent/10"
            >
              <div>
                <div className="font-mono font-semibold">{s.symbol}</div>
                <div className="text-[10px] text-muted-foreground">{s.name}</div>
              </div>
              <div
                className={`font-mono tabular-nums ${
                  s.changePct >= 0 ? "text-bull" : "text-bear"
                }`}
              >
                {s.changePct >= 0 ? "+" : ""}
                {s.changePct.toFixed(2)}%
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function AppLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const title =
    pathname === "/dashboard" ? "Dashboard"
    : pathname.startsWith("/stocks") ? "Stock Detail"
    : pathname === "/portfolio" ? "Portfolio"
    : pathname === "/watchlist" ? "Watchlist"
    : pathname === "/news" ? "News & Sentiment"
    : pathname === "/markets" ? "Markets"
    : pathname === "/ai" ? "AI Forecast"
    : pathname === "/settings" ? "Settings"
    : "Terminal";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-border bg-background/85 px-3 backdrop-blur">
            <SidebarTrigger className="h-8 w-8" />
            <div className="hidden items-center gap-2 sm:flex">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                /
              </span>
              <span className="font-mono text-sm font-medium tracking-tight">{title}</span>
            </div>
            <div className="flex flex-1 items-center justify-end gap-3">
              <SearchBar />
              <MarketClock />
              <button className="relative hidden h-8 w-8 items-center justify-center rounded-md border border-border bg-secondary/60 text-muted-foreground hover:text-foreground sm:inline-flex">
                <Bell className="h-3.5 w-3.5" />
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary" />
              </button>
            </div>
          </header>
          <TickerTape />
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
