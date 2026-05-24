import { createFileRoute } from "@tanstack/react-router";
import { StocksTable } from "@/components/stocks-table";
import { useLiveTick } from "@/hooks/use-live-tick";
import { getAllStocks, getTopGainers, getTopLosers, getMostActive } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/markets")({
  head: () => ({
    meta: [
      { title: "Markets — TICKR Terminal" },
      { name: "description", content: "Browse the full universe of tracked tickers." },
    ],
  }),
  component: MarketsPage,
});

function MarketsPage() {
  useLiveTick(2500);
  const all = getAllStocks();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StocksTable title="Top Gainers" rows={getTopGainers(8)} />
        <StocksTable title="Top Losers" rows={getTopLosers(8)} />
        <StocksTable title="Most Active" rows={getMostActive(8)} showVolume />
      </div>
      <StocksTable title="All Tickers" rows={all} showVolume />
    </div>
  );
}
