import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — TICKR Terminal" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="glass p-5">
        <h2 className="font-mono text-sm font-semibold tracking-tight">Preferences</h2>
        <div className="mt-4 space-y-4 text-sm">
          {[
            { label: "Email alerts", desc: "Get notified on portfolio movers", on: true },
            { label: "Push notifications", desc: "Browser pushes for AI signals", on: false },
            { label: "After-hours data", desc: "Show extended trading prices", on: true },
            { label: "Compact ticker tape", desc: "Reduce ticker bar height", on: false },
          ].map((p) => (
            <div key={p.label} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
              <div>
                <div className="font-medium">{p.label}</div>
                <div className="text-xs text-muted-foreground">{p.desc}</div>
              </div>
              <Switch defaultChecked={p.on} />
            </div>
          ))}
        </div>
      </Card>
      <Card className="glass p-5">
        <h2 className="font-mono text-sm font-semibold tracking-tight">Account</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Demo account · trader@tickr.dev · Free tier
        </p>
      </Card>
    </div>
  );
}
