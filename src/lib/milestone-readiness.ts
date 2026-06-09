// Milestone readiness — converts protocol health findings into actionable
// "fix before next milestone" tickets, per module.
//
// Pure derivation from PROTOCOL_HEALTH_REGISTRY. No side effects.
// Consumed by the /protocol-health page and the /api/protocol-health endpoint.

import {
  PROTOCOL_HEALTH_REGISTRY,
  type HealthLevel,
  type ProtocolModule,
} from "./protocol-health-registry";

export type TicketPriority = "P0" | "P1" | "P2";

export interface MilestoneTicket {
  moduleId: string;
  moduleName: string;
  priority: TicketPriority;
  level: HealthLevel;
  title: string;
  action: string;
  source: string;
}

const LEVEL_TO_PRIORITY: Record<HealthLevel, TicketPriority> = {
  BLOCKER: "P0",
  WARN: "P1",
  PASS: "P2",
};

export function ticketsForModule(m: ProtocolModule): MilestoneTicket[] {
  const tickets: MilestoneTicket[] = [];

  for (const f of m.findings) {
    if (f.level === "PASS") continue;
    tickets.push({
      moduleId: m.moduleId,
      moduleName: m.moduleName,
      priority: LEVEL_TO_PRIORITY[f.level],
      level: f.level,
      title: `[${m.moduleId}] ${f.category}: ${truncate(f.message, 80)}`,
      action: f.message,
      source: m.lastVerified,
    });
  }

  if (m.nextMilestoneBlocker && m.nextMilestoneBlocker.trim().length > 0) {
    tickets.push({
      moduleId: m.moduleId,
      moduleName: m.moduleName,
      priority: m.status === "ROADMAP" ? "P2" : "P1",
      level: m.health,
      title: `[${m.moduleId}] Next milestone: ${truncate(m.nextMilestoneBlocker, 70)}`,
      action: m.nextMilestoneBlocker,
      source: m.lastVerified,
    });
  }

  return tickets;
}

export function buildMilestoneReadiness(modules: ProtocolModule[] = PROTOCOL_HEALTH_REGISTRY) {
  const tickets = modules.flatMap(ticketsForModule);
  const byPriority: Record<TicketPriority, MilestoneTicket[]> = { P0: [], P1: [], P2: [] };
  for (const t of tickets) byPriority[t.priority].push(t);
  return {
    generatedAt: new Date().toISOString(),
    totals: { P0: byPriority.P0.length, P1: byPriority.P1.length, P2: byPriority.P2.length },
    tickets,
    byPriority,
  };
}

function truncate(s: string, n: number) {
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}
