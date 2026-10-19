import { ok } from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildSystemReadyEventSubject,
  buildUserCreatedEventSubject,
  buildUserDeletedEventSubject,
  VDLEvents,
} from "./gen/events.ts";

ok(
  buildUserDeletedEventSubject("u-1") === "auth.user_deleted.u-1",
  "deprecated builder",
);
ok(
  buildUserCreatedEventSubject("u-2") === "auth.user_created.u-2",
  "deprecated with message builder",
);
ok(buildSystemReadyEventSubject() === "system.ready", "active builder");

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
  VDLEvents.SystemReadyEvent.name === "SystemReadyEvent",
  "active catalog entry",
);
