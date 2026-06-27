// THE SYNDICATE — PRODUCT OS STUDIO · PROTOCOL SNAPSHOT HOOK
//
// React hook over the READ-ONLY protocol snapshot adapter. It owns loading/refresh state and
// runs the read on mount (client only). buildProtocolSnapshot never throws and never writes —
// this hook simply projects its result for the UI. Reads are SCOPED by `groups` so a chain-only
// or single-group panel never triggers unrelated token reads.

import { useCallback, useEffect, useRef, useState } from "react";
import { buildProtocolSnapshot } from "./protocol-snapshot-adapter";
import type { ProtocolSnapshot, SnapshotGroup } from "./protocol-snapshot-types";

export interface UseProtocolSnapshotOptions {
  /** Restrict the live reads to these balance groups. `undefined` = full; `[]` = chain only. */
  groups?: SnapshotGroup[];
  /** Auto-read on mount (default true). */
  auto?: boolean;
}

export interface UseProtocolSnapshotResult {
  snapshot: ProtocolSnapshot | null;
  loading: boolean;
  refresh: () => void;
}

export function useProtocolSnapshot(options: UseProtocolSnapshotOptions = {}): UseProtocolSnapshotResult {
  const { groups, auto = true } = options;
  // Stable dependency key so a fresh array literal from the parent (e.g. groups={["burn"]}) does
  // not re-create `refresh` / re-trigger the effect on every render.
  const groupsKey = groups === undefined ? "*" : [...groups].sort().join("|");

  const [snapshot, setSnapshot] = useState<ProtocolSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);
  const inFlight = useRef(false);

  const refresh = useCallback(() => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    const opts =
      groupsKey === "*"
        ? {}
        : { groups: (groupsKey === "" ? [] : groupsKey.split("|")) as SnapshotGroup[] };
    buildProtocolSnapshot(opts)
      .then((snap) => {
        if (mounted.current) setSnapshot(snap);
      })
      .catch(() => {
        // buildProtocolSnapshot is designed never to throw; guard anyway.
      })
      .finally(() => {
        inFlight.current = false;
        if (mounted.current) setLoading(false);
      });
  }, [groupsKey]);

  useEffect(() => {
    mounted.current = true;
    if (auto) refresh();
    return () => {
      mounted.current = false;
    };
  }, [auto, refresh]);

  return { snapshot, loading, refresh };
}
