import { ok } from "node:assert/strict";
import { buildSystemReadyEventSubject, VDLEvents } from "./gen/events.ts";

ok(buildSystemReadyEventSubject() === "system.ready", "static subject");
ok(
  VDLEvents.SystemReadyEvent.buildSubject() === "system.ready",
  "catalog static subject",
);
ok(
  VDLEvents.SystemReadyEvent.subjectTemplate === "system.ready",
  "catalog template",
);
