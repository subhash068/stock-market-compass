import { useMemo, useState } from "react";
import {
  Area,
  Bar,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  type Candle,
  bollinger,
  ema,
  macd as macdFn,
  rsi as rsiFn,
  sma,
  formatNumber,
} from "@/lib/mock-data";

type Toggle = "sma" | "ema" | "bb";
type Lower = "volume" | "rsi" | "macd";
const RANGES = [
  { label: "1M", days: 22 },
  { label: "3M", days: 66 },
  { label: "6M", days: 120 },
];

// Render OHLC as a "candle" using Recharts Bar with a custom shape.
function CandleShape(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: { o: number; h: number; l: number; c: number };
}) {
  const { x = 0, y = 0, width = 4, height = 0, payload } = props;
  if (!payload) return null;
  const { o, h, l, c } = payload;
  if (h === l) return null;
  const up = c >= o;
  const color = up ? "var(--bull)" : "var(--bear)";
  // y is pixel of high, y + height is pixel of low
  const priceToY = (p: number) => y + ((h - p) / (h - l)) * height;
  const yOpen = priceToY(o);
  const yClose = priceToY(c);
  const top = Math.min(yOpen, yClose);
  const bodyHeight = Math.max(1, Math.abs(yClose - yOpen));
  const cx = x + width / 2;
  const bodyW = Math.max(2, width * 0.7);
  return (
    <g>
      <line x1={cx} x2={cx} y1={y} y2={y + height} stroke={color} strokeWidth={1} />
      <rect x={cx - bodyW / 2} y={top} width={bodyW} height={bodyHeight} fill={color} />
    </g>
  );
}

export function CandlestickChart({ candles: allCandles }: { candles: Candle[] }) {
  const [rangeIdx, setRangeIdx] = useState(2);
  const [overlays, setOverlays] = useState<Set<Toggle>>(new Set(["sma", "ema"]));
  const [lower, setLower] = useState<Lower>("volume");

  const candles = useMemo(
    () => allCandles.slice(-RANGES[rangeIdx].days),
    [allCandles, rangeIdx],
  );
  const closes = useMemo(() => candles.map((c) => c.c), [candles]);

  const smaArr = useMemo(() => sma(closes, 20), [closes]);
  const emaArr = useMemo(() => ema(closes, 12), [closes]);
  const bb = useMemo(() => bollinger(closes, 20, 2), [closes]);
  const rsiArr = useMemo(() => rsiFn(closes, 14), [closes]);
  const macdObj = useMemo(() => macdFn(closes), [closes]);

  const data = candles.map((c, i) => ({
    date: new Date(c.t).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    o: c.o,
    h: c.h,
    l: c.l,
    c: c.c,
    v: c.v,
    range: [c.l, c.h] as [number, number],
    sma20: overlays.has("sma") ? smaArr[i] : null,
    ema12: overlays.has("ema") ? emaArr[i] : null,
    bbU: overlays.has("bb") ? bb.upper[i] : null,
    bbL: overlays.has("bb") ? bb.lower[i] : null,
  }));

  const toggleOverlay = (key: Toggle) => {
    setOverlays((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1">
          {RANGES.map((r, i) => (
            <Button
              key={r.label}
              size="sm"
              variant={i === rangeIdx ? "default" : "ghost"}
              className="h-7 px-3 font-mono text-xs"
              onClick={() => setRangeIdx(i)}
            >
              {r.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {(["sma", "ema", "bb"] as Toggle[]).map((t) => (
            <Button
              key={t}
              size="sm"
              variant={overlays.has(t) ? "secondary" : "ghost"}
              className="h-7 px-2 font-mono text-[10px] uppercase tracking-wider"
              onClick={() => toggleOverlay(t)}
            >
              {t === "sma" ? "SMA 20" : t === "ema" ? "EMA 12" : "BBands"}
            </Button>
          ))}
          <div className="mx-1 h-6 w-px bg-border" />
          {(["volume", "rsi", "macd"] as Lower[]).map((t) => (
            <Button
              key={t}
              size="sm"
              variant={lower === t ? "secondary" : "ghost"}
              className="h-7 px-2 font-mono text-[10px] uppercase tracking-wider"
              onClick={() => setLower(t)}
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
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
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                fontSize: 12,
                fontFamily: "var(--font-mono)",
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
              formatter={(value: number | string, name: string) => {
                if (name === "range") return [null, null];
                return [typeof value === "number" ? formatNumber(value) : value, name];
              }}
            />
            {overlays.has("bb") && (
              <>
                <Line type="monotone" dataKey="bbU" stroke="var(--cyan-glow)" strokeWidth={1} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="bbL" stroke="var(--cyan-glow)" strokeWidth={1} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
              </>
            )}
            <Bar dataKey="range" shape={<CandleShape />} isAnimationActive={false} />
            {overlays.has("sma") && (
              <Line type="monotone" dataKey="sma20" stroke="var(--amber-glow)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            )}
            {overlays.has("ema") && (
              <Line type="monotone" dataKey="ema12" stroke="var(--chart-5)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {lower === "volume" ? (
            <ComposedChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" hide />
              <YAxis orientation="right" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={50} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", fontSize: 11 }} />
              <Bar dataKey="v" fill="var(--cyan-glow)" opacity={0.5} isAnimationActive={false} />
            </ComposedChart>
          ) : lower === "rsi" ? (
            <ComposedChart
              data={data.map((d, i) => ({ ...d, rsi: rsiArr[i] }))}
              margin={{ top: 6, right: 8, left: 0, bottom: 0 }}
            >
              <XAxis dataKey="date" hide />
              <YAxis orientation="right" domain={[0, 100]} ticks={[30, 50, 70]} tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={50} />
              <ReferenceLine y={70} stroke="var(--bear)" strokeDasharray="3 3" />
              <ReferenceLine y={30} stroke="var(--bull)" strokeDasharray="3 3" />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", fontSize: 11 }} />
              <Area type="monotone" dataKey="rsi" stroke="var(--amber-glow)" fill="var(--amber-glow)" fillOpacity={0.15} strokeWidth={1.5} isAnimationActive={false} />
            </ComposedChart>
          ) : (
            <ComposedChart
              data={data.map((d, i) => ({
                ...d,
                macd: macdObj.macd[i],
                signal: macdObj.signal[i],
                hist: macdObj.hist[i],
              }))}
              margin={{ top: 6, right: 8, left: 0, bottom: 0 }}
            >
              <XAxis dataKey="date" hide />
              <YAxis orientation="right" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={50} />
              <ReferenceLine y={0} stroke="var(--border)" />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", fontSize: 11 }} />
              <Bar dataKey="hist" isAnimationActive={false}>
                {data.map((d, i) => {
                  const h = macdObj.hist[i] ?? 0;
                  return <rect key={i} fill={h >= 0 ? "var(--bull)" : "var(--bear)"} opacity={0.5} />;
                })}
              </Bar>
              <Line type="monotone" dataKey="macd" stroke="var(--cyan-glow)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="signal" stroke="var(--amber-glow)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
