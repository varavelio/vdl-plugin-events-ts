import { ok } from "node:assert/strict";
import { buildPrimitiveSubjectEventSubject, VDLEvents } from "./gen/events.ts";

const at = new Date("2026-01-02T03:04:05.006Z");
const subject = buildPrimitiveSubjectEventSubject("api", 7, 1.5, true, at);

ok(
  subject === `metrics.api.7.1.5.true.${at.toISOString()}`,
  `primitive builder mismatch: ${subject}`,
);
ok(
  VDLEvents.PrimitiveSubjectEvent.buildSubject("api", 7, 1.5, false, at) ===
    `metrics.api.7.1.5.false.${at.toISOString()}`,
  "catalog builder must match",
);
