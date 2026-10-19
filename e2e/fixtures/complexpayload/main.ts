import { ok } from "node:assert/strict";
import { buildComplexPayloadEventSubject, VDLEvents } from "./gen/events.ts";

ok(
  buildComplexPayloadEventSubject("t-9") === "audit.t-9.payload.created",
  "complex payload builder",
);
ok(
  VDLEvents.ComplexPayloadEvent.subjectTemplate ===
    "audit.{tenantId}.payload.created",
  "catalog template",
);
