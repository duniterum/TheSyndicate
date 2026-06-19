#!/usr/bin/env node
// Validate that the explorer URL formats we emit for the Archive contract
// and sample transaction hashes have the right shape and do not return 404/5xx
// from Routescan, SnowTrace, or Avascan.
//
// 403/429 responses are accepted because explorer CDNs often block automated
// probes while still serving the same URL to a browser.
//
// Usage: node scripts/check-explorer-urls.mjs
// Optional positional args: extra tx hashes to probe.

const ADDRESS = "0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d";
const DEFAULT_TX_HASHES = [
  // SyndicateMembershipSale deployment tx, known-good Avalanche C-Chain tx.
  "0x30e1378a66dc1037d49cb7557a162635f37a90ffde80e973bd9750d39927bdb6",
];

const extraTx = process.argv.slice(2).filter((s) => /^0x[a-fA-F0-9]{64}$/.test(s));
const TX_HASHES = [...DEFAULT_TX_HASHES, ...extraTx];

const addrUrls = {
  avascan: `https://avascan.info/blockchain/c/address/${ADDRESS}`,
  snowtrace: `https://snowtrace.io/address/${ADDRESS}`,
  routescan: `https://routescan.io/address/${ADDRESS}/contract/43114/code`,
};

const txUrlBuilders = {
  routescan: (h) => `https://routescan.io/tx/${h}`,
  snowtrace: (h) => `https://snowtrace.io/tx/${h}`,
  avascan: (h) => `https://avascan.info/blockchain/c/tx/${h}`,
};

const ADDR_RE = /^0x[a-fA-F0-9]{40}$/;
const TXH_RE = /^0x[a-fA-F0-9]{64}$/;
const HTTPS_RE = /^https:\/\//;

async function probe(url) {
  try {
    let response = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (response.status === 405 || response.status === 403) {
      response = await fetch(url, { method: "GET", redirect: "follow" });
    }
    return {
      status: response.status,
      ok: response.status > 0 && response.status < 500 && response.status !== 404,
    };
  } catch (err) {
    return { status: 0, ok: false, error: String(err?.message ?? err) };
  }
}

function assertShape(name, url, kind, value) {
  if (!HTTPS_RE.test(url)) throw new Error(`${name}: not an https URL -> ${url}`);
  if (kind === "address" && !ADDR_RE.test(value)) {
    throw new Error(`${name}: address shape invalid -> ${value}`);
  }
  if (kind === "tx" && !TXH_RE.test(value)) {
    throw new Error(`${name}: tx hash shape invalid -> ${value}`);
  }
}

let failures = 0;
function record(label, url, result) {
  const ok = result.ok;
  if (!ok) failures += 1;
  const tag = ok ? "OK " : "FAIL";
  const detail = result.error ? ` (${result.error})` : "";
  console.log(`[${tag}] ${label.padEnd(28)} ${result.status}  ${url}${detail}`);
}

(async () => {
  console.log(`Archive contract address: ${ADDRESS}\n`);

  console.log("Address pages:");
  for (const [name, url] of Object.entries(addrUrls)) {
    assertShape(`addr.${name}`, url, "address", ADDRESS);
    record(`addr.${name}`, url, await probe(url));
  }

  for (const hash of TX_HASHES) {
    console.log(`\nTx pages for ${hash.slice(0, 10)}...:`);
    for (const [name, build] of Object.entries(txUrlBuilders)) {
      const url = build(hash);
      assertShape(`tx.${name}`, url, "tx", hash);
      record(`tx.${name}`, url, await probe(url));
    }
  }

  console.log(`\n${failures === 0 ? "All explorer URLs passed." : `${failures} URL(s) failed.`}`);
  process.exit(failures === 0 ? 0 : 1);
})();
