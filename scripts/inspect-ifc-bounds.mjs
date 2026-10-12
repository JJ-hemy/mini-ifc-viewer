import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  IfcAPI,
  LogLevel,
} from "../node_modules/web-ifc/web-ifc-api-node.js";

const inputPath = process.argv[2];
const coordinateToOrigin = process.argv.includes("--origin");
if (!inputPath) {
  throw new Error("Usage: node scripts/inspect-ifc-bounds.mjs <path-to-model.ifc>");
}

const absoluteInputPath = path.resolve(inputPath);
const wasmDirectory = fileURLToPath(
  new URL("../node_modules/web-ifc/", import.meta.url),
);

const api = new IfcAPI();
api.SetWasmPath(`${wasmDirectory}${path.sep}`, true);
await api.Init(undefined, true);
api.SetLogLevel(LogLevel.LOG_LEVEL_OFF);

const data = new Uint8Array(await readFile(absoluteInputPath));
const modelId = api.OpenModel(data, { COORDINATE_TO_ORIGIN: coordinateToOrigin });
if (modelId < 0 || !api.IsModelOpen(modelId)) {
  throw new Error(`web-ifc could not open ${absoluteInputPath}`);
}

const min = [Infinity, Infinity, Infinity];
const max = [-Infinity, -Infinity, -Infinity];
let placedGeometryCount = 0;
let vertexCount = 0;

function includePoint(x, y, z) {
  min[0] = Math.min(min[0], x);
  min[1] = Math.min(min[1], y);
  min[2] = Math.min(min[2], z);
  max[0] = Math.max(max[0], x);
  max[1] = Math.max(max[1], y);
  max[2] = Math.max(max[2], z);
}

const meshes = api.LoadAllGeometry(modelId);
for (let meshIndex = 0; meshIndex < meshes.size(); meshIndex += 1) {
  const mesh = meshes.get(meshIndex);
  try {
    for (let geometryIndex = 0; geometryIndex < mesh.geometries.size(); geometryIndex += 1) {
      const placedGeometry = mesh.geometries.get(geometryIndex);
      const geometry = api.GetGeometry(modelId, placedGeometry.geometryExpressID);
      try {
        const vertices = api.GetVertexArray(
          geometry.GetVertexData(),
          geometry.GetVertexDataSize(),
        );
        const matrix = placedGeometry.flatTransformation;
        placedGeometryCount += 1;
        vertexCount += vertices.length / 6;

        for (let vertexIndex = 0; vertexIndex < vertices.length; vertexIndex += 6) {
          const x = vertices[vertexIndex];
          const y = vertices[vertexIndex + 1];
          const z = vertices[vertexIndex + 2];
          includePoint(
            matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
            matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
            matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14],
          );
        }
      } finally {
        geometry.delete();
      }
    }
  } finally {
    // FlatMesh is a plain wrapper in this WebIFC build; its geometries vector
    // is owned by the parent vector and has no public disposer.
  }
}

const result = {
  file: absoluteInputPath,
  schema: api.GetModelSchema(modelId),
  coordinateToOrigin,
  coordinationMatrix: api.GetCoordinationMatrix(modelId),
  placedGeometryCount,
  vertexCount,
  bounds: {
    min,
    max,
    size: max.map((value, index) => value - min[index]),
    center: max.map((value, index) => (value + min[index]) / 2),
  },
};

meshes.delete();
api.CloseModel(modelId);
api.Dispose();

console.log(JSON.stringify(result, null, 2));
