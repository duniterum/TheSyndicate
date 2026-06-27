import { ShieldCheck, KeyRound, Server, ListChecks, ScrollText, Lock } from "lucide-react";

const REQUIREMENTS = [
  {
    icon: KeyRound,
    title: "Wallet signature (proof of ownership)",
    body: "The wallet signs a server-issued, single-use nonce (SIWE-style). Connecting alone proves nothing — a signature proves the user controls the address.",
  },
  {
    icon: Server,
    title: "Server-side session",
    body: "After verifying the signature, the backend issues a short-lived, httpOnly session. The browser never holds the authority decision.",
  },
  {
    icon: ListChecks,
    title: "Operator allowlist + backend role check",
    body: "Founder / operator addresses live server-side (and/or an on-chain multisig). Every privileged request re-verifies the role on the server — the client never decides who is an operator.",
  },
  {
    icon: Lock,
    title: "Protected routes (API + UI)",
    body: "Privileged endpoints reject unauthorized callers with 403. Hiding a link in the frontend is a convenience, not the enforcement boundary.",
  },
  {
    icon: ScrollText,
    title: "Audit logging",
    body: "Every operator action is recorded server-side with actor, action, and timestamp, independent of any client state.",
  },
];

const PRINCIPLES = [
  "A connected wallet is NOT founder authority.",
  "Holding a seat is NOT operator authority.",
  "Hiding UI in the frontend is NOT security.",
  "Production requires a wallet signature plus server-side verification.",
];

export function ProductionAuthNote({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-primary/20 bg-primary/5 p-5 ${className}`}
      data-testid="production-auth-note"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <div className="font-semibold text-foreground">Production Authorization (Future)</div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            This prototype simulates roles in your browser (localStorage). That is a demonstration aid,
            not access control. In production, authority is enforced like this:
          </p>
        </div>
      </div>

      {!compact && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {REQUIREMENTS.map((req) => (
            <div
              key={req.title}
              className="rounded-lg border border-white/5 bg-background/50 p-3 flex gap-3"
            >
              <req.icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-foreground">{req.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{req.body}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 rounded-lg border border-white/5 bg-background/50 p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Principles that always hold
        </div>
        <ul className="space-y-1.5">
          {PRINCIPLES.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm text-foreground/90">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
