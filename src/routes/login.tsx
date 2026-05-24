import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { TerminalSquare } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — TICKR Terminal" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate({ to: "/dashboard" }), 500);
  }
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <Card className="glass relative w-full max-w-md p-7">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary glow-amber">
            <TerminalSquare className="h-4 w-4" />
          </div>
          <span className="font-mono font-semibold tracking-tight">TICKR</span>
        </Link>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Access your trading terminal.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-wider" htmlFor="email">
              Email
            </Label>
            <Input id="email" type="email" defaultValue="trader@tickr.dev" required />
          </div>
          <div className="space-y-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-wider" htmlFor="pw">
              Password
            </Label>
            <Input id="pw" type="password" defaultValue="••••••••" required />
          </div>
          <Button type="submit" className="w-full glow-amber" disabled={loading}>
            {loading ? "Authenticating…" : "Enter Terminal"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
}
