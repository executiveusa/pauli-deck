/**
 * Server-side client for the Pauli Effect observation API.
 * The secret never reaches the browser — all calls are from Next.js server components / route handlers.
 */

const OBSERVE_URL = process.env.PAULI_OBSERVE_URL || "https://api.thepaulieffect.com/observe";
const OBSERVE_SECRET = process.env.PAULI_OBSERVE_SECRET || "pauli-observe-tailnet-2026";

export const LIBRECHAT_URL = process.env.NEXT_PUBLIC_LIBRECHAT_URL || "https://api.thepaulieffect.com";

export interface AgentStatus {
  slug: string;
  name: string;
  role: string;
  publicPath: string;
  status: string;
  model: string | null;
  apiBase: string | null;
  uptime: number;
  currentMission: string | null;
  missionsCompleted: number | null;
  polledAt: number;
}

export interface ObserveSnapshot {
  agents: Record<string, AgentStatus>;
  tokens: any;
  fleet: any;
  models: any[];
  updatedAt: number;
  serverTime: string;
}

async function fetchObserve(path: string): Promise<any> {
  const res = await fetch(`${OBSERVE_URL}${path}`, {
    headers: { "X-Observe-Secret": OBSERVE_SECRET },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`observe ${path} -> ${res.status}`);
  return res.json();
}

export async function getStatus(): Promise<ObserveSnapshot> {
  return fetchObserve("/status");
}

export async function getMissions(): Promise<any> {
  return fetchObserve("/missions");
}

export async function getTokens(): Promise<any> {
  return fetchObserve("/tokens");
}

export function formatUptime(seconds: number): string {
  if (!seconds || seconds === 0) return "—";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
