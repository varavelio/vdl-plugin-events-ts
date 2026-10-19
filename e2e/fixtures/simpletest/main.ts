import { ok } from "node:assert/strict";
import { buildUserCreatedEventSubject, VDLEvents } from "./gen/events.ts";

ok(
  buildUserCreatedEventSubject("u-1") === "auth.user_created.u-1",
  "builder must interpolate userId",
);
ok(VDLEvents.UserCreatedEvent.name === "UserCreatedEvent", "catalog name");
ok(
  VDLEvents.UserCreatedEvent.subjectTemplate === "auth.user_created.{userId}",
  "catalog subjectTemplate",
);
ok(
  VDLEvents.UserCreatedEvent.buildSubject("u-2") === "auth.user_created.u-2",
  "catalog buildSubject",
);
