import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Trash2 } from "lucide-react";
import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import { useLiveTick } from "@/hooks/use-live-tick";
import {
  formatCompact,
  formatNumber,
  getStock,
  MOCK_HOLDINGS,
  type Holding,
} from "@/lib/mock-data";

export const Route = createFileRoute("/_app/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — TICKR Terminal" },
      { name: "description", content: "Track holdings, P/L and allocation in real time." },
    ],
  }),
  component: PortfolioPage,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--accent)"];

function PortfolioPage() {
  useLiveTick(2500);
  const [holdings, setHoldings] = useState<Holding[]>(MOCK_HOLDINGS);

  const rows = holdings.map((h) => {
    const s = getStock(h.symbol)!;
    const value = s.price * h.shares;
    const cost = h.avgCost * h.shares;
    const pl = value - cost;
    return {
      ...h,
      name: s.name,
      price: s.price,
      changePct: s.changePct,
      value,
      cost,
      pl,
      plPct: (pl / cost) * 100,
      dayPl: (s.changePct / 100) * value,
    };
  });

  const totalValue = rows.reduce((a, r) => a + r.value, 0);
  const totalCost = rows.reduce((a, r) => a + r.cost, 0);
  const totalPl = totalValue - totalCost;
  const totalPlPct = (totalPl / totalCost) * 100;
  const totalDayPl = rows.reduce((a, r) => a + r.dayPl, 0);

  const alloc = rows.map((r) => ({ name: r.symbol, value: r.value }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPI label="Total Value" value={`$${formatNumber(totalValue)}`} />
        <KPI
          label="Total P&L"
          value={`${totalPl >= 0 ? "+" : ""}$${formatNumber(Math.abs(totalPl))}`}
          sub={`${totalPlPct >= 0 ? "+" : ""}${formatNumber(totalPlPct)}%`}
          tone={totalPl >= 0 ? "bull" : "bear"}
        />
        <KPI
          label="Day P&L"
          value={`${totalDayPl >= 0 ? "+" : ""}$${formatNumber(Math.abs(totalDayPl))}`}
          tone={totalDayPl >= 0 ? "bull" : "bear"}
        />
        <KPI label="Cost Basis" value={`$${formatNumber(totalCost)}`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="glass overflow-hidden p-0 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="font-mono text-sm font-semibold tracking-tight">
              Holdings
            </h3>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {rows.length} positions
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2 text-left">Symbol</th>
                  <th className="px-2 py-2 text-right">Qty</th>
                  <th className="px-2 py-2 text-right">Avg</th>
                  <th className="px-2 py-2 text-right">Last</th>
                  <th className="px-2 py-2 text-right">Day %</th>
                  <th className="px-2 py-2 text-right">Value</th>
                  <th className="px-2 py-2 text-right">P&amp;L</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.symbol} className="hover:bg-accent/5">
                    <td className="px-4 py-2.5">
                      <Link
                        to="/stocks/$symbol"
                        params={{ symbol: r.symbol }}
                        className="block"
                      >
                        <div className="font-mono text-sm font-semibold">
                          {r.symbol}
                        </div>
                        <div className="text-xs text-muted-foreground">{r.name}</div>
                      </Link>
                    </td>
                    <td className="px-2 py-2.5 text-right font-mono tabular-nums">
                      {r.shares}
                    </td>
                    <td className="px-2 py-2.5 text-right font-mono tabular-nums">
                      ${formatNumber(r.avgCost)}
                    </td>
                    <td className="px-2 py-2.5 text-right font-mono tabular-nums">
                      ${formatNumber(r.price)}
                    </td>
                    <td
                      className={`px-2 py-2.5 text-right font-mono tabular-nums ${
                        r.changePct >= 0 ? "text-bull" : "text-bear"
                      }`}
                    >
                      <span className="inline-flex items-center gap-0.5">
                        {r.changePct >= 0 ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {formatNumber(Math.abs(r.changePct))}%
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-right font-mono tabular-nums">
                      ${formatCompact(r.value)}
                    </td>
                    <td
                      className={`px-2 py-2.5 text-right font-mono tabular-nums ${
                        r.pl >= 0 ? "text-bull" : "text-bear"
                      }`}
                    >
                      {r.pl >= 0 ? "+" : ""}
                      ${formatNumber(Math.abs(r.pl))}
                      <div className="text-[10px]">
                        ({r.plPct >= 0 ? "+" : ""}
                        {formatNumber(r.plPct)}%)
                      </div>
                    </td>
                    <td className="px-2 py-2.5">
                      <button
                        onClick={() =>
                          setHoldings((h) => h.filter((x) => x.symbol !== r.symbol))
                        }
                        className="text-muted-foreground hover:text-bear"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="glass p-4">
          <h3 className="font-mono text-sm font-semibold tracking-tight">Allocation</h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={alloc}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                  stroke="var(--background)"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {alloc.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    fontSize: 11,
                  }}
                  formatter={(v: number) => `$${formatNumber(v)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5">
            {alloc.map((a, i) => (
              <div key={a.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-sm"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="font-mono">{a.name}</span>
                </span>
                <span className="font-mono tabular-nums text-muted-foreground">
                  {((a.value / totalValue) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function KPI({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "bull" | "bear";
}) {
  return (
    <Card className="glass p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 font-mono text-2xl font-semibold tabular-nums ${
          tone === "bull" ? "text-bull" : tone === "bear" ? "text-bear" : ""
        }`}
      >
        {value}
      </div>
      {sub && (
        <div
          className={`font-mono text-xs tabular-nums ${
            tone === "bull" ? "text-bull" : tone === "bear" ? "text-bear" : "text-muted-foreground"
          }`}
        >
          {sub}
        </div>
      )}
    </Card>
  );
}
