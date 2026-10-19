import {
  assert,
  type PluginInput,
  type PluginOutput,
} from "@varavel/vdl-plugin-sdk";
import { getOptionString } from "@varavel/vdl-plugin-sdk/utils/options";
import { collectEventModels } from "./events/collect-event-models.js";
import { renderTsFile } from "./ts/render-ts-file.js";

const defaultOutFile = "events.ts";

/**
 * Resolves the output filename for the generated TypeScript event file.
 */
export function resolveOutFile(input: PluginInput): string {
  const outFile = getOptionString(input.options, "outFile", defaultOutFile);
  const trimmedOutFile = outFile.trim();
  const finalOutFile =
    trimmedOutFile.length > 0 ? trimmedOutFile : defaultOutFile;

  assert(
    finalOutFile.endsWith(".ts"),
    `Invalid outFile ${JSON.stringify(finalOutFile)}. The output file must end with .ts`,
  );

  return finalOutFile;
}

/**
 * Generates the plugin output for the VDL TypeScript events plugin.
 */
export function generatePluginOutput(input: PluginInput): PluginOutput {
  const outFile = resolveOutFile(input);
  const events = collectEventModels(input.ir);

  if (events.length === 0) {
    return { files: [] };
  }

  return {
    files: [
      {
        path: outFile,
        content: renderTsFile(events),
      },
    ],
  };
}
