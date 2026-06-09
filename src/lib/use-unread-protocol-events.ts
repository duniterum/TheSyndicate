// Unread-protocol-event tracker for the header notification bell.
//
// Truth model:
//   • The set of events comes from useProtocolEvents — same source the
//     /activity feed binds to. No fabrication, no parallel stream.
//   • "Unread" is purely a CLIENT-SIDE marker. We persist a single
//     `lastSeenBlock` (bigint as string) in localStorage. An event is
//     unread if its blockNumber > lastSeenBlock. This is a read/unread
//     UI hint ONLY — never used as ownership or eligibility proof.
//   • markAllRead() bumps lastSeenBlock to the newest event's block.
//
// Cohabits safely with SSR: all storage reads are guarded by typeof window.

import { useCallback, useEffect, useState } from "react";
import { useProtocolEvents, type ProtocolEvent } from "./protocol-events";

const KEY = "syndicate.activity.lastSeenBlock.v1";

function readLastSeen(): bigint {
  if (typeof window === "undefined") return 0n;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return 0n;
    return BigInt(raw);
  } catch {
    return 0n;
  }
}

function writeLastSeen(block: bigint) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, block.toString());
  } catch {
    /* storage disabled — degrade silently */
  }
}

export type UnreadEventsResult = {
  events: ProtocolEvent[];
  unread: ProtocolEvent[];
  unreadCount: number;
  isLoading: boolean;
  isError: boolean;
  lastSeenBlock: bigint;
  markAllRead: () => void;
  refetch: () => void;
};

export function useUnreadProtocolEvents(limit = 25): UnreadEventsResult {
  const { events, isLoading, isError, refetch } = useProtocolEvents({ limit });
  const [lastSeenBlock, setLastSeenBlock] = useState<bigint>(0n);

  // Hydrate from localStorage on mount only.
  useEffect(() => {
    setLastSeenBlock(readLastSeen());
  }, []);

  const unread = events.filter((e) => e.blockNumber > lastSeenBlock);

  const markAllRead = useCallback(() => {
    const newest = events[0]?.blockNumber ?? lastSeenBlock;
    writeLastSeen(newest);
    setLastSeenBlock(newest);
  }, [events, lastSeenBlock]);

  return {
    events,
    unread,
    unreadCount: unread.length,
    isLoading,
    isError,
    lastSeenBlock,
    markAllRead,
    refetch,
  };
}
