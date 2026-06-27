// Import SYN — a REAL wallet_watchAsset call (the SYN address is READ-ONLY PRODUCTION PROOF;
// decimals are read LIVE before the call). Self-contained: if the wallet isn't connected or is
// on the wrong network, the button first routes the user through connect / switch. It never
// fakes success — the toast reflects exactly what the wallet reported.

import { Download, Loader2, Wallet, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useStudioWallet } from "@/lib/wallet-context";
import { cn } from "@/lib/utils";

interface ImportSynButtonProps {
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function ImportSynButton({ variant = "default", size = "default", className }: ImportSynButtonProps) {
  const { snapshot, isDetected, connecting, switching, importing, connect, switchNetwork, importSyn } =
    useStudioWallet();
  const { toast } = useToast();

  if (!isDetected || snapshot.state === "unsupported") {
    return (
      <Button
        variant="outline"
        size={size}
        className={className}
        disabled
        title="No EIP-1193 wallet detected in this browser."
        data-testid="import-syn-no-wallet"
      >
        <Download className="h-4 w-4" /> Import SYN
      </Button>
    );
  }

  if (snapshot.state === "disconnected") {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => void connect()}
        disabled={connecting}
        data-testid="import-syn-connect"
      >
        {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
        Connect to import SYN
      </Button>
    );
  }

  if (snapshot.state === "wrongNetwork") {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => void switchNetwork()}
        disabled={switching}
        data-testid="import-syn-switch"
      >
        {switching ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeftRight className="h-4 w-4" />}
        Switch to Avalanche to import
      </Button>
    );
  }

  const onImport = async () => {
    try {
      const result = await importSyn();
      if (result === "added") {
        toast({
          title: "SYN added to your wallet",
          description: "Your wallet confirmed the token was added. SYN is the accounting unit — not a financial right.",
        });
      } else {
        toast({
          title: "Import dismissed",
          description: "Your wallet reported the token was not added. Nothing was changed.",
        });
      }
    } catch (err) {
      toast({
        title: "Could not import SYN",
        description: (err as Error)?.message ?? "The wallet request failed or was rejected.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={() => void onImport()}
      disabled={importing}
      data-testid="import-syn"
    >
      {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Import SYN
    </Button>
  );
}
