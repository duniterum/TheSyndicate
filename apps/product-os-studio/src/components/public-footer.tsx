import { Link } from "wouter";
import { PROOF_SURFACES } from "@/lib/surfaces";

export function PublicFooter() {
  return (
    <footer className="border-t border-white/5 py-12 mt-24 bg-card/30">
      <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 text-sm">
        <div className="space-y-4">
          <h3 className="font-bold tracking-tight">THE SYNDICATE</h3>
          <p className="text-muted-foreground leading-relaxed">
            A premium, transparent protocol. A living institution people follow over time. A member app with a public proof dashboard.
          </p>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-xs">Public proof</h4>
          <div className="flex flex-col gap-3">
            {PROOF_SURFACES.map((s) => (
              <Link
                key={s.id}
                href={s.publicPath}
                className="hover:text-primary transition-colors text-muted-foreground"
                data-testid={`footer-proof-${s.id}`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-xs">Resources</h4>
          <div className="flex flex-col gap-3">
            <Link href="/learn" className="hover:text-primary transition-colors text-muted-foreground" data-testid="footer-docs">Docs</Link>
            <a href="/learn#faq" className="hover:text-primary transition-colors text-muted-foreground" data-testid="footer-faq">FAQ</a>
            <a href="/learn#paper" className="hover:text-primary transition-colors text-muted-foreground" data-testid="footer-paper">Protocol Paper</a>
            <Link href="/press" className="hover:text-primary transition-colors text-muted-foreground" data-testid="footer-press">Press Kit</Link>
            <Link href="/share" className="hover:text-primary transition-colors text-muted-foreground" data-testid="footer-share">Proof &amp; Share</Link>
            <a href="/learn#risks" className="hover:text-primary transition-colors text-muted-foreground" data-testid="footer-risks">Risks & Disclaimers</a>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-xs">Official Channels</h4>
          <div className="flex flex-col gap-3">
            <a href="https://x.com/TheSyndicateOne" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors text-muted-foreground" data-testid="footer-x">X (Twitter)</a>
            <a href="https://t.me/TheSyndicateMoney" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors text-muted-foreground" data-testid="footer-telegram">Telegram</a>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-xs">Doctrine</h4>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground border-l-2 border-white/10 pl-3">
              No yield, no governance promise, no treasury claim.
            </p>
            <p className="text-xs text-muted-foreground border-l-2 border-white/10 pl-3">
              Public referral is not active.
            </p>
            <p className="text-xs text-muted-foreground border-l-2 border-white/10 pl-3">
              The Syndicate recognizes capital without reducing identity to capital.
            </p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} The Syndicate. A living protocol forming in public.</span>
        <span className="text-muted-foreground/70">
          Prototype interface. Live modules and future modules are labeled throughout. Not financial advice.
        </span>
      </div>
    </footer>
  );
}
