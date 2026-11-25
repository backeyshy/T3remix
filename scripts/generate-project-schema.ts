// @effect-diagnostics nodeBuiltinImport:off - standalone editor schema generator.
import * as NodeFS from "node:fs";
import { buildT3ProjectFileJsonSchema } from "@t3tools/shared/t3ProjectFile";

const output = new URL("../docs/schema/t3-project.json", import.meta.url);
NodeFS.writeFileSync(output, JSON.stringify(buildT3ProjectFileJsonSchema(), null, 2) + "\n");
