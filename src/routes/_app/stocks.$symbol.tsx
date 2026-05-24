import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowDownRight, ArrowLeft, ArrowUpRight, Star } from "lucide-react";
import { useState } from "react";
import { CandlestickChart } from "@/components/candlestick-chart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLiveTick } from "@/hooks/use-live-tick";
import {
  formatCompact,
  formatNumber,
  forecast,
  getCandles,
  getStock,
} from "@/lib/mock-data";

export const Route = createFileRoute("/_app/stocks/$symbol")({
  loader: ({ params }) => {
    const stock = getStock(params.symbol);
    if (!stock) throw notFound();
    return { symbol: params.symbol.toUpperCase() };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.symbol ?? "Stock"} — TICKR Terminal` },
      { name: "description", content: `Real-time chart, technical indicators and AI forecast for ${loaderData?.symbol ?? ""}.` },
    ],
  }),
  notFoundComponent: () => (
    <div className="p-8 text-center text-muted-foreground">
      Ticker not found.{" "}
      <Link to="/dashboard" className="text-primary">
        Back to dashboard
      </Link>
    </div>
  ),
  component: StockPage,
});

function StockPage() {
  const { symbol } = Route.useParams();
  useLiveTick(2000);
  const stock = getStock(symbol)!;
  const candles = getCandles(symbol, 180);
  const closes = candles.map((c) => c.c);
  const fc = forecast(closes, 14);
  const [starred, setStarred] = useState(false);
  const up = stock.changePct >= 0;

  const fcCombined = [
    ...candles.slice(-30).map((c) => ({
      date: new Date(c.t).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      actual: c.c,
      forecast: null as number | null,
    })),
    ...fc.map((p, i) => {
      const d = new Date(Date.now() + (i + 1) * 86400000);
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        actual: null,
        forecast: p,
      };
    }),
  ];

  const targetPrice = fc[fc.length - 1];
  const targetPct = ((targetPrice - stock.price) / stock.price) * 100;
  const signal = targetPct > 3 ? "BUY" : targetPct < -3 ? "SELL" : "HOLD";
  const signalColor =
    signal === "BUY" ? "text-bull bg-bull/10" : signal === "SELL" ? "text-bear bg-bear/10" : "text-primary bg-primary/10";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Back
          </Link>
          <div className="mt-1 flex items-baseline gap-3">
            <h1 className="font-mono text-3xl font-semibold tracking-tight">
              {stock.symbol}
            </h1>
            <span className="text-sm text-muted-foreground">{stock.name}</span>
            <span className="rounded-sm border border-border bg-secondary/60 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {stock.sector}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-mono text-4xl font-semibold tabular-nums">
              ${formatNumber(stock.price)}
            </span>
            <span
              className={`inline-flex items-center gap-1 font-mono text-base tabular-nums ${
                up ? "text-bull" : "text-bear"
              }`}
            >
              {up ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              {up ? "+" : ""}
              {formatNumber(stock.change)} ({up ? "+" : ""}
              {formatNumber(stock.changePct)}%)
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStarred((s) => !s)}
            className="h-9 gap-1.5"
          >
            <Star
              className={`h-3.5 w-3.5 ${starred ? "fill-primary text-primary" : ""}`}
            />
            {starred ? "Watching" : "Watchlist"}
          </Button>
          <Button size="sm" className="h-9 glow-amber">
            + Add to Portfolio
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
        {[
          { label: "Open", value: `$${formatNumber(candles.at(-1)!.o)}` },
          { label: "High", value: `$${formatNumber(candles.at(-1)!.h)}` },
          { label: "Low", value: `$${formatNumber(candles.at(-1)!.l)}` },
          { label: "Volume", value: formatCompact(stock.volume) },
          { label: "Mkt Cap", value: formatCompact(stock.marketCap) },
          { label: "52W Range", value: `${formatNumber(Math.min(...closes))} – ${formatNumber(Math.max(...closes))}` },
        ].map((s) => (
          <div key={s.label} className="rounded-md border border-border bg-card/40 p-2">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {s.label}
            </div>
            <div className="mt-0.5 font-mono text-sm font-semibold tabular-nums">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <Card className="glass p-4">
        <CandlestickChart candles={candles} />
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="glass relative overflow-hidden p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-sm font-semibold tracking-tight">
              AI 14-Day Forecast
            </h3>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Linear-regression model
            </span>
          </div>
          <div className="mt-3 h-[220px]">
            <ForecastChart data={fcCombined} />
          </div>
        </Card>
        <Card className="glass space-y-3 p-4">
          <h3 className="font-mono text-sm font-semibold tracking-tight">
            Model Output
          </h3>
          <div className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-sm font-bold ${signalColor}`}>
            {signal} SIGNAL
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Target (14d)
            </div>
            <div className="font-mono text-2xl font-semibold tabular-nums">
              ${formatNumber(targetPrice)}
            </div>
            <div
              className={`font-mono text-xs tabular-nums ${
                targetPct >= 0 ? "text-bull" : "text-bear"
              }`}
            >
              {targetPct >= 0 ? "+" : ""}
              {formatNumber(targetPct)}% expected
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Confidence</span>
              <span className="font-mono tabular-nums">72%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-[72%] bg-gradient-to-r from-primary to-accent" />
            </div>
          </div>
          <p className="border-t border-border pt-3 text-xs text-muted-foreground">
            Forecast based on 120-day OLS regression. Not financial advice — for
            illustration only.
          </p>
        </Card>
      </div>
    </div>
  );
}

import { Area, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function ForecastChart({
  data,
}: {
  data: { date: string; actual: number | null; forecast: number | null }[];
}) {
  const splitIdx = data.findIndex((d) => d.actual == null);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="fcGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
          minTickGap={32}
        />
        <YAxis
          orientation="right"
          domain={["dataMin - 2", "dataMax + 2"]}
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          width={50}
        />
        {splitIdx > 0 && (
          <ReferenceLine
            x={data[splitIdx].date}
            stroke="var(--primary)"
            strokeDasharray="3 3"
            label={{ value: "now", fill: "var(--primary)", fontSize: 10, position: "top" }}
          />
        )}
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            fontSize: 11,
          }}
        />
        <Line type="monotone" dataKey="actual" stroke="var(--cyan-glow)" strokeWidth={1.8} dot={false} connectNulls={false} isAnimationActive={false} />
        <Area type="monotone" dataKey="forecast" stroke="var(--primary)" strokeWidth={1.8} strokeDasharray="4 4" fill="url(#fcGrad)" connectNulls={false} isAnimationActive={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
