import { useEffect, useState } from "react";

/** Returns now() that updates every `intervalMs` ms — used to drive live mock prices. */
export function useLiveTick(intervalMs = 2000) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return tick;
}
