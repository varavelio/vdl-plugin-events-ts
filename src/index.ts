import { definePlugin } from "@varavel/vdl-plugin-sdk";
import { generatePluginOutput } from "./generate.js";

/**
 * Canonical VDL plugin entrypoint for TypeScript event generation.
 */
export const generate = definePlugin(generatePluginOutput);
