import { CONTRACTS, TOKEN_SPEC, SYN_EXPLORERS } from "./syndicate-config";

const SYN_ADDRESS = CONTRACTS.SYN_CONTRACT_ADDRESS;

/** EIP-747 watchAsset. Falls back to opening the explorer when no wallet is injected. */
export async function importSynToWallet() {
  const eth: any = (globalThis as any).ethereum;
  if (!eth?.request) {
    window.open(SYN_EXPLORERS.avascan, "_blank", "noopener,noreferrer");
    return;
  }
  try {
    await eth.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: SYN_ADDRESS,
          symbol: TOKEN_SPEC.symbol,
          decimals: TOKEN_SPEC.decimals,
        },
      },
    });
  } catch {
    /* user dismissed */
  }
}

/** Inline MetaMask fox logomark. Small, accessible, no external asset. */
export function MetaMaskIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" role="img">
      <title>MetaMask</title>
      <path fill="#E17726" d="M29.5 3 17.7 11.8l2.2-5.2L29.5 3Z" />
      <path fill="#E27625" d="m2.5 3 11.7 8.9-2.1-5.3L2.5 3Zm22.7 18.4-3.1 4.8 6.7 1.9 1.9-6.6-5.5-.1ZM1.3 23.5l1.9 6.6 6.7-1.9-3.1-4.8-5.5.1Z" />
      <path fill="#E27625" d="m9.5 14.2-1.9 2.9 6.6.3-.2-7.2-4.5 4Zm13 0-4.6-4.1-.1 7.3 6.6-.3-1.9-2.9ZM9.9 26.2l4-2-3.5-2.7-.5 4.7Zm8.1-2 4 2-.5-4.7-3.5 2.7Z" />
      <path fill="#D5BFB2" d="m22 26.2-4-2 .3 2.6v1.1l3.7-1.7Zm-12.1 0 3.7 1.7v-1.1l.3-2.6-4 2Z" />
      <path fill="#233447" d="m13.7 20.5-3.4-1 2.4-1.1 1 2.1Zm4.6 0 1-2.1 2.4 1.1-3.4 1Z" />
      <path fill="#CC6228" d="m9.9 26.2.6-4.8-3.7.1 3.1 4.7Zm11.6-4.8.6 4.8 3.1-4.7-3.7-.1Zm2.8-4.3-6.6.3.6 3.4 1-2.1 2.4 1.1 2.6-2.7Zm-13.6 2.7 2.4-1.1 1 2.1.6-3.4-6.6-.3 2.6 2.7Z" />
      <path fill="#E27525" d="m7.6 17.1 2.8 5.4-.1-2.7-2.7-2.7Zm14.1 2.7-.1 2.7 2.8-5.4-2.7 2.7Zm-7.5-2.4-.6 3.4.8 4 .2-5.3-.4-2.1Zm3.6 0-.4 2.1.1 5.3.8-4-.5-3.4Z" />
      <path fill="#F5841F" d="m18.3 20.5-.8 4 .6.4 3.5-2.7.1-2.7-3.4 1Zm-8 0 .1 2.7 3.5 2.7.6-.4-.8-4-3.4-1Z" />
      <path fill="#C0AC9D" d="m18.4 27.9.1-1.1-.3-.3h-4.4l-.3.3.1 1.1-3.7-1.7 1.3 1.1 2.6 1.8h4.5l2.6-1.8 1.3-1.1-3.8 1.7Z" />
      <path fill="#161616" d="m17.9 24.9-.6-.4h-2.6l-.6.4-.3 2.6.3-.3h4.4l.3.3-.3-2.6Z" />
      <path fill="#763E1A" d="m30 12.4 1-4.8L29.5 3 18.4 11.2l4.3 3.6 6 1.7 1.3-1.5-.6-.4 1-.9-.7-.5 1-.7-.7-.1Zm-29 0 .7-.1-.7.7 1 .5-.7.9 1 .4-.6.4 1.3 1.5 6.1-1.7 4.3-3.6L2.5 3 1 7.6l1 4.8Z" />
      <path fill="#F5841F" d="m28.7 16.5-6-1.7 1.9 2.9-2.8 5.4 3.7-.1h5.5l-2.3-6.5ZM9.5 14.8l-6 1.7-2.2 6.5h5.5l3.7.1-2.8-5.4 1.9-2.9Zm8.2 3.1.4-6.7 1.8-4.8h-7.7L14 11.2l.4 6.7.1 2.1v5.3h2.6v-5.3l.1-2.1Z" />
    </svg>
  );
}
