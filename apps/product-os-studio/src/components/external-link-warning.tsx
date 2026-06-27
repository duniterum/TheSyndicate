import { type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { ExternalLink, TriangleAlert } from "lucide-react";

// Confirmation gate shown before the app hands off to any EXTERNAL tool (DEX,
// liquidity, charts). It states neutral market risk and reminds the visitor to
// verify the real contract from an official channel. Nothing is a promised
// return. In this prototype most external actions are not wired and stay
// disabled — this gate exists for any that are enabled.
export function ExternalLinkWarning({
  url,
  title,
  warning,
  trigger,
}: {
  url: string;
  title: string;
  warning: string;
  trigger: ReactNode;
}) {
  const open = () => window.open(url, "_blank", "noopener,noreferrer");
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent data-testid="external-warning">
        <AlertDialogHeader>
          <div className="flex items-center justify-between gap-3">
            <AlertDialogTitle className="flex items-center gap-2">
              <TriangleAlert className="h-4 w-4 text-amber-400" /> Leaving The Syndicate
            </AlertDialogTitle>
            <StatusBadge status="BACKEND REQUIRED" showTooltip={false} />
          </div>
          <AlertDialogDescription className="leading-relaxed">
            You are about to open an external tool ({title}). {warning}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="external-warning-cancel">Stay here</AlertDialogCancel>
          <AlertDialogAction onClick={open} data-testid="external-warning-continue">
            <ExternalLink className="h-4 w-4" /> Continue to external tool
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
