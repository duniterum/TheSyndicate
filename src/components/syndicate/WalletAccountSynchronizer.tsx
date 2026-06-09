import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount, useReconnect } from "wagmi";
import { readInjectedAccounts, sameAddress, subscribeInjectedAccountsChanged } from "@/lib/wallet-freshness";
import { track } from "@/lib/analytics";

/**
 * Keeps Wagmi's connected account aligned with the wallet extension.
 *
 * MetaMask can switch accounts without a full page reload. If Wagmi still has
 * the old address, the header and mint widgets can show wallet A while the
 * extension signs with wallet B. This listener forces a reconnect + cache
 * invalidation whenever the injected account differs from Wagmi's account.
 */
export function WalletAccountSynchronizer() {
  const { address } = useAccount();
  const { reconnect, connectors } = useReconnect();
  const queryClient = useQueryClient();

  useEffect(() => {
    const sync = (accounts: string[]) => {
      const next = accounts[0];
      if (!next || sameAddress(address, next)) return;
      reconnect({ connectors });
      void queryClient.invalidateQueries();
      track("wallet_account_resync", { surface: "accounts_changed" });
    };

    void readInjectedAccounts().then(sync);
    return subscribeInjectedAccountsChanged(sync);
  }, [address, connectors, queryClient, reconnect]);

  return null;
}