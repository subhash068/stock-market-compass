import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatNumber, forecast, getAllStocks, getCandles, getStock } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/ai")({
  head: () => ({
    meta: [
      { title: "AI Forecast — TICKR Terminal" },
      { name: "description", content: "AI-powered price forecasts and buy/sell signals." },
    ],
  }),
  component: AIPage,
});

function AIPage() {
  const universe = getAllStocks();
  const [symbol, setSymbol] = useState("NVDA");
  const stock = getStock(symbol)!;

  const candles = getCandles(symbol, 180);
  const closes = candles.map((c) => c.c);
  const fc = forecast(closes, 21);

  const data = useMemo(
    () => [
      ...candles.slice(-45).map((c) => ({
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
    ],
    [candles, fc],
  );

  const signals = universe.slice(0, 10).map((s) => {
    const cs = getCandles(s.symbol, 90).map((c) => c.c);
    const f = forecast(cs, 14);
    const target = f[f.length - 1];
    const pct = ((target - s.price) / s.price) * 100;
    return {
      symbol: s.symbol,
      name: s.name,
      price: s.price,
      target,
      pct,
      signal: pct > 3 ? "BUY" : pct < -3 ? "SELL" : "HOLD",
    };
  });

  return (
    <div className="space-y-4">
      <Card className="glass relative overflow-hidden p-5">
        <div className="absolute inset-0 grid-bg opacity-10" />
        <div className="relative flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary glow-amber">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-mono text-lg font-semibold tracking-tight">
              AI Trading Copilot
            </h2>
            <p className="text-sm text-muted-foreground">
              Linear-regression forecasts trained on 180 days of price action.
              <span className="ml-2 inline-flex items-center gap-1 text-primary">
                <Sparkles className="h-3 w-3" /> Powered by TICKR ML
              </span>
            </p>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-1">
        {universe.slice(0, 12).map((s) => (
          <Button
            key={s.symbol}
            size="sm"
            variant={s.symbol === symbol ? "default" : "ghost"}
            className="h-7 font-mono text-[10px]"
            onClick={() => setSymbol(s.symbol)}
          >
            {s.symbol}
          </Button>
        ))}
      </div>

      <Card className="glass p-4">
        <div className="mb-2 flex items-baseline justify-between">
          <div>
            <h3 className="font-mono text-sm font-semibold tracking-tight">
              {symbol} · 21-day projection
            </h3>
            <p className="text-xs text-muted-foreground">{stock.name}</p>
          </div>
          <div className="text-right">
            <div className="font-mono text-2xl font-semibold tabular-nums">
              ${formatNumber(fc[fc.length - 1])}
            </div>
            <div
              className={`font-mono text-xs tabular-nums ${
                fc[fc.length - 1] >= stock.price ? "text-bull" : "text-bear"
              }`}
            >
              target ({((fc[fc.length - 1] - stock.price) / stock.price * 100).toFixed(2)}%)
            </div>
          </div>
        </div>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fcGradAI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={{ stroke: "var(--border)" }} minTickGap={32} />
              <YAxis orientation="right" domain={["dataMin - 5", "dataMax + 5"]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={50} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", fontSize: 11 }} />
              <ReferenceLine
                x={data.findIndex((d) => d.actual == null) > 0 ? data[data.findIndex((d) => d.actual == null)].date : undefined}
                stroke="var(--primary)"
                strokeDasharray="3 3"
                label={{ value: "now", fill: "var(--primary)", fontSize: 10, position: "top" }}
              />
              <Line type="monotone" dataKey="actual" stroke="var(--cyan-glow)" strokeWidth={1.8} dot={false} connectNulls={false} isAnimationActive={false} />
              <Area type="monotone" dataKey="forecast" stroke="var(--primary)" strokeWidth={1.8} strokeDasharray="4 4" fill="url(#fcGradAI)" connectNulls={false} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="glass overflow-hidden p-0">
        <div className="border-b border-border px-4 py-3">
          <h3 className="font-mono text-sm font-semibold tracking-tight">
            Daily Signals
          </h3>
        </div>
        <div className="divide-y divide-border">
          {signals.map((s) => (
            <Link
              key={s.symbol}
              to="/stocks/$symbol"
              params={{ symbol: s.symbol }}
              className="grid grid-cols-12 items-center gap-2 px-4 py-2.5 hover:bg-accent/5"
            >
              <div className="col-span-4">
                <div className="font-mono text-sm font-semibold">{s.symbol}</div>
                <div className="truncate text-xs text-muted-foreground">{s.name}</div>
              </div>
              <div className="col-span-2 text-right font-mono text-sm tabular-nums">
                ${formatNumber(s.price)}
              </div>
              <div className="col-span-2 text-right font-mono text-sm tabular-nums">
                ${formatNumber(s.target)}
              </div>
              <div
                className={`col-span-2 text-right font-mono text-sm tabular-nums ${
                  s.pct >= 0 ? "text-bull" : "text-bear"
                }`}
              >
                {s.pct >= 0 ? "+" : ""}
                {formatNumber(s.pct)}%
              </div>
              <div className="col-span-2 text-right">
                <span
                  className={`inline-flex rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold ${
                    s.signal === "BUY"
                      ? "bg-bull/15 text-bull"
                      : s.signal === "SELL"
                        ? "bg-bear/15 text-bear"
                        : "bg-primary/15 text-primary"
                  }`}
                >
                  {s.signal}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
