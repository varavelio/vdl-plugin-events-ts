import type { PrimitiveType } from "@varavel/vdl-plugin-sdk";

/**
 * Renders a VDL primitive type into its TypeScript type form.
 */
export function renderTypeScriptType(primitiveType: PrimitiveType): string {
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

/**
 * Renders a placeholder field reference into TypeScript subject-building code.
 */
export function renderSubjectValue(
  fieldName: string,
  primitiveType: PrimitiveType,
): string {
  if (primitiveType === "datetime") {
    return `${fieldName}.toISOString()`;
  }

  return fieldName;
}
