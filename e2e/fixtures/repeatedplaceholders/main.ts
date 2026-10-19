import { ok } from "node:assert/strict";
import { VDLEvents } from "./gen/events.ts";

ok(
  VDLEvents.TenantAuditCreatedEvent.buildSubject("t-1") ===
    "audit.t-1.users.t-1.created",
  "repeated placeholder must reuse value",
);
