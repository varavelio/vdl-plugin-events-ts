import { ok } from "node:assert/strict";
import {
  buildTenantAuditCreatedEventSubject,
  VDLEvents,
} from "./gen/events.ts";

ok(
  buildTenantAuditCreatedEventSubject("t-1") === "audit.t-1.users.t-1.created",
  "repeated placeholder must reuse value",
);
ok(
  VDLEvents.TenantAuditCreatedEvent.buildSubject("t-2") ===
    "audit.t-2.users.t-2.created",
  "catalog repeated placeholder",
);
