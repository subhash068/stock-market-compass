import { createFileRoute } from "@tanstack/react-router";
import { StocksTable } from "@/components/stocks-table";
import { useLiveTick } from "@/hooks/use-live-tick";
import { getAllStocks } from "@/lib/mock-data";
import { useState } from "react";

const DEFAULT_WATCH = ["AAPL", "NVDA", "TSLA", "META", "AMD", "COIN", "PLTR"];

export const Route = createFileRoute("/_app/watchlist")({
  head: () => ({
    meta: [
      { title: "Watchlist — TICKR Terminal" },
      { name: "description", content: "Your starred tickers, updated live." },
    ],
  }),
  component: WatchlistPage,
});

function WatchlistPage() {
  useLiveTick(2500);
  const [list] = useState(DEFAULT_WATCH);
  const rows = getAllStocks().filter((s) => list.includes(s.symbol));
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Real-time prices for your watched tickers. Star any symbol from its detail page.
      </p>
      <StocksTable title="My Watchlist" rows={rows} showVolume />
    </div>
  );
}
