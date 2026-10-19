import { ok } from "node:assert/strict";
import { existsSync } from "node:fs";
import { VDLEvents } from "./gen/billing-events.ts";

ok(existsSync("gen/billing-events.ts"), "expected custom output file");
ok(!existsSync("gen/events.ts"), "default output must not be emitted");
ok(
  VDLEvents.InvoicePaidEvent.buildSubject(42) === "billing.invoice_paid.42",
  "catalog builder",
);
