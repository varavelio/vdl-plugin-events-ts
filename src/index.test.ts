import {
  annotation,
  arrayType,
  enumDef,
  enumMember,
  enumType,
  field,
  intLiteral,
  mapType,
  namedType,
  objectType,
  pluginInput,
  primitiveType,
  schema,
  stringLiteral,
  typeDef,
} from "@varavel/vdl-plugin-sdk/testing";
import { describe, expect, it } from "vitest";
import { generate } from "./index.js";

function createEventAnnotation(subject?: string) {
  return annotation(
    "event",
    subject === undefined ? undefined : stringLiteral(subject),
  );
}

function generateFromSchema(
  options: { outFile?: string } = {},
  schemaInput = schema(),
) {
  return generate(
    pluginInput({
      options,
      ir: schemaInput,
    }),
  );
}

function getOnlyGeneratedFile(output: ReturnType<typeof generate>) {
  const files = output.files ?? [];
  expect(files).toHaveLength(1);

  const file = files[0];
  if (!file) {
    throw new Error("expected one generated file");
  }

  return file;
}

describe("generate", () => {
  it("returns no files when the schema has no @event types", () => {
    const output = generateFromSchema(
      {},
      schema({
        types: [
          typeDef("User", objectType([field("id", primitiveType("string"))])),
        ],
      }),
    );

    expect(output.errors).toBeUndefined();
    expect(output.files ?? []).toEqual([]);
  });

  it("uses events.ts as the default output filename", () => {
    const output = generateFromSchema(
      {},
      schema({
        types: [
          typeDef(
            "HealthcheckEvent",
            objectType([field("service", primitiveType("string"))]),
            { annotations: [createEventAnnotation("healthcheck.ok")] },
          ),
        ],
      }),
    );

    const file = getOnlyGeneratedFile(output);
    expect(file.path).toBe("events.ts");
  });

  it("uses a custom outFile when it ends with .ts", () => {
    const output = generateFromSchema(
      { outFile: "custom-events.ts" },
      schema({
        types: [
          typeDef(
            "HealthcheckEvent",
            objectType([field("service", primitiveType("string"))]),
            { annotations: [createEventAnnotation("healthcheck.ok")] },
          ),
        ],
      }),
    );

    const file = getOnlyGeneratedFile(output);
    expect(file.path).toBe("custom-events.ts");
  });

  it("falls back to events.ts when outFile is blank", () => {
    const output = generateFromSchema(
      { outFile: "   " },
      schema({
        types: [
          typeDef(
            "HealthcheckEvent",
            objectType([field("service", primitiveType("string"))]),
            { annotations: [createEventAnnotation("healthcheck.ok")] },
          ),
        ],
      }),
    );

    const file = getOnlyGeneratedFile(output);
    expect(file.path).toBe("events.ts");
  });

  it("generates a single documented file for annotated events only", () => {
    const output = generateFromSchema(
      {},
      schema({
        types: [
          typeDef(
            "UserCreatedEvent",
            objectType([
              field("userId", primitiveType("string")),
              field("email", primitiveType("string")),
              field("timestamp", primitiveType("datetime")),
            ]),
            {
              annotations: [
                createEventAnnotation("auth.user_created.{userId}"),
              ],
            },
          ),
          typeDef(
            "IgnoredType",
            objectType([field("value", primitiveType("string"))]),
          ),
        ],
      }),
    );

    expect(output.errors).toBeUndefined();

    const file = getOnlyGeneratedFile(output);
    expect(file.path).toBe("events.ts");
    expect(file.content).toContain("buildSubject(userId: string): string {");
    // biome-ignore lint/suspicious/noTemplateCurlyInString: asserting generated template literal
    expect(file.content).toContain("return `auth.user_created.${userId}`;");
    expect(file.content).toContain("export interface VDLEventCatalog {");
    expect(file.content).toContain(
      "export const VDLEvents: VDLEventCatalog = {",
    );
    expect(file.content).toContain("buildSubject: (userId: string) => string;");
    expect(file.content).not.toContain("function build");
    expect(file.content).not.toContain("VDLEventMetadata");
    expect(file.content).toContain(
      'subjectTemplate: "auth.user_created.{userId}",',
    );
    expect(file.content).toContain("/** Event payload type name. */");
    expect(file.content).toContain(
      "/** Typed subject builder for this event. */",
    );
    expect(file.content).not.toContain("export interface UserCreatedEvent");
    expect(file.content).not.toContain("export type UserCreatedEvent");
    expect(file.content).not.toContain("IgnoredType");
  });

  it("generates a builder with no parameters when the subject has no placeholders", () => {
    const output = generateFromSchema(
      {},
      schema({
        types: [
          typeDef(
            "SystemReadyEvent",
            objectType([field("message", primitiveType("string"))]),
            { annotations: [createEventAnnotation("system.ready")] },
          ),
        ],
      }),
    );

    const file = getOnlyGeneratedFile(output);
    expect(file.content).toContain("buildSubject(): string {");
    expect(file.content).toContain('return "system.ready";');
  });

  it("deduplicates repeated placeholders in the builder signature", () => {
    const output = generateFromSchema(
      {},
      schema({
        types: [
          typeDef(
            "TenantAuditEvent",
            objectType([field("tenantId", primitiveType("string"))]),
            {
              annotations: [
                createEventAnnotation(
                  "audit.{tenantId}.users.{tenantId}.created",
                ),
              ],
            },
          ),
        ],
      }),
    );

    const file = getOnlyGeneratedFile(output);
    expect(file.content).toContain("buildSubject(tenantId: string): string {");
    expect(file.content).toContain(
      // biome-ignore lint/suspicious/noTemplateCurlyInString: asserting generated template literal
      "return `audit.${tenantId}.users.${tenantId}.created`;",
    );
  });

  it("formats placeholders for every supported primitive type", () => {
    const output = generateFromSchema(
      {},
      schema({
        types: [
          typeDef(
            "PrimitiveSubjectEvent",
            objectType([
              field("name", primitiveType("string")),
              field("count", primitiveType("int")),
              field("amount", primitiveType("float")),
              field("active", primitiveType("bool")),
              field("occurredAt", primitiveType("datetime")),
            ]),
            {
              annotations: [
                createEventAnnotation(
                  "metrics.{name}.{count}.{amount}.{active}.{occurredAt}",
                ),
              ],
            },
          ),
        ],
      }),
    );

    const file = getOnlyGeneratedFile(output);
    expect(file.content).toContain(
      "buildSubject(name: string, count: number, amount: number, active: boolean, occurredAt: Date): string {",
    );
    expect(file.content).toContain(
      // biome-ignore lint/suspicious/noTemplateCurlyInString: asserting generated template literal
      "return `metrics.${name}.${count}.${amount}.${active}.${occurredAt.toISOString()}`;",
    );
  });

  it("supports named primitive placeholder fields", () => {
    const output = generateFromSchema(
      {},
      schema({
        types: [
          typeDef("TenantID", primitiveType("string")),
          typeDef(
            "TenantCreatedEvent",
            objectType([
              field("tenantId", namedType("TenantID")),
              field("createdBy", primitiveType("string")),
            ]),
            {
              annotations: [
                createEventAnnotation("tenants.{tenantId}.created"),
              ],
            },
          ),
        ],
      }),
    );

    const file = getOnlyGeneratedFile(output);
    expect(file.content).toContain("buildSubject(tenantId: string): string {");
    // biome-ignore lint/suspicious/noTemplateCurlyInString: asserting generated template literal
    expect(file.content).toContain("return `tenants.${tenantId}.created`;");
  });

  it("does not generate payload models even when events use complex payload fields", () => {
    const output = generateFromSchema(
      {},
      schema({
        types: [
          typeDef(
            "ComplexPayloadEvent",
            objectType([
              field("tenantId", primitiveType("string")),
              field("actorId", primitiveType("int")),
              field("tags", arrayType(primitiveType("string"))),
              field("attributes", arrayType(primitiveType("bool"))),
              field(
                "details",
                objectType([field("ip", primitiveType("string"))]),
              ),
            ]),
            {
              annotations: [
                createEventAnnotation("audit.{tenantId}.payload.created"),
              ],
            },
          ),
        ],
      }),
    );

    const file = getOnlyGeneratedFile(output);
    expect(file.content).toContain("buildSubject(tenantId: string): string {");
    expect(file.content).not.toContain("export interface ComplexPayloadEvent");
    expect(file.content).not.toContain("ActorId");
  });

  it("returns a diagnostic when @event is used on a non-object type", () => {
    const output = generateFromSchema(
      {},
      schema({
        types: [
          typeDef("UserCreatedEvent", primitiveType("string"), {
            annotations: [createEventAnnotation("auth.user_created.{userId}")],
          }),
        ],
      }),
    );

    expect(output.files).toEqual([]);
    expect(output.errors).toHaveLength(1);
    expect(output.errors?.[0]?.message).toContain("must be an object type");
  });

  it("returns a diagnostic when @event is missing its subject argument", () => {
    const output = generateFromSchema(
      {},
      schema({
        types: [
          typeDef(
            "UserCreatedEvent",
            objectType([field("userId", primitiveType("string"))]),
            { annotations: [createEventAnnotation()] },
          ),
        ],
      }),
    );

    expect(output.files).toEqual([]);
    expect(output.errors).toHaveLength(1);
    expect(output.errors?.[0]?.message).toContain(
      "must have a string subject template argument",
    );
  });

  it("returns a diagnostic when @event uses a non-string literal argument", () => {
    const output = generate(
      pluginInput({
        options: {},
        ir: schema({
          types: [
            typeDef(
              "UserCreatedEvent",
              objectType([field("userId", primitiveType("string"))]),
              { annotations: [annotation("event", intLiteral(42))] },
            ),
          ],
        }),
      }),
    );

    expect(output.files).toEqual([]);
    expect(output.errors).toHaveLength(1);
    expect(output.errors?.[0]?.message).toContain(
      "must have a string subject template argument",
    );
  });

  it("returns a diagnostic when outFile does not end with .ts", () => {
    const output = generateFromSchema(
      { outFile: "events.txt" },
      schema({
        types: [
          typeDef(
            "HealthcheckEvent",
            objectType([field("service", primitiveType("string"))]),
            { annotations: [createEventAnnotation("healthcheck.ok")] },
          ),
        ],
      }),
    );

    expect(output.files).toEqual([]);
    expect(output.errors).toHaveLength(1);
    expect(output.errors?.[0]?.message).toContain(
      'Invalid outFile "events.txt"',
    );
  });

  it("returns a diagnostic when a placeholder field is missing", () => {
    const output = generateFromSchema(
      {},
      schema({
        types: [
          typeDef(
            "UserCreatedEvent",
            objectType([field("userId", primitiveType("string"))]),
            {
              annotations: [
                createEventAnnotation("auth.user_created.{tenantId}"),
              ],
            },
          ),
        ],
      }),
    );

    expect(output.files).toEqual([]);
    expect(output.errors).toHaveLength(1);
    expect(output.errors?.[0]?.message).toContain(
      'placeholder "tenantId" does not match any payload field',
    );
  });

  it("returns a diagnostic when a placeholder uses a nested path", () => {
    const output = generateFromSchema(
      {},
      schema({
        types: [
          typeDef(
            "AccountCreatedEvent",
            objectType([
              field("user", objectType([field("id", primitiveType("string"))])),
            ]),
            {
              annotations: [
                createEventAnnotation("accounts.{user.id}.created"),
              ],
            },
          ),
        ],
      }),
    );

    expect(output.files).toEqual([]);
    expect(output.errors).toHaveLength(1);
    expect(output.errors?.[0]?.message).toContain(
      'placeholder "user.id" must be a top-level field name',
    );
  });

  it.each([
    ["array", arrayType(primitiveType("string"))],
    ["map", mapType(primitiveType("string"))],
    ["inline object", objectType([field("id", primitiveType("string"))])],
    ["named object", namedType("User")],
    ["enum", enumType("Status", "string")],
  ])(
    "returns a diagnostic when a placeholder references a non-primitive %s field",
    (_label, typeRef) => {
      const output = generateFromSchema(
        {},
        schema({
          enums: [
            enumDef("Status", "string", [
              enumMember("Pending", stringLiteral("pending")),
            ]),
          ],
          types: [
            typeDef("User", objectType([field("id", primitiveType("string"))])),
            typeDef(
              "InvalidEvent",
              objectType([
                field("subjectPart", typeRef),
                field("ok", primitiveType("string")),
              ]),
              {
                annotations: [
                  createEventAnnotation("invalid.{subjectPart}.created"),
                ],
              },
            ),
          ],
        }),
      );

      expect(output.files).toEqual([]);
      expect(output.errors).toHaveLength(1);
      expect(output.errors?.[0]?.message).toContain(
        'placeholder "subjectPart" must reference only primitive fields',
      );
    },
  );

  it("emits JSDoc deprecation notices for deprecated events", () => {
    const output = generateFromSchema(
      {},
      schema({
        types: [
          typeDef(
            "OldEvent",
            objectType([field("userId", primitiveType("string"))]),
            {
              annotations: [
                createEventAnnotation("auth.old.{userId}"),
                annotation("deprecated", stringLiteral("Use NewEvent.")),
              ],
            },
          ),
        ],
      }),
    );

    const file = getOnlyGeneratedFile(output);
    expect(file.content).toContain("@deprecated Use NewEvent.");
  });

  it("emits a default JSDoc notice when deprecated without a message", () => {
    const output = generateFromSchema(
      {},
      schema({
        types: [
          typeDef(
            "LegacyEvent",
            objectType([field("userId", primitiveType("string"))]),
            {
              annotations: [
                createEventAnnotation("auth.legacy.{userId}"),
                annotation("deprecated"),
              ],
            },
          ),
        ],
      }),
    );

    const file = getOnlyGeneratedFile(output);
    expect(file.content).toContain("@deprecated This event is deprecated.");
  });

  it("omits JSDoc deprecation notices for active events", () => {
    const output = generateFromSchema(
      {},
      schema({
        types: [
          typeDef(
            "ActiveEvent",
            objectType([field("userId", primitiveType("string"))]),
            {
              annotations: [createEventAnnotation("auth.active.{userId}")],
            },
          ),
        ],
      }),
    );

    const file = getOnlyGeneratedFile(output);
    expect(file.content).not.toContain("@deprecated");
  });
});
