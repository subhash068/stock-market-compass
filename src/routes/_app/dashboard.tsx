import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Bot, Sparkles, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MarketStatCard } from "@/components/market-stat-card";
import { StocksTable } from "@/components/stocks-table";
import { useLiveTick } from "@/hooks/use-live-tick";
import {
  formatCompact,
  formatNumber,
  getIndices,
  getMostActive,
  getTopGainers,
  getTopLosers,
  MOCK_HOLDINGS,
  getStock,
  MOCK_NEWS,
  timeAgo,
} from "@/lib/mock-data";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — TICKR Terminal" },
      { name: "description", content: "Real-time market overview, top movers, watchlist and portfolio." },
    ],
  }),
  component: DashboardPage,
});

function PortfolioMini() {
  useLiveTick(3000);
  const rows = MOCK_HOLDINGS.map((h) => {
    const s = getStock(h.symbol)!;
    const value = s.price * h.shares;
    const cost = h.avgCost * h.shares;
    const pl = value - cost;
    return { ...h, price: s.price, value, pl, plPct: (pl / cost) * 100 };
  });
  const total = rows.reduce((a, r) => a + r.value, 0);
  const totalCost = rows.reduce((a, r) => a + r.avgCost * r.shares, 0);
  const totalPl = total - totalCost;
  const totalPlPct = (totalPl / totalCost) * 100;

  return (
    <Card className="glass p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Portfolio Value
          </div>
          <div className="mt-1 font-mono text-3xl font-semibold tabular-nums">
            ${formatNumber(total)}
          </div>
          <div
            className={`font-mono text-sm tabular-nums ${
              totalPl >= 0 ? "text-bull" : "text-bear"
            }`}
          >
            {totalPl >= 0 ? "+" : ""}
            ${formatNumber(Math.abs(totalPl))} ({totalPlPct >= 0 ? "+" : ""}
            {formatNumber(totalPlPct)}%)
          </div>
        </div>
        <Link
          to="/portfolio"
          className="rounded-md border border-border bg-secondary/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          Open →
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        {rows.slice(0, 6).map((r) => (
          <div
            key={r.symbol}
            className="rounded-sm border border-border/60 bg-background/40 p-2"
          >
            <div className="font-mono text-xs font-semibold">{r.symbol}</div>
            <div className="font-mono tabular-nums text-muted-foreground">
              {formatCompact(r.value)}
            </div>
            <div
              className={`font-mono text-[10px] tabular-nums ${
                r.pl >= 0 ? "text-bull" : "text-bear"
              }`}
            >
              {r.pl >= 0 ? "+" : ""}
              {formatNumber(r.plPct)}%
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SentimentMeter() {
  useLiveTick(5000);
  const score = 0.42; // Mock aggregate sentiment
  const pct = (score + 1) * 50;
  return (
    <Card className="glass p-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Market Sentiment
        </div>
        <Sparkles className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="mt-3 font-mono text-2xl font-semibold tabular-nums">
        {score >= 0 ? "+" : ""}
        {formatNumber(score)}
      </div>
      <div className="text-xs text-muted-foreground">
        {score > 0.2 ? "Bullish" : score < -0.2 ? "Bearish" : "Neutral"} · 142 sources
      </div>
      <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${pct}%`,
            background:
              "linear-gradient(90deg, var(--bear), var(--neutral) 50%, var(--bull))",
          }}
        />
        <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>BEAR</span>
        <span>BULL</span>
      </div>
    </Card>
  );
}

function NewsStrip() {
  return (
    <Card className="glass overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="font-mono text-sm font-semibold tracking-tight">Newswire</h3>
        <Link
          to="/news"
          className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          All news →
        </Link>
      </div>
      <div className="divide-y divide-border">
        {MOCK_NEWS.slice(0, 5).map((n) => (
          <div key={n.id} className="px-4 py-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{n.headline}</div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {n.source} · {n.category} · {timeAgo(n.publishedAt)}
                  {n.symbol && ` · ${n.symbol}`}
                </div>
              </div>
              <div
                className={`shrink-0 rounded-sm px-1.5 py-0.5 font-mono text-[10px] ${
                  n.sentiment === "positive"
                    ? "bg-bull/10 text-bull"
                    : n.sentiment === "negative"
                      ? "bg-bear/10 text-bear"
                      : "bg-secondary text-muted-foreground"
                }`}
              >
                {n.score >= 0 ? "+" : ""}
                {n.score.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DashboardPage() {
  useLiveTick(3000);
  const indices = getIndices();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <Activity className="h-3 w-3" />
          Global Markets · Live
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Good morning, Trader
        </h1>
        <p className="text-sm text-muted-foreground">
          Markets are <span className="text-bull">mostly higher</span> · S&amp;P futures
          firm into the open
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {indices.map((i) => (
          <MarketStatCard key={i.symbol} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PortfolioMini />
        </div>
        <SentimentMeter />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StocksTable title="Top Gainers" rows={getTopGainers(6)} />
        <StocksTable title="Top Losers" rows={getTopLosers(6)} />
        <StocksTable title="Most Active" rows={getMostActive(6)} showVolume />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <NewsStrip />
        </div>
        <Card className="glass relative overflow-hidden p-5">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="relative">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <Bot className="h-3 w-3 text-primary" />
              AI Trading Copilot
            </div>
            <div className="mt-2 font-mono text-sm leading-relaxed">
              <span className="text-primary">›</span> Semiconductors lead on the
              week. <span className="text-bull">NVDA</span>,{" "}
              <span className="text-bull">AVGO</span> breaking 20-day highs.
            </div>
            <div className="mt-1 font-mono text-sm leading-relaxed">
              <span className="text-primary">›</span> Watching{" "}
              <span className="text-accent">TSLA</span> for RSI mean-reversion
              signal at 38.
            </div>
            <Link
              to="/ai"
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 font-mono text-xs font-semibold text-primary-foreground glow-amber"
            >
              <TrendingUp className="h-3.5 w-3.5" /> Open Forecast
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
