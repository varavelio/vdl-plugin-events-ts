import { ok } from "node:assert/strict";
import { VDLEvents } from "./gen/events.ts";

ok(
  VDLEvents.SystemReadyEvent.buildSubject() === "system.ready",
  "catalog static subject",
);
ok(
  VDLEvents.SystemReadyEvent.subjectTemplate === "system.ready",
  "catalog template",
);
