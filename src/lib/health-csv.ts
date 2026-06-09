// CSV export — serialize the current protocol health registry plus
// derived milestone tickets into a single CSV the operator can hand to
// auditors or paste into a spreadsheet. No PII.

import { PROTOCOL_HEALTH_REGISTRY } from "./protocol-health-registry";
import { buildMilestoneReadiness } from "./milestone-readiness";
import { classifyStaleness } from "./health-staleness";

function csvEscape(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function row(cells: unknown[]): string {
  return cells.map(csvEscape).join(",");
}

export function buildHealthCsv(): string {
  const stale = new Map(classifyStaleness().map((s) => [s.moduleId, s]));
  const milestone = buildMilestoneReadiness();
  const ticketsByModule = new Map<string, number>();
  for (const t of milestone.tickets) {
    ticketsByModule.set(t.moduleId, (ticketsByModule.get(t.moduleId) ?? 0) + 1);
  }

  const lines: string[] = [];
  lines.push(`# Protocol Health Export`);
  lines.push(`# generated: ${new Date().toISOString()}`);
  lines.push(`# authority: docs/REALITY_REFLECTION_AUDIT.md`);
  lines.push("");
  lines.push("section,module_id,module_name,status,health,blockers,warns,verified_at,age_days,staleness,next_milestone_blocker,tickets,last_verified_source");
  for (const m of PROTOCOL_HEALTH_REGISTRY) {
    const b = m.findings.filter((f) => f.level === "BLOCKER").length;
    const w = m.findings.filter((f) => f.level === "WARN").length;
    const s = stale.get(m.moduleId);
    lines.push(row([
      "module", m.moduleId, m.moduleName, m.status, m.health, b, w,
      s?.verifiedAt ?? "", s?.ageDays ?? "", s?.status ?? "UNKNOWN",
      m.nextMilestoneBlocker, ticketsByModule.get(m.moduleId) ?? 0,
      m.lastVerified,
    ]));
  }

  lines.push("");
  lines.push("section,module_id,category,level,message");
  for (const m of PROTOCOL_HEALTH_REGISTRY) {
    for (const f of m.findings) {
      lines.push(row(["finding", m.moduleId, f.category, f.level, f.message]));
    }
  }

  lines.push("");
  lines.push("section,priority,level,module_id,title,action,source");
  for (const t of milestone.tickets) {
    lines.push(row(["ticket", t.priority, t.level, t.moduleId, t.title, t.action, t.source]));
  }

  return lines.join("\n") + "\n";
}

export function triggerCsvDownload(filename = `protocol-health-${new Date().toISOString().slice(0, 10)}.csv`) {
  if (typeof window === "undefined") return;
  const csv = buildHealthCsv();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
