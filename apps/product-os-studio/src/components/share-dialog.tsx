import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProofCard, type ProofCardData } from "@/components/proof-card";
import { BRAND } from "@/lib/brand";
import { toast } from "sonner";
import { Copy, Check, Download, Share2, ExternalLink } from "lucide-react";

export type SharePayload = {
  title: string;
  summary: string;
  /** Lines rendered on the proof preview card. */
  lines: { label: string; value: string }[];
  /** Text used for X / Telegram intents and copy. */
  shareText: string;
  /** Optional proof-card styling. */
  eyebrow?: string;
  accent?: ProofCardData["accent"];
  badge?: ProofCardData["badge"];
  routing?: boolean;
  footnote?: string;
};

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M21.94 4.64a1.5 1.5 0 0 0-1.58-.21L3.3 11.2c-1.18.47-1.16 2.15.03 2.6l4.18 1.56 1.6 5.1a1 1 0 0 0 1.62.42l2.32-2.1 4.3 3.17a1.5 1.5 0 0 0 2.36-.94l3.2-15.06a1.5 1.5 0 0 0-.97-1.31ZM9.7 14.1l8.1-5.02-6.66 6.06a1 1 0 0 0-.3.58l-.27 2-0.87-3.62Z" />
    </svg>
  );
}

/**
 * Shareable proof preview. All sharing is PROTOTYPE ONLY — X/Telegram open public
 * intent URLs with prototype text; copy uses the clipboard; image export is a
 * labeled concept and does not produce a real OG image.
 */
export function ShareDialog({
  payload,
  trigger,
}: {
  payload: SharePayload;
  trigger: ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(payload.shareText);
      setCopied(true);
      toast.success("Proof text copied", {
        description: "Prototype text copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy", { description: "Clipboard is unavailable here." });
    }
  };

  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(payload.shareText)}`;
  const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(BRAND.channels.site.url)}&text=${encodeURIComponent(payload.shareText)}`;

  const cardData: ProofCardData = {
    eyebrow: payload.eyebrow ?? "Proof",
    title: payload.title,
    subtitle: payload.summary,
    lines: payload.lines,
    accent: payload.accent ?? "blue",
    routing: payload.routing,
    footnote: payload.footnote,
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-primary" /> Share proof
            </DialogTitle>
            <StatusBadge status="PROTOTYPE ONLY" />
          </div>
          <DialogDescription>
            How the story leaves the site. Sharing is simulated in this prototype — no real
            image is generated and no data is posted on your behalf.
          </DialogDescription>
        </DialogHeader>

        {/* Branded proof preview */}
        <ProofCard data={cardData} />

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" asChild>
            <a href={xUrl} target="_blank" rel="noreferrer" data-testid="share-x">
              <XIcon className="w-3.5 h-3.5" /> Share on X
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={tgUrl} target="_blank" rel="noreferrer" data-testid="share-telegram">
              <TelegramIcon className="w-4 h-4" /> Telegram
            </a>
          </Button>
          <Button variant="outline" onClick={handleCopy} data-testid="share-copy">
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy text"}
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.info("Image export is a concept", {
                description: "OG card generation is not built in this prototype yet.",
              })
            }
            data-testid="share-image"
          >
            <Download className="w-3.5 h-3.5" /> Image
          </Button>
        </div>

        {/* Official channels */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">
            Official channels
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={BRAND.channels.x.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              data-testid="follow-x"
            >
              <XIcon className="h-3 w-3" /> {BRAND.channels.x.label}
            </a>
            <a
              href={BRAND.channels.telegram.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              data-testid="follow-telegram"
            >
              <TelegramIcon className="h-3.5 w-3.5" /> Telegram
            </a>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/70 text-center">
          X and Telegram open public share intents with prototype text. Image export is a future
          concept that would require a backend.
        </p>
      </DialogContent>
    </Dialog>
  );
}
