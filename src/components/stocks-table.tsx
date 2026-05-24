import { Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { type Stock, formatNumber, formatCompact } from "@/lib/mock-data";

export function StocksTable({
  title,
  rows,
  showVolume = false,
}: {
  title: string;
  rows: Stock[];
  showVolume?: boolean;
}) {
  return (
    <Card className="overflow-hidden glass p-0">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="font-mono text-sm font-semibold tracking-tight">{title}</h3>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Live
        </span>
      </div>
      <div className="divide-y divide-border">
        {rows.map((s) => {
          const up = s.changePct >= 0;
          return (
            <Link
              key={s.symbol}
              to="/stocks/$symbol"
              params={{ symbol: s.symbol }}
              className="grid grid-cols-12 items-center gap-2 px-4 py-2.5 transition-colors hover:bg-accent/5"
            >
              <div className="col-span-3 min-w-0">
                <div className="font-mono text-sm font-semibold">{s.symbol}</div>
                <div className="truncate text-xs text-muted-foreground">{s.name}</div>
              </div>
              <div className="col-span-3 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={s.spark.map((v, i) => ({ i, v }))}>
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke={up ? "var(--bull)" : "var(--bear)"}
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="col-span-3 text-right font-mono text-sm tabular-nums">
                {formatNumber(s.price)}
              </div>
              <div
                className={`col-span-3 flex items-center justify-end gap-1 font-mono text-sm tabular-nums ${
                  up ? "text-bull" : "text-bear"
                }`}
              >
                {up ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {formatNumber(Math.abs(s.changePct))}%
                {showVolume && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {formatCompact(s.volume)}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
