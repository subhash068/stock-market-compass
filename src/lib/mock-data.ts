// Deterministic mock market data + technical indicators

export type Stock = {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePct: number;
  volume: number;
  marketCap: number;
  spark: number[];
};

export type Candle = { t: number; o: number; h: number; l: number; c: number; v: number };

// Seeded PRNG so prices are stable per render
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const UNIVERSE: Array<Omit<Stock, "price" | "change" | "changePct" | "volume" | "marketCap" | "spark">> = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corp.", sector: "Technology" },
  { symbol: "NVDA", name: "NVIDIA Corp.", sector: "Semiconductors" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technology" },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer" },
  { symbol: "META", name: "Meta Platforms", sector: "Technology" },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Automotive" },
  { symbol: "BRK.B", name: "Berkshire Hathaway", sector: "Financials" },
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Financials" },
  { symbol: "V", name: "Visa Inc.", sector: "Financials" },
  { symbol: "UNH", name: "UnitedHealth Group", sector: "Healthcare" },
  { symbol: "XOM", name: "Exxon Mobil", sector: "Energy" },
  { symbol: "WMT", name: "Walmart Inc.", sector: "Consumer" },
  { symbol: "MA", name: "Mastercard Inc.", sector: "Financials" },
  { symbol: "AVGO", name: "Broadcom Inc.", sector: "Semiconductors" },
  { symbol: "AMD", name: "Advanced Micro Devices", sector: "Semiconductors" },
  { symbol: "NFLX", name: "Netflix Inc.", sector: "Media" },
  { symbol: "DIS", name: "Walt Disney Co.", sector: "Media" },
  { symbol: "BA", name: "Boeing Co.", sector: "Industrials" },
  { symbol: "GS", name: "Goldman Sachs", sector: "Financials" },
  { symbol: "COIN", name: "Coinbase Global", sector: "Financials" },
  { symbol: "PLTR", name: "Palantir Technologies", sector: "Technology" },
];

const BASE_PRICES: Record<string, number> = {
  AAPL: 228, MSFT: 432, NVDA: 138, GOOGL: 178, AMZN: 198, META: 558,
  TSLA: 252, "BRK.B": 446, JPM: 218, V: 286, UNH: 588, XOM: 118,
  WMT: 82, MA: 498, AVGO: 168, AMD: 162, NFLX: 712, DIS: 96,
  BA: 158, GS: 502, COIN: 218, PLTR: 38,
};

// drift offset that nudges every few seconds so the UI feels live
function liveOffset(symbol: string) {
  const t = Math.floor(Date.now() / 4000); // step every 4s
  const r = mulberry32(hash(symbol) ^ t)();
  return (r - 0.5) * 0.012; // ±1.2%
}

function buildStock(meta: (typeof UNIVERSE)[number]): Stock {
  const base = BASE_PRICES[meta.symbol] ?? 100;
  const rng = mulberry32(hash(meta.symbol));
  const dayChangePct = (rng() - 0.45) * 0.06 + liveOffset(meta.symbol);
  const price = +(base * (1 + dayChangePct)).toFixed(2);
  const change = +(price - base).toFixed(2);
  const spark = Array.from({ length: 32 }, (_, i) => {
    const noise = (mulberry32(hash(meta.symbol) + i)() - 0.5) * base * 0.03;
    const trend = (i / 31) * change;
    return +(base + trend + noise).toFixed(2);
  });
  return {
    ...meta,
    price,
    change,
    changePct: +(dayChangePct * 100).toFixed(2),
    volume: Math.floor(rng() * 80_000_000) + 5_000_000,
    marketCap: Math.floor(price * (rng() * 5 + 0.5) * 1_000_000_000),
    spark,
  };
}

export function getAllStocks(): Stock[] {
  return UNIVERSE.map(buildStock);
}

export function getStock(symbol: string): Stock | undefined {
  const meta = UNIVERSE.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase());
  return meta ? buildStock(meta) : undefined;
}

export function getTopGainers(n = 5): Stock[] {
  return [...getAllStocks()].sort((a, b) => b.changePct - a.changePct).slice(0, n);
}

export function getTopLosers(n = 5): Stock[] {
  return [...getAllStocks()].sort((a, b) => a.changePct - b.changePct).slice(0, n);
}

export function getMostActive(n = 5): Stock[] {
  return [...getAllStocks()].sort((a, b) => b.volume - a.volume).slice(0, n);
}

// Indices
export type Index = { symbol: string; name: string; value: number; change: number; changePct: number };
export function getIndices(): Index[] {
  const defs = [
    { symbol: "SPX", name: "S&P 500", base: 5832 },
    { symbol: "NDX", name: "Nasdaq 100", base: 20420 },
    { symbol: "DJI", name: "Dow Jones", base: 42870 },
    { symbol: "RUT", name: "Russell 2000", base: 2298 },
    { symbol: "VIX", name: "Volatility", base: 16.3 },
    { symbol: "DXY", name: "US Dollar", base: 103.8 },
  ];
  return defs.map((d) => {
    const pct = liveOffset(d.symbol) * 5 + (mulberry32(hash(d.symbol))() - 0.5) * 0.02;
    const value = +(d.base * (1 + pct)).toFixed(2);
    return {
      symbol: d.symbol,
      name: d.name,
      value,
      change: +(value - d.base).toFixed(2),
      changePct: +(pct * 100).toFixed(2),
    };
  });
}

// Historical OHLCV candles for a symbol
export function getCandles(symbol: string, days = 120): Candle[] {
  const base = BASE_PRICES[symbol.toUpperCase()] ?? 100;
  const rng = mulberry32(hash(symbol));
  const out: Candle[] = [];
  let price = base * 0.85;
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    const drift = (rng() - 0.48) * 0.02;
    const vol = 0.012 + rng() * 0.02;
    const o = price;
    const c = +(o * (1 + drift)).toFixed(2);
    const h = +(Math.max(o, c) * (1 + rng() * vol)).toFixed(2);
    const l = +(Math.min(o, c) * (1 - rng() * vol)).toFixed(2);
    const v = Math.floor(rng() * 50_000_000) + 5_000_000;
    out.push({ t: now - i * 86400000, o, h, l, c, v });
    price = c;
  }
  return out;
}

// --- Indicators ---
export function sma(data: number[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i + 1 < period) return null;
    const slice = data.slice(i + 1 - period, i + 1);
    return +(slice.reduce((a, b) => a + b, 0) / period).toFixed(2);
  });
}

export function ema(data: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const out: (number | null)[] = [];
  let prev = data[0];
  for (let i = 0; i < data.length; i++) {
    if (i + 1 < period) {
      out.push(null);
      continue;
    }
    if (i + 1 === period) {
      prev = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    } else {
      prev = data[i] * k + prev * (1 - k);
    }
    out.push(+prev.toFixed(2));
  }
  return out;
}

export function rsi(data: number[], period = 14): (number | null)[] {
  const out: (number | null)[] = [null];
  let gains = 0, losses = 0;
  for (let i = 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    if (i <= period) {
      if (diff >= 0) gains += diff; else losses -= diff;
      if (i === period) {
        const rs = gains / period / (losses / period || 1e-9);
        out.push(+(100 - 100 / (1 + rs)).toFixed(2));
      } else out.push(null);
    } else {
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? -diff : 0;
      gains = (gains * (period - 1) + gain) / period;
      losses = (losses * (period - 1) + loss) / period;
      const rs = gains / (losses || 1e-9);
      out.push(+(100 - 100 / (1 + rs)).toFixed(2));
    }
  }
  return out;
}

export function macd(data: number[]) {
  const e12 = ema(data, 12);
  const e26 = ema(data, 26);
  const macdLine = data.map((_, i) =>
    e12[i] != null && e26[i] != null ? +((e12[i] as number) - (e26[i] as number)).toFixed(2) : null,
  );
  const validMacd = macdLine.map((v) => (v == null ? 0 : v));
  const signal = ema(validMacd, 9);
  const hist = macdLine.map((m, i) =>
    m != null && signal[i] != null ? +((m as number) - (signal[i] as number)).toFixed(2) : null,
  );
  return { macd: macdLine, signal, hist };
}

export function bollinger(data: number[], period = 20, mult = 2) {
  const mid = sma(data, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i + 1 < period) { upper.push(null); lower.push(null); continue; }
    const slice = data.slice(i + 1 - period, i + 1);
    const m = mid[i] as number;
    const variance = slice.reduce((acc, x) => acc + (x - m) ** 2, 0) / period;
    const sd = Math.sqrt(variance);
    upper.push(+(m + mult * sd).toFixed(2));
    lower.push(+(m - mult * sd).toFixed(2));
  }
  return { upper, mid, lower };
}

// Simple linear-regression "AI" forecast
export function forecast(data: number[], horizon = 14): number[] {
  const n = data.length;
  const xs = Array.from({ length: n }, (_, i) => i);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = data.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (data[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const slope = num / den;
  const intercept = meanY - slope * meanX;
  return Array.from({ length: horizon }, (_, i) => +(intercept + slope * (n + i)).toFixed(2));
}

// Portfolio
export type Holding = { symbol: string; shares: number; avgCost: number };
export const MOCK_HOLDINGS: Holding[] = [
  { symbol: "AAPL", shares: 50, avgCost: 192 },
  { symbol: "NVDA", shares: 120, avgCost: 98 },
  { symbol: "MSFT", shares: 30, avgCost: 380 },
  { symbol: "TSLA", shares: 40, avgCost: 220 },
  { symbol: "AMZN", shares: 25, avgCost: 165 },
  { symbol: "PLTR", shares: 400, avgCost: 22 },
];

// News
export type NewsItem = {
  id: string;
  symbol?: string;
  source: string;
  headline: string;
  summary: string;
  sentiment: "positive" | "negative" | "neutral";
  score: number;
  publishedAt: number;
  category: "Markets" | "Earnings" | "Macro" | "Crypto" | "Tech";
};

export const MOCK_NEWS: NewsItem[] = [
  { id: "n1", symbol: "NVDA", source: "Reuters", headline: "Nvidia tops $3.5T as Blackwell shipments accelerate", summary: "Hyperscaler demand continues to outpace supply through Q1 next year, executives reiterate.", sentiment: "positive", score: 0.82, publishedAt: Date.now() - 1000 * 60 * 12, category: "Tech" },
  { id: "n2", symbol: "TSLA", source: "Bloomberg", headline: "Tesla delivery miss weighs on EV peers", summary: "Quarterly deliveries came in 4% below consensus; gross margin pressured by price cuts.", sentiment: "negative", score: -0.61, publishedAt: Date.now() - 1000 * 60 * 47, category: "Earnings" },
  { id: "n3", source: "WSJ", headline: "Fed minutes signal patience on next rate move", summary: "Officials want more evidence inflation is on a sustained path to 2% before easing further.", sentiment: "neutral", score: 0.04, publishedAt: Date.now() - 1000 * 60 * 95, category: "Macro" },
  { id: "n4", symbol: "AAPL", source: "FT", headline: "Apple intelligence drives services revenue beat", summary: "On-device AI features boost engagement; services margin reaches record 74%.", sentiment: "positive", score: 0.71, publishedAt: Date.now() - 1000 * 60 * 130, category: "Earnings" },
  { id: "n5", symbol: "COIN", source: "CoinDesk", headline: "Spot ETH ETF inflows hit weekly record", summary: "Institutional allocations broaden across asset managers; Coinbase custody share climbs.", sentiment: "positive", score: 0.55, publishedAt: Date.now() - 1000 * 60 * 180, category: "Crypto" },
  { id: "n6", symbol: "BA", source: "Reuters", headline: "Boeing faces fresh regulator scrutiny on 737 line", summary: "FAA expands audit; deliveries to remain constrained through year-end.", sentiment: "negative", score: -0.48, publishedAt: Date.now() - 1000 * 60 * 220, category: "Markets" },
  { id: "n7", symbol: "META", source: "TechCrunch", headline: "Meta unveils next-gen Reality Labs roadmap", summary: "Lighter form factor and improved AI assistant tipped for late-2026 launch window.", sentiment: "positive", score: 0.46, publishedAt: Date.now() - 1000 * 60 * 280, category: "Tech" },
  { id: "n8", source: "Bloomberg", headline: "Oil slides as OPEC+ flags supply increase", summary: "Brent down 2.1% on the session; energy sector underperforms broader market.", sentiment: "negative", score: -0.39, publishedAt: Date.now() - 1000 * 60 * 320, category: "Markets" },
];

export function formatNumber(n: number, digits = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
export function formatCompact(n: number) {
  return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(n);
}
export function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
