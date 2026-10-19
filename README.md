<p align="center">
  <img
    src="https://cdn.jsdelivr.net/gh/varavelio/vdl@9cb843/assets/png/vdl.png"
    alt="VDL logo"
    width="130"
  />
</p>

<h1 align="center">VDL TypeScript Events Plugin</h1>

<p align="center">
  Generate TypeScript <strong>subject builders</strong> and a centralized <strong>event catalog</strong> from VDL <code>@event</code> types.
</p>

<p align="center">
  <a href="https://varavel.com">
    <img
      src="https://cdn.jsdelivr.net/gh/varavelio/brand@1.0.0/dist/badges/project.svg"
      alt="A Varavel project"
    />
  </a>
  <a href="https://varavel.com/vdl">
    <img
      src="https://cdn.jsdelivr.net/gh/varavelio/brand@1.0.0/dist/badges/vdl-plugin.svg"
      alt="VDL Plugin"
    />
  </a>
</p>

<p align="center">
  Strictly follows <a href="https://vdl.varavel.com/docs/protocols/events/">VPP-4: Events</a>.
</p>

This plugin is event-focused.

It only generates code for types annotated with `@event`. Unannotated types are ignored.

It does **not** generate TypeScript payload models (types/enums/constants). Payload contracts are delegated to [`varavelio/vdl-plugin-ts`](https://github.com/varavelio/vdl-plugin-ts).

Use it when you want to:

- generate strongly typed subject builders for event routing keys
- build routing subjects from validated placeholder fields
- keep event routing metadata synchronized from one VDL source of truth
- expose a small runtime event catalog for dispatching or introspection

The generated file has zero dependencies and works in any JavaScript runtime (Node.js, Deno, Bun, browsers, edge workers).

## Quick Start

1. Generate your TypeScript payload types with `varavelio/vdl-plugin-ts`.
2. Add this plugin to your `vdl.config.vdl` for event routing artifacts:

```vdl
const config = {
  version 1
  plugins [
    {
      src "varavelio/vdl-plugin-ts@<version>" // Use a version from plugin releases
      schema "./schema.vdl"
      outDir "./gen"
    }
    {
      src "varavelio/vdl-plugin-events-ts@<version>" // Use a version from plugin releases
      schema "./schema.vdl"
      outDir "./gen"
    }
  ]
}
```

3. Run your normal VDL generation command:

```bash
vdl generate
```

4. Check the generated output in `./gen`:

- `events.ts`

## Plugin Options

All options are optional.

| Option    | Type     | Default       | What it changes                                                              |
| --------- | -------- | ------------- | ---------------------------------------------------------------------------- |
| `outFile` | `string` | `"events.ts"` | Sets the generated TypeScript filename inside `outDir`. Must end with `.ts`. |

Example with all options:

```vdl
const config = {
  version 1
  plugins [
    {
      src "varavelio/vdl-plugin-events-ts@<version>" // Use a version from plugin releases
      schema "./schema.vdl"
      outDir "./gen"
      options {
        outFile "billing-events.ts"
      }
    }
  ]
}
```

## Event Annotation Model

This plugin follows the VDL `@event` specification (VPP-4):

- Spec: https://vdl.varavel.com/docs/protocols/events/

Core rules enforced by this plugin (via `assertValidIrForEvents`):

- `@event("subject.template")` must be attached to a top-level object type
- placeholders use `{fieldName}` syntax
- placeholders must match top-level payload fields exactly
- placeholders must point to top-level primitive fields only
- placeholder fields must be required

Example:

```vdl
@event("auth.user_created.{userId}")
type UserCreatedEvent {
  userId string
  email string
  createdAt datetime
}
```

## What You Get

- `build<Event>Subject`: exported typed subject builder per event
- `VDLEventMetadata`: shared metadata interface (`name`, `subjectTemplate`, `buildSubject`)
- `VDLEventCatalog`: interface grouping per-event metadata by event name
- `VDLEvents`: constant holding the fully typed event catalog

All generated events are consolidated into a single TypeScript file.

## Generated TypeScript Shape

Given this schema:

```vdl
@event("auth.user_created.{userId}")
type UserCreatedEvent {
  userId string
  email string
  createdAt datetime
}
```

The generated TypeScript output is similar to (comments trimmed for brevity):

```ts
export function buildUserCreatedEventSubject(userId: string): string {
  return `auth.user_created.${userId}`;
}

export interface VDLEventMetadata<TBuildSubject extends (...args: any[]) => string> {
  name: string;
  subjectTemplate: string;
  buildSubject: TBuildSubject;
}

export interface VDLEventCatalog {
  UserCreatedEvent: VDLEventMetadata<(userId: string) => string>;
}

export const VDLEvents: VDLEventCatalog = {
  UserCreatedEvent: {
    name: "UserCreatedEvent",
    subjectTemplate: "auth.user_created.{userId}",
    buildSubject: buildUserCreatedEventSubject,
  },
};
```

Each builder and catalog entry carries JSDoc with the event name and subject template. Deprecated events carry `@deprecated` tags. External access goes through the catalog's typed `buildSubject` fields or the exported builder functions directly.

## Type Mapping

| VDL        | TypeScript output |
| ---------- | ----------------- |
| `string`   | `string`          |
| `int`      | `number`          |
| `float`    | `number`          |
| `bool`     | `boolean`         |
| `datetime` | `Date`            |

Named placeholder field types are resolved to their underlying VDL primitive type when generating builder function parameters.

## Subject Builder Behavior

- String placeholders interpolate directly inside template literals.
- Numeric and boolean placeholders interpolate with implicit string conversion.
- `datetime` placeholders call `.toISOString()` on the `Date` value.
- Repeated placeholders appear only once in the builder signature, in first-appearance order.
- Static subjects without placeholders generate zero-argument builders returning a string literal.
- Static subject text is escaped for safe interpolation inside template literals.

## Validation Behavior

Generation fails with structured plugin diagnostics when:

- `@event` is used on a non-object type
- `@event` is missing its string subject argument
- a subject placeholder references a missing field
- a subject placeholder references a non-primitive field
- a subject placeholder references an optional field
- `outFile` does not end with `.ts`

## Notes

- If the schema contains no valid `@event` types, the plugin emits no files.
- The plugin only generates subject builders and event inventory metadata.
- The plugin does not generate payload models, enums, constants, or validation helpers.
- Generate payload contracts with [`varavelio/vdl-plugin-ts`](https://github.com/varavelio/vdl-plugin-ts).
- Generated code targets strict ES6 (`--target es6 --strict`) with no imports, so it type-checks and runs anywhere.
- This plugin is intended specifically for the VDL event specification, not full TypeScript model generation.

## License

This plugin is released under the MIT License. See [LICENSE](LICENSE).
