import { getStatus, getMissions, getTokens, LIBRECHAT_URL, formatUptime, type AgentStatus } from "@/lib/observe";

export const revalidate = 3; // re-fetch every 3s (ISR)

const AGENT_EMOJI: Record<string, string> = {
  pi: "🧠",
  hermes: "⚡",
  tars: "🤖",
  jarvis: "🛡️",
};

export default async function Dashboard() {
  let snapshot: Awaited<ReturnType<typeof getStatus>> | null = null;
  let missions: any[] = [];
  let tokens: any = null;
  let error: string | null = null;

  try {
    [snapshot, missions, tokens] = await Promise.all([
      getStatus(),
      getMissions().then(m => m.missions || []).catch(() => []),
      getTokens().catch(() => null),
    ]);
  } catch (e: any) {
    error = e.message;
  }

  const agents = snapshot ? Object.values(snapshot.agents) : [];
  const onlineCount = agents.filter(a => a.status === "ok").length;

  return (
    <main className="min-h-screen max-w-md mx-auto px-4 py-6">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-pauli-accent">⚡</span> Pauli Effect
          </h1>
          <span className={`text-xs px-2 py-1 rounded-full border ${onlineCount >= 3 ? "border-pauli-green/30 bg-pauli-green/10 text-pauli-green" : "border-pauli-red/30 bg-pauli-red/10 text-pauli-red"}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${onlineCount >= 3 ? "bg-pauli-green pulse-green" : "bg-pauli-red"}`} />
            {onlineCount}/4 online
          </span>
        </div>
        <p className="text-xs text-pauli-dim">Agent fleet control · {snapshot?.serverTime?.slice(11, 19) || "—"} UTC</p>
      </header>

      {error && (
        <div className="mb-4 p-3 rounded-lg border border-pauli-red/30 bg-pauli-red/10 text-sm text-pauli-red">
          ⚠️ Cannot reach observation API: {error}
        </div>
      )}

      {/* Agent cards */}
      <section className="space-y-3 mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-pauli-dim">Agents</h2>
        {agents.map((a: AgentStatus) => {
          const online = a.status === "ok";
          return (
            <a
              key={a.slug}
              href={`${LIBRECHAT_URL}/c/new`}
              target="_blank"
              rel="noopener"
              className={`block p-4 rounded-xl border transition-colors ${online ? "border-pauli-border bg-pauli-panel hover:border-pauli-accent/50" : "border-pauli-border/50 bg-pauli-panel/50 opacity-60"}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{AGENT_EMOJI[a.slug] || "🔹"}</span>
                  <div>
                    <div className="font-semibold text-white text-sm">{a.name}</div>
                    <div className="text-xs text-pauli-dim">{a.role}</div>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${online ? "bg-pauli-green/15 text-pauli-green" : "bg-pauli-red/15 text-pauli-red"}`}>
                  {online ? "ONLINE" : "OFFLINE"}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-pauli-dim">Model</span>
                  <div className="text-white truncate">{a.model || "—"}</div>
                </div>
                <div>
                  <span className="text-pauli-dim">Uptime</span>
                  <div className="text-white">{formatUptime(a.uptime)}</div>
                </div>
              </div>
              {a.currentMission && (
                <div className="mt-2 p-2 rounded-md bg-pauli-accent/10 border border-pauli-accent/20 text-[11px] text-pauli-accent truncate">
                  🎯 {a.currentMission}
                </div>
              )}
              <div className="mt-2 text-[10px] text-pauli-dim opacity-60">tap to chat →</div>
            </a>
          );
        })}
      </section>

      {/* Token spend */}
      {tokens && tokens.calls > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-pauli-dim mb-3">Token Spend</h2>
          <div className="p-4 rounded-xl border border-pauli-border bg-pauli-panel">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-white">{tokens.calls || 0}</div>
                <div className="text-[10px] text-pauli-dim">CALLS</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{((tokens.tokens_in || 0) + (tokens.tokens_out || 0)).toLocaleString()}</div>
                <div className="text-[10px] text-pauli-dim">TOKENS</div>
              </div>
              <div>
                <div className="text-lg font-bold text-pauli-green">${(tokens.cost_usd || 0).toFixed(2)}</div>
                <div className="text-[10px] text-pauli-dim">COST</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recent missions */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-pauli-dim mb-3">Recent Missions</h2>
        {missions.length === 0 ? (
          <div className="p-4 rounded-xl border border-pauli-border bg-pauli-panel text-xs text-pauli-dim">No missions yet.</div>
        ) : (
          <div className="space-y-2">
            {missions.slice(0, 8).map((m: any, i: number) => (
              <div key={i} className="p-3 rounded-lg border border-pauli-border bg-pauli-panel">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-pauli-accent/15 text-pauli-accent uppercase">{m.kind || "task"}</span>
                  <span className="text-[10px] text-pauli-dim">{m.agent}</span>
                </div>
                <div className="text-xs text-white truncate">{m.mission}</div>
                <div className="text-[10px] text-pauli-dim mt-1">{m.createdAt?.slice(0, 19).replace("T", " ")}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer links */}
      <footer className="pt-4 border-t border-pauli-border space-y-2">
        <a href={LIBRECHAT_URL} target="_blank" rel="noopener" className="block text-center text-xs text-pauli-accent py-2">
          Open LibreChat →
        </a>
        <a href="https://github.com/executiveusa/open-molt-social-purpose" target="_blank" rel="noopener" className="block text-center text-[10px] text-pauli-dim">
          3D Theater (open-molt) →
        </a>
      </footer>
    </main>
  );
}
