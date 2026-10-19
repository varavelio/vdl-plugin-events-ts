var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  generate: () => generate
});
module.exports = __toCommonJS(index_exports);

// node_modules/@varavel/vdl-plugin-sdk/dist/core/errors.js
var _a;
var PluginError = (_a = class extends Error {
  constructor(message, position) {
    super(message);
    this.name = "PluginError";
    this.position = position;
  }
}, __name(_a, "PluginError"), _a);
function fail(message, position) {
  throw new PluginError(message, position);
}
__name(fail, "fail");
function assert(condition, message, position) {
  if (!condition) throw new PluginError(message, position);
}
__name(assert, "assert");

// node_modules/@varavel/vdl-plugin-sdk/dist/core/define-plugin.js
function definePlugin(handler) {
  return (input) => {
    try {
      return handler(input);
    } catch (error) {
      return {
        files: [],
        errors: [toPluginError(error)]
      };
    }
  };
}
__name(definePlugin, "definePlugin");
function toPluginError(error) {
  if (error instanceof PluginError) return {
    message: error.message,
    position: error.position
  };
  if (error instanceof Error) return { message: error.message };
  return { message: "An unknown generation error occurred." };
}
__name(toPluginError, "toPluginError");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/options/get-option-string.js
function getOptionString(options, key, defaultValue) {
  const value = options === null || options === void 0 ? void 0 : options[key];
  return value === void 0 ? defaultValue : value;
}
__name(getOptionString, "getOptionString");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/ir/get-annotation.js
function getAnnotation(annotations, name) {
  if (!annotations) return void 0;
  return annotations.find((anno) => anno.name === name);
}
__name(getAnnotation, "getAnnotation");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/ir/get-annotation-arg.js
function getAnnotationArg(annotations, name) {
  const anno = getAnnotation(annotations, name);
  return anno === null || anno === void 0 ? void 0 : anno.argument;
}
__name(getAnnotationArg, "getAnnotationArg");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/deprecations/get-deprecation-message.js
function getDeprecationMessage(annotations) {
  const argument = getAnnotationArg(annotations, "deprecated");
  if ((argument === null || argument === void 0 ? void 0 : argument.kind) !== "string") return;
  return argument.stringValue;
}
__name(getDeprecationMessage, "getDeprecationMessage");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/deprecations/is-deprecated.js
function isDeprecated(annotations) {
  return getAnnotation(annotations, "deprecated") !== void 0;
}
__name(isDeprecated, "isDeprecated");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/ir/unwrap-literal.js
function unwrapLiteral(value) {
  return unwrapLiteralValue(value);
}
__name(unwrapLiteral, "unwrapLiteral");
function unwrapLiteralValue(value) {
  switch (value.kind) {
    case "string":
      return value.stringValue;
    case "int":
      return value.intValue;
    case "float":
      return value.floatValue;
    case "bool":
      return value.boolValue;
    case "object": {
      var _value$objectEntries;
      const resolvedObject = {};
      const entries = (_value$objectEntries = value.objectEntries) !== null && _value$objectEntries !== void 0 ? _value$objectEntries : [];
      for (const entry of entries) resolvedObject[entry.key] = unwrapLiteralValue(entry.value);
      return resolvedObject;
    }
    case "array":
      var _value$arrayItems;
      return ((_value$arrayItems = value.arrayItems) !== null && _value$arrayItems !== void 0 ? _value$arrayItems : []).map((item) => unwrapLiteralValue(item));
    default:
      return null;
  }
}
__name(unwrapLiteralValue, "unwrapLiteralValue");

// node_modules/@varavel/vdl-plugin-sdk/dist/utils/events/assert-valid-ir-for-events.js
var EVENT_ANNOTATION_NAME = "event";
function assertValidIrForEvents(ir) {
  rejectEventOutsideTypes(ir);
  const typesByName = /* @__PURE__ */ new Map();
  for (const typeDef of ir.types) typesByName.set(typeDef.name, typeDef);
  const events = [];
  for (const typeDef of ir.types) {
    const annotation = typeDef.annotations.find((item) => item.name === EVENT_ANNOTATION_NAME);
    if (!annotation) continue;
    events.push(validateEventType(typeDef, annotation.position, annotation.argument, typesByName));
  }
  events.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  return events;
}
__name(assertValidIrForEvents, "assertValidIrForEvents");
function rejectEventOutsideTypes(ir) {
  for (const enumDef of ir.enums) {
    const annotation = enumDef.annotations.find((item) => item.name === EVENT_ANNOTATION_NAME);
    if (annotation) fail(`Annotation @event is only allowed on type declarations, found on enum ${JSON.stringify(enumDef.name)}.`, annotation.position);
  }
  for (const constant of ir.constants) {
    const annotation = constant.annotations.find((item) => item.name === EVENT_ANNOTATION_NAME);
    if (annotation) fail(`Annotation @event is only allowed on type declarations, found on constant ${JSON.stringify(constant.name)}.`, annotation.position);
  }
}
__name(rejectEventOutsideTypes, "rejectEventOutsideTypes");
function validateEventType(typeDef, annotationPosition, argument, typesByName) {
  var _typeDef$typeRef$obje;
  if (argument === void 0 || argument.kind !== "string") fail(`Type ${JSON.stringify(typeDef.name)} annotation @event must have a string subject template argument.`, annotationPosition);
  const template = unwrapLiteral(argument);
  if (typeof template !== "string") fail(`Type ${JSON.stringify(typeDef.name)} annotation @event must have a string subject template argument.`, annotationPosition);
  assert(typeDef.typeRef.kind === "object", `Type ${JSON.stringify(typeDef.name)} is annotated with @event and must be an object type.`, typeDef.position);
  const fields = (_typeDef$typeRef$obje = typeDef.typeRef.objectFields) !== null && _typeDef$typeRef$obje !== void 0 ? _typeDef$typeRef$obje : [];
  const names = parseSubjectTemplate(typeDef.name, template, annotationPosition);
  const seen = /* @__PURE__ */ new Set();
  const placeholders = [];
  for (const name of names) {
    if (seen.has(name)) continue;
    seen.add(name);
    const field = fields.find((item) => item.name === name);
    if (!field) fail(`Type ${JSON.stringify(typeDef.name)} annotation @event placeholder ${JSON.stringify(name)} does not match any payload field.`, annotationPosition);
    if (field.optional) fail(`Type ${JSON.stringify(typeDef.name)} annotation @event placeholder ${JSON.stringify(name)} must reference only required fields.`, annotationPosition);
    const primitiveType = resolvePrimitiveType(typeDef.name, field.typeRef, typesByName, annotationPosition);
    if (!primitiveType) fail(`Type ${JSON.stringify(typeDef.name)} annotation @event placeholder ${JSON.stringify(name)} must reference only primitive fields.`, annotationPosition);
    placeholders.push({
      field: name,
      primitiveType
    });
  }
  return {
    name: typeDef.name,
    position: typeDef.position,
    subjectTemplate: template,
    placeholders
  };
}
__name(validateEventType, "validateEventType");
function parseSubjectTemplate(typeName, template, position) {
  const names = [];
  let index = 0;
  while (index < template.length) {
    const open = template.indexOf("{", index);
    if (open === -1) break;
    const close = template.indexOf("}", open + 1);
    if (close === -1) fail(`Type ${JSON.stringify(typeName)} annotation @event subject template has an unclosed placeholder in its subject template.`, position);
    const inner = template.slice(open + 1, close);
    if (!isIdentifier(inner)) fail(`Type ${JSON.stringify(typeName)} annotation @event placeholder ${JSON.stringify(inner)} must be a top-level field name.`, position);
    names.push(inner);
    index = close + 1;
  }
  if (template.indexOf("}", index) !== -1) fail(`Type ${JSON.stringify(typeName)} annotation @event subject template has a stray closing brace in its subject template.`, position);
  return names;
}
__name(parseSubjectTemplate, "parseSubjectTemplate");
function isIdentifier(value) {
  if (value.length === 0) return false;
  if (!isAlpha(value.charCodeAt(0))) return false;
  for (let i = 1; i < value.length; i += 1) if (!isAlphaNum(value.charCodeAt(i))) return false;
  return true;
}
__name(isIdentifier, "isIdentifier");
function isAlpha(code) {
  return code >= 65 && code <= 90 || code >= 97 && code <= 122 || code === 95;
}
__name(isAlpha, "isAlpha");
function isAlphaNum(code) {
  return isAlpha(code) || code >= 48 && code <= 57;
}
__name(isAlphaNum, "isAlphaNum");
function resolvePrimitiveType(typeName, typeRef, typesByName, position) {
  const seen = /* @__PURE__ */ new Set();
  let current = typeRef;
  for (; ; ) {
    if (current.kind === "primitive" && current.primitiveName) return current.primitiveName;
    if (current.kind === "type" && current.typeName) {
      if (seen.has(current.typeName)) fail(`Type ${JSON.stringify(typeName)} annotation @event has a circular type reference.`, position);
      seen.add(current.typeName);
      const target = typesByName.get(current.typeName);
      if (!target) fail(`Type ${JSON.stringify(typeName)} annotation @event points to unknown type ${JSON.stringify(current.typeName)}.`, position);
      current = target.typeRef;
      continue;
    }
    return;
  }
}
__name(resolvePrimitiveType, "resolvePrimitiveType");

// src/events/collect-event-models.ts
function collectEventModels(ir) {
  const events = assertValidIrForEvents(ir);
  const typesByName = new Map(
    ir.types.map((typeDef) => [typeDef.name, typeDef])
  );
  return events.map((event) => {
    const typeDef = typesByName.get(event.name);
    const deprecated = isDeprecated(typeDef == null ? void 0 : typeDef.annotations);
    const message = getDeprecationMessage(typeDef == null ? void 0 : typeDef.annotations);
    return __spreadValues(__spreadProps(__spreadValues({}, event), {
      isDeprecated: deprecated
    }), message === void 0 ? {} : { deprecationMessage: message });
  });
}
__name(collectEventModels, "collectEventModels");

// src/events/placeholders.ts
var eventPlaceholderPattern = /\{([^{}]+)\}/g;
function listPlaceholderMatches(subject) {
  const matches = [];
  const pattern = new RegExp(eventPlaceholderPattern.source, "g");
  let match = pattern.exec(subject);
  while (match) {
    matches.push(match);
    match = pattern.exec(subject);
  }
  return matches;
}
__name(listPlaceholderMatches, "listPlaceholderMatches");

// src/ts/render-ts-type.ts
function renderTypeScriptType(primitiveType) {
  switch (primitiveType) {
    case "string":
      return "string";
    case "int":
    case "float":
      return "number";
    case "bool":
      return "boolean";
    case "datetime":
      return "Date";
    default:
      return primitiveType;
  }
}
__name(renderTypeScriptType, "renderTypeScriptType");
function renderSubjectValue(fieldName, primitiveType) {
  if (primitiveType === "datetime") {
    return `${fieldName}.toISOString()`;
  }
  return fieldName;
}
__name(renderSubjectValue, "renderSubjectValue");

// src/ts/render-ts-file.ts
function renderTsFile(events) {
  const lines = ["// Generated by VDL. Do not edit.", ""];
  if (events.length > 0) {
    lines.push(
      ...renderCatalogInterface(events),
      "",
      ...renderCatalogValue(events)
    );
  }
  return `${lines.join("\n")}
`;
}
__name(renderTsFile, "renderTsFile");
function renderCatalogInterface(events) {
  const lines = [
    "/**",
    " * Catalogs all `@event`-annotated types with their subject metadata and builders.",
    " */",
    "export interface VDLEventCatalog {"
  ];
  for (const event of events) {
    lines.push(...renderCatalogEntryDoc(event, "  "));
    lines.push(`  ${event.name}: {`);
    lines.push("    /** Event payload type name. */");
    lines.push("    name: string;");
    lines.push(
      "    /** Literal subject template from the `@event` annotation. */"
    );
    lines.push("    subjectTemplate: string;");
    lines.push("    /** Typed subject builder for this event. */");
    lines.push(`    buildSubject: (${renderSubjectParams(event)}) => string;`);
    lines.push("  };");
  }
  lines.push("}");
  return lines;
}
__name(renderCatalogInterface, "renderCatalogInterface");
function renderCatalogValue(events) {
  const lines = [
    "/**",
    " * Indexes generated events by payload type name.",
    " */",
    "export const VDLEvents: VDLEventCatalog = {"
  ];
  for (const event of events) {
    lines.push(...renderCatalogEntryDoc(event, "  "));
    lines.push(`  ${event.name}: {`);
    lines.push("    /** Event payload type name. */");
    lines.push(`    name: ${JSON.stringify(event.name)},`);
    lines.push(
      "    /** Literal subject template from the `@event` annotation. */"
    );
    lines.push(
      `    subjectTemplate: ${JSON.stringify(event.subjectTemplate)},`
    );
    lines.push("    /** Typed subject builder for this event. */");
    lines.push(`    buildSubject(${renderSubjectParams(event)}): string {`);
    lines.push(`      return ${renderSubjectExpression(event)};`);
    lines.push("    },");
    lines.push("  },");
  }
  lines.push("};");
  return lines;
}
__name(renderCatalogValue, "renderCatalogValue");
function renderCatalogEntryDoc(event, indent) {
  var _a2;
  const lines = [
    `${indent}/**`,
    `${indent} * Metadata for the ${event.name} event.`,
    `${indent} *`,
    `${indent} * Subject: ${event.subjectTemplate}`
  ];
  if (event.isDeprecated) {
    lines.push(
      `${indent} *`,
      `${indent} * @deprecated ${(_a2 = event.deprecationMessage) != null ? _a2 : "This event is deprecated."}`
    );
  }
  lines.push(`${indent} */`);
  return lines;
}
__name(renderCatalogEntryDoc, "renderCatalogEntryDoc");
function renderSubjectParams(event) {
  return event.placeholders.map((placeholder) => {
    return `${placeholder.field}: ${renderTypeScriptType(placeholder.primitiveType)}`;
  }).join(", ");
}
__name(renderSubjectParams, "renderSubjectParams");
function renderSubjectExpression(event) {
  var _a2, _b, _c;
  const placeholdersByName = new Map(
    event.placeholders.map((placeholder) => [placeholder.field, placeholder])
  );
  let cursor = 0;
  let literalChunk = "";
  let expression = "";
  for (const match of listPlaceholderMatches(event.subjectTemplate)) {
    const start = (_a2 = match.index) != null ? _a2 : 0;
    const raw = (_b = match[0]) != null ? _b : "";
    const placeholderName = (_c = match[1]) != null ? _c : "";
    literalChunk += event.subjectTemplate.slice(cursor, start);
    const placeholder = placeholdersByName.get(placeholderName);
    if (!placeholder) {
      throw new Error(`Missing placeholder model for ${placeholderName}`);
    }
    expression += `${escapeTemplateText(literalChunk)}\${${renderSubjectValue(placeholder.field, placeholder.primitiveType)}}`;
    literalChunk = "";
    cursor = start + raw.length;
  }
  literalChunk += event.subjectTemplate.slice(cursor);
  if (expression === "") {
    return JSON.stringify(event.subjectTemplate);
  }
  return `\`${expression}${escapeTemplateText(literalChunk)}\``;
}
__name(renderSubjectExpression, "renderSubjectExpression");
function escapeTemplateText(value) {
  return value.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}
__name(escapeTemplateText, "escapeTemplateText");

// src/generate.ts
var defaultOutFile = "events.ts";
function resolveOutFile(input) {
  const outFile = getOptionString(input.options, "outFile", defaultOutFile);
  const trimmedOutFile = outFile.trim();
  const finalOutFile = trimmedOutFile.length > 0 ? trimmedOutFile : defaultOutFile;
  assert(
    finalOutFile.endsWith(".ts"),
    `Invalid outFile ${JSON.stringify(finalOutFile)}. The output file must end with .ts`
  );
  return finalOutFile;
}
__name(resolveOutFile, "resolveOutFile");
function generatePluginOutput(input) {
  const outFile = resolveOutFile(input);
  const events = collectEventModels(input.ir);
  if (events.length === 0) {
    return { files: [] };
  }
  return {
    files: [
      {
        path: outFile,
        content: renderTsFile(events)
      }
    ]
  };
}
__name(generatePluginOutput, "generatePluginOutput");

// src/index.ts
var generate = definePlugin(generatePluginOutput);
