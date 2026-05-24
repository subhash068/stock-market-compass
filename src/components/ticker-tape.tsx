import { useLiveTick } from "@/hooks/use-live-tick";
import { getAllStocks, formatNumber } from "@/lib/mock-data";

export function TickerTape() {
  useLiveTick(3000);
  const stocks = getAllStocks();
  const row = [...stocks, ...stocks]; // duplicate for seamless loop

  return (
    <div className="relative overflow-hidden border-y border-border bg-card/60 py-2 font-mono text-xs">
      <div className="ticker-track flex w-max gap-8 whitespace-nowrap px-4">
        {row.map((s, i) => {
          const up = s.changePct >= 0;
          return (
            <div key={`${s.symbol}-${i}`} className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{s.symbol}</span>
              <span className="tabular-nums text-muted-foreground">
                {formatNumber(s.price)}
              </span>
              <span
                className={`tabular-nums ${up ? "text-bull" : "text-bear"}`}
              >
                {up ? "▲" : "▼"} {formatNumber(Math.abs(s.changePct))}%
              </span>
            </div>
          );
        })}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-card to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-card to-transparent" />
    </div>
  );
}
