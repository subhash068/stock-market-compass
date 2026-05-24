import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { TerminalSquare } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — TICKR Terminal" }] }),
  component: SignupPage,
});

function SignupPage() {
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
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Create account</h1>
        <p className="text-sm text-muted-foreground">
          Start tracking markets in seconds.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-wider" htmlFor="name">
              Full name
            </Label>
            <Input id="name" required />
          </div>
          <div className="space-y-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-wider" htmlFor="email">
              Email
            </Label>
            <Input id="email" type="email" required />
          </div>
          <div className="space-y-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-wider" htmlFor="pw">
              Password
            </Label>
            <Input id="pw" type="password" required />
          </div>
          <Button type="submit" className="w-full glow-amber" disabled={loading}>
            {loading ? "Creating…" : "Create Account"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
