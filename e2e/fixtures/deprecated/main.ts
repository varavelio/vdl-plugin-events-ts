import { ok } from "node:assert/strict";
import { readFileSync } from "node:fs";
import { VDLEvents } from "./gen/events.ts";

ok(
  VDLEvents.UserDeletedEvent.buildSubject("u-1") === "auth.user_deleted.u-1",
  "deprecated builder",
);
ok(
  VDLEvents.UserCreatedEvent.buildSubject("u-2") === "auth.user_created.u-2",
  "deprecated with message builder",
);
ok(
  VDLEvents.SystemReadyEvent.buildSubject() === "system.ready",
  "active builder",
);

const generated = readFileSync("gen/events.ts", "utf-8");
ok(
  generated.includes("@deprecated This event is deprecated."),
  "missing default deprecation notice",
);
ok(
  generated.includes("@deprecated Use UserCreatedV2 instead."),
  "missing custom deprecation message",
);
ok(
  generated.includes("function buildUserDeletedEventSubject("),
  "private builder must exist",
);
ok(!generated.includes("export function build"), "builders must stay private");
ok(!generated.includes("VDLEventMetadata"), "no metadata type");
