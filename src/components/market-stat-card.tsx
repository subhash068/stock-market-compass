import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { type Index, formatNumber } from "@/lib/mock-data";

export function MarketStatCard({ index }: { index: Index }) {
  const up = index.changePct >= 0;
  return (
    <Card className="glass relative overflow-hidden p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {index.symbol}
          </div>
          <div className="text-xs text-muted-foreground">{index.name}</div>
        </div>
        <div
          className={`flex items-center gap-1 rounded-sm px-2 py-0.5 font-mono text-xs ${
            up ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear"
          }`}
        >
          {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {formatNumber(Math.abs(index.changePct))}%
        </div>
      </div>
      <div className="mt-3 font-mono text-2xl font-semibold tabular-nums tracking-tight">
        {formatNumber(index.value)}
      </div>
      <div className={`font-mono text-xs tabular-nums ${up ? "text-bull" : "text-bear"}`}>
        {up ? "+" : ""}
        {formatNumber(index.change)}
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{
          background: up
            ? "linear-gradient(90deg, transparent, var(--bull), transparent)"
            : "linear-gradient(90deg, transparent, var(--bear), transparent)",
          opacity: 0.6,
        }}
      />
    </Card>
  );
}
