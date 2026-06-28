// THE SYNDICATE — PRODUCT OS STUDIO · BURN PROOF (PROOF OF FIRE) HOOK
//
// React hook over the READ-ONLY Proof of Fire adapter. On mount it performs only the LIGHT,
// fast context read (chainId · head · decimals · pinned balanceOf) so the authoritative cumulative
// burned total appears immediately. The HEAVY, bounded eth_getLogs enumeration runs only on an
// explicit user action (scan / refresh) and reports progress. buildBurnProof never throws and never
// writes — this hook simply projects its result for the UI. A small module-level cache lets the
// reconciled result persist across remounts within a session (manual refresh always re-scans).

import { useCallback, useEffect, useRef, useState } from "react";
import { buildBurnProof } from "./burn-proof-adapter";
import type { BurnProofReadModel } from "./burn-proof-types";

let cachedModel: BurnProofReadModel | null = null;

export interface ScanProgress {
  scanned: number;
  planned: number;
}

export interface UseBurnProofResult {
  model: BurnProofReadModel | null;
  /** Any read in flight (light context or heavy scan). */
  loading: boolean;
  /** A heavy event enumeration is in flight. */
  scanning: boolean;
  progress: ScanProgress | null;
  /** Run the heavy bounded event enumeration + reconciliation. */
  scan: () => void;
  /** Re-run the heavy enumeration (always bypasses the cache). */
  refresh: () => void;
}

export function useBurnProof(): UseBurnProofResult {
  const [model, setModel] = useState<BurnProofReadModel | null>(cachedModel);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState<ScanProgress | null>(null);
  const mounted = useRef(true);
  const inFlight = useRef(false);

  const run = useCallback((enumerate: boolean) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    if (enumerate) {
      setScanning(true);
      setProgress({ scanned: 0, planned: 0 });
    }
    buildBurnProof({
      enumerate,
      onProgress: enumerate
        ? (scanned, planned) => {
            if (mounted.current) setProgress({ scanned, planned });
          }
        : undefined,
    })
      .then((m) => {
        cachedModel = m;
        if (mounted.current) setModel(m);
      })
      .catch(() => {
        // buildBurnProof is designed never to throw; guard anyway.
      })
      .finally(() => {
        inFlight.current = false;
        if (mounted.current) {
          setLoading(false);
          setScanning(false);
          setProgress(null);
        }
      });
  }, []);

  const scan = useCallback(() => run(true), [run]);
  const refresh = useCallback(() => run(true), [run]);

  useEffect(() => {
    mounted.current = true;
    // Light context read on mount, unless a model is already cached from this session.
    if (!cachedModel) run(false);
    return () => {
      mounted.current = false;
    };
  }, [run]);

  return { model, loading, scanning, progress, scan, refresh };
}
