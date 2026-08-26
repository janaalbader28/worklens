import type { Employee } from "@/data/types";
import type { Ticket } from "@/data/tickets";
import { availableCapacity } from "@/lib/capacity";
import { computeSkillMatch } from "@/lib/simulate";

export interface TicketCandidate {
  employee: Employee;
  skillMatch: number;
  matchedSkills: string[];
  availableCapacity: number;
  projectedCapacity: number;
  reasons: string[];
}

/** Skills mentioned by name in the ticket's title/description — a fallback for tickets
 * without an explicit `relatedSkills` tag (e.g. ones raised through the IT Ticket
 * System's own "New Ticket" form). */
function extractRequiredSkillsFromText(ticket: Pick<Ticket, "title" | "description">, employees: Employee[]): string[] {
  const text = `${ticket.title} ${ticket.description}`.toLowerCase();
  const allSkills = new Set<string>();
  employees.forEach((e) => e.skills.forEach((s) => allSkills.add(s.name)));
  return Array.from(allSkills).filter((skill) => text.includes(skill.toLowerCase()));
}

/** Ranks a unit's employees for a ticket by skill match, then by available capacity —
 * used for the Work queue's "Suggested" employee. */
export function rankCandidatesForTicket(employees: Employee[], ticket: Ticket, limit = 3): TicketCandidate[] {
  const requiredSkills =
    ticket.relatedSkills && ticket.relatedSkills.length > 0
      ? ticket.relatedSkills
      : extractRequiredSkillsFromText(ticket, employees);

  return employees
    .map((employee) => {
      const skillMatch = computeSkillMatch(employee, requiredSkills);
      const matchedSkills = employee.skills
        .map((s) => s.name)
        .filter((name) => requiredSkills.some((r) => r.toLowerCase() === name.toLowerCase()));
      const avail = availableCapacity(employee.currentUtilization);
      const projected = Math.round(employee.currentUtilization + (ticket.estimatedHours / employee.weeklyHours) * 100);

      const reasons: string[] = [];
      reasons.push(
        matchedSkills.length > 0
          ? `Skill match on ${matchedSkills.join(", ")}`
          : "No specific skill keywords matched — ranked by availability"
      );
      reasons.push(`${avail}% available capacity`);
      reasons.push(`Currently ${employee.currentUtilization}% utilized, ~${projected}% if assigned`);

      return { employee, skillMatch, matchedSkills, availableCapacity: avail, projectedCapacity: projected, reasons };
    })
    .sort((a, b) => b.skillMatch - a.skillMatch || b.availableCapacity - a.availableCapacity)
    .slice(0, limit);
}
