import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_NEWS, timeAgo, type NewsItem } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/news")({
  head: () => ({
    meta: [
      { title: "News & Sentiment — TICKR Terminal" },
      { name: "description", content: "Latest market news with AI sentiment scoring." },
    ],
  }),
  component: NewsPage,
});

const CATEGORIES: (NewsItem["category"] | "All")[] = ["All", "Markets", "Earnings", "Macro", "Tech", "Crypto"];

function NewsPage() {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const items = useMemo(
    () => (cat === "All" ? MOCK_NEWS : MOCK_NEWS.filter((n) => n.category === cat)),
    [cat],
  );
  const avg = items.reduce((a, n) => a + n.score, 0) / Math.max(items.length, 1);

  return (
    <div className="space-y-4">
      <Card className="glass flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Aggregate Sentiment
          </div>
          <div
            className={`mt-1 font-mono text-3xl font-semibold tabular-nums ${
              avg > 0 ? "text-bull" : avg < 0 ? "text-bear" : ""
            }`}
          >
            {avg >= 0 ? "+" : ""}
            {avg.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground">{items.length} stories</div>
        </div>
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((c) => (
            <Button
              key={c}
              size="sm"
              variant={c === cat ? "default" : "ghost"}
              className="h-7 font-mono text-[10px] uppercase tracking-wider"
              onClick={() => setCat(c)}
            >
              {c}
            </Button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {items.map((n) => {
          const tone =
            n.sentiment === "positive"
              ? "border-l-bull"
              : n.sentiment === "negative"
                ? "border-l-bear"
                : "border-l-border";
          return (
            <Card
              key={n.id}
              className={`glass border-l-2 p-4 transition-colors hover:bg-accent/5 ${tone}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {n.source} · {n.category}
                  {n.symbol && ` · ${n.symbol}`}
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
              <h3 className="mt-2 text-base font-semibold leading-snug">
                {n.headline}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{n.summary}</p>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {timeAgo(n.publishedAt)}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
