import { useApp } from "@/lib/store";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, Lock } from "lucide-react";
import { getSurface, getSurfaceByMemberPath } from "@/lib/surfaces";

// Bottom-of-page CTA shown on PUBLIC proof pages. It sends the visitor to the
// member-personal equivalent (simulated connect), making clear the public page
// is a read-only preview and the personal depth lives behind the wallet.
export function ConnectForPersonalCta({ surfaceId }: { surfaceId: string }) {
  const surface = getSurface(surfaceId);
  const { connect } = useApp();
  const [, setLocation] = useLocation();

  if (!surface?.memberPath) return null;
  const memberPath = surface.memberPath;

  const go = () => {
    connect();
    setLocation(memberPath);
  };

  return (
    <div
      className="rounded-2xl border border-primary/20 bg-primary/[0.06] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
      data-testid={`connect-cta-${surface.id}`}
    >
      <div className="flex items-start gap-3">
        <Lock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div>
          <h3 className="text-lg font-bold">Your personal view is member-only</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed">
            This page is public, read-only proof. Your own seat, receipts, and personal
            depth live in the member app. Connecting is simulated in this prototype.
          </p>
        </div>
      </div>
      <Button onClick={go} className="shrink-0" data-testid={`connect-cta-btn-${surface.id}`}>
        {surface.connectCtaLabel ?? "Connect for your personal view"}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

// Small banner reminding visitors that a public page is read-only and simulated.
export function PublicProofNote({ surfaceId }: { surfaceId?: string }) {
  const surface = surfaceId ? getSurface(surfaceId) : undefined;
  return (
    <div
      className="rounded-xl border border-blue-500/20 bg-blue-500/[0.06] px-4 py-3 flex items-start gap-3 text-sm"
      data-testid="public-proof-note"
    >
      <Eye className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
      <p className="text-muted-foreground leading-relaxed">
        Public read-only preview.{surface ? ` ${surface.publicSummary}` : ""} Displayed totals are
        prototype figures, not live values; read-only chain panels are clearly marked LIVE READ. No
        wallet connection is required to view this page.
      </p>
    </div>
  );
}

// Inline link to the public equivalent of a member surface (used on connect gate).
// Resolves the public path from the member path so it always points at the
// read-only public proof, never back at the gated member surface.
export function PublicEquivalentLink({ memberPath }: { memberPath: string }) {
  const surface = getSurfaceByMemberPath(memberPath);
  if (!surface) return null;
  return (
    <Link href={surface.publicPath}>
      <span className="underline underline-offset-4 hover:text-foreground transition-colors cursor-pointer">
        View public {surface.label} proof
      </span>
    </Link>
  );
}
