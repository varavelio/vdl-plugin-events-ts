import { ok } from "node:assert/strict";
import { VDLEvents } from "./gen/events.ts";

ok(
  VDLEvents.UserCreatedEvent.buildSubject("u-1") === "auth.user_created.u-1",
  "catalog buildSubject must interpolate userId",
);
ok(VDLEvents.UserCreatedEvent.name === "UserCreatedEvent", "catalog name");
ok(
  VDLEvents.UserCreatedEvent.subjectTemplate === "auth.user_created.{userId}",
  "catalog subjectTemplate",
);
