import { useEffect } from "react";
import { captureReferralFromLocation } from "@/lib/referral-attribution";

/**
 * ReferralCapture — mounts once at the root and records a first-touch
 * `?ref=<memberNumber>` attribution into localStorage. Renders nothing.
 *
 * Attribution-only: no reward, no contract, no on-chain write. The captured
 * value is only ever *displayed* once it resolves to a real member (see
 * ReferralAttributionNote).
 */
export function ReferralCapture() {
  useEffect(() => {
    captureReferralFromLocation();
  }, []);
  return null;
}
