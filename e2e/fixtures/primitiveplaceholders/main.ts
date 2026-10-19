import { ok } from "node:assert/strict";
import { VDLEvents } from "./gen/events.ts";

const at = new Date("2026-01-02T03:04:05.006Z");

ok(
  VDLEvents.PrimitiveSubjectEvent.buildSubject("api", 7, 1.5, true, at) ===
    `metrics.api.7.1.5.true.${at.toISOString()}`,
  "catalog builder must format primitives",
);
