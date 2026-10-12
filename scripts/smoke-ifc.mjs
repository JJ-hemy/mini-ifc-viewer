import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { IfcAPI } from "../node_modules/web-ifc/web-ifc-api-node.js";

const inputPath = process.argv[2];
if (!inputPath) {
  throw new Error("Usage: npm run smoke:ifc -- <path-to-model.ifc>");
}

const absoluteInputPath = path.resolve(inputPath);
const wasmDirectory = fileURLToPath(
  new URL("../node_modules/web-ifc/", import.meta.url),
);

const api = new IfcAPI();
api.SetWasmPath(`${wasmDirectory}${path.sep}`, true);
await api.Init(undefined, true);

const data = new Uint8Array(await readFile(absoluteInputPath));
const modelId = api.OpenModel(data, { COORDINATE_TO_ORIGIN: true });
if (modelId < 0 || !api.IsModelOpen(modelId)) {
  throw new Error(`web-ifc could not open ${absoluteInputPath}`);
}

let meshCount = 0;
const coordinationMatrix = api.GetCoordinationMatrix(modelId);
api.StreamAllMeshes(modelId, () => {
  meshCount += 1;
});

const schema = api.GetModelSchema(modelId);
const maxExpressId = api.GetMaxExpressID(modelId);
api.CloseModel(modelId);
api.Dispose();

console.log(
  JSON.stringify(
    {
      file: absoluteInputPath,
      schema,
      meshCount,
      maxExpressId,
      coordinationMatrix,
    },
    null,
    2,
  ),
);
