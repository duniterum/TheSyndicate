// cockpit-shell — shared layout context for the /my-syndicate cockpit.
//
// When the cockpit composes its sub-surfaces into the flight-deck grid it wraps
// them in <CockpitEmbedProvider/>. Each surface that normally renders its own
// full-width <Section> band (SeatsAroundYou, CockpitProgression, CockpitMemory,
// ProtocolHeartbeat, LivePulseStrip) reads useCockpitEmbed() and, when embedded,
// renders BARE — no max-width band, no 64–96px vertical padding — so it can live
// inside a grid cell instead of stacking as another full-width report row.
//
// This is a CONTEXT (not a prop) on purpose: the doctrine test pins several of
// these surfaces as prop-less self-closing tags in MemberCockpit, so the
// embedded switch must never change their call sites.

import { createContext, useContext, type ReactNode } from "react";
import { Section } from "@/components/syndicate/Primitives";

const CockpitEmbedContext = createContext(false);

export function CockpitEmbedProvider({ children }: { children: ReactNode }) {
  return (
    <CockpitEmbedContext.Provider value={true}>
      {children}
    </CockpitEmbedContext.Provider>
  );
}

export function useCockpitEmbed(): boolean {
  return useContext(CockpitEmbedContext);
}

/**
 * Section that collapses to a bare <div> when rendered inside the cockpit
 * flight-deck grid. Used standalone (e.g. LivePulseStrip on the homepage) it
 * keeps the canonical <Section> band so nothing else on the site changes.
 */
export function CockpitSection({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const embedded = useCockpitEmbed();
  if (embedded) {
    return (
      <div id={id} className={className}>
        {children}
      </div>
    );
  }
  return (
    <Section id={id} className={className}>
      {children}
    </Section>
  );
}
