import { createReadStream } from "node:fs";
import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  defineConfig,
  loadEnv,
  type Plugin,
  type PreviewServer,
  type ViteDevServer,
} from "vite";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const testsetRoot = path.resolve(projectRoot, "..");
const threejsRoot = path.resolve(testsetRoot, "..");
const hemyRoot = path.join(threejsRoot, "hemy360-viewer-lab-main");

const wasmFiles = [
  ["web-ifc.wasm", "web-ifc.wasm"],
  ["web-ifc-mt.wasm", "web-ifc-mt.wasm"],
  ["LICENSE.md", "LICENSE-web-ifc.md"],
] as const;

async function copyWasm(targetDirectory: string) {
  const sourceDirectory = path.resolve("node_modules/web-ifc");
  await mkdir(targetDirectory, { recursive: true });
  await Promise.all(
    wasmFiles.map(([source, target]) =>
      copyFile(path.join(sourceDirectory, source), path.join(targetDirectory, target)),
    ),
  );
}

function contentType(filePath: string) {
  return /\.(?:lcc2|json)$/i.test(filePath)
    ? "application/json; charset=utf-8"
    : "application/octet-stream";
}

async function findManifest(root: string) {
  let directory = root;
  for (let depth = 0; depth < 10; depth += 1) {
    const entries = await readdir(directory, { withFileTypes: true });
    const manifests = entries.filter(
      (entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".lcc2"),
    );
    if (manifests.length === 1) return path.join(directory, manifests[0].name);
    const children = entries.filter((entry) => entry.isDirectory());
    if (manifests.length > 0 || children.length !== 1) break;
    directory = path.join(directory, children[0].name);
  }
  throw new Error(`Expected one LCC2 manifest below ${root}`);
}

type PropertyFiles = {
  ifc: string;
  lccRoot: string;
};

function localPropertyData(files: Record<string, PropertyFiles>): Plugin {
  const configure = (server: ViteDevServer | PreviewServer) => {
    const manifestCache = new Map<string, Promise<string>>();
    server.middlewares.use("/property-data", async (request, response) => {
      if (request.method !== "GET" && request.method !== "HEAD") {
        response.writeHead(405).end();
        return;
      }

      let segments: string[];
      try {
        const pathname = decodeURIComponent(
          new URL(request.url ?? "/", "http://localhost").pathname,
        );
        segments = pathname.split("/").filter(Boolean);
      } catch {
        response.writeHead(400).end();
        return;
      }

      const [propertyId, kind, ...relativeSegments] = segments;
      const property = files[propertyId];
      if (!property || !kind) {
        response.writeHead(404).end();
        return;
      }

      try {
        let filePath: string;
        if (kind === "ifc" && relativeSegments.length === 0) {
          filePath = property.ifc;
        } else if (kind === "lcc" && relativeSegments.length > 0) {
          let manifest = manifestCache.get(propertyId);
          if (!manifest) {
            manifest = findManifest(property.lccRoot);
            manifestCache.set(propertyId, manifest);
          }
          const manifestPath = await manifest;
          const assetRoot = path.dirname(manifestPath);
          const relativePath = relativeSegments.join("/");
          if (relativePath === "manifest.lcc2") {
            filePath = manifestPath;
          } else {
            filePath = path.resolve(assetRoot, relativePath);
            const fromRoot = path.relative(assetRoot, filePath);
            if (!fromRoot || fromRoot.startsWith("..") || path.isAbsolute(fromRoot)) {
              response.writeHead(403).end();
              return;
            }
          }
        } else {
          response.writeHead(404).end();
          return;
        }

        const info = await stat(filePath);
        if (!info.isFile()) throw new Error("Not a file");
        response.writeHead(200, {
          "Content-Type": contentType(filePath),
          "Content-Length": info.size,
          "Cache-Control": "no-store",
          "Accept-Ranges": "none",
        });
        if (request.method === "HEAD") response.end();
        else createReadStream(filePath).pipe(response);
      } catch {
        response.writeHead(404).end();
      }
    });
  };

  return {
    name: "local-property-data",
    configureServer: configure,
    configurePreviewServer: configure,
  };
}

function webIfcWasm(): Plugin {
  return {
    name: "web-ifc-wasm",
    async buildStart() {
      await copyWasm(path.resolve("public/wasm"));
    },
    async configureServer() {
      await copyWasm(path.resolve("public/wasm"));
    },
    async writeBundle() {
      await copyWasm(path.resolve("dist/wasm"));
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, "MINI_");
  const sol10Root = path.join(threejsRoot, "sol10");
  const propertyFiles: Record<string, PropertyFiles> = {
    bs17: {
      ifc: env.MINI_BS17_IFC || path.join(testsetRoot, "bim", "BS17-SEMY-ARST-ASBUILT.ifc"),
      lccRoot: env.MINI_BS17_LCC2_ROOT || path.join(testsetRoot, "lcc2", "152950-loft"),
    },
    sol10: {
      ifc: env.MINI_SOL10_IFC || path.join(sol10Root, "SOL10.ifc"),
      lccRoot:
        env.MINI_SOL10_LCC2_ROOT ||
        path.join(sol10Root, "SOL10_00_OUTDOOR_26-07-10_151840(LCC2SOG)"),
    },
  };

  return {
    base: "./",
    plugins: [webIfcWasm(), localPropertyData(propertyFiles)],
    server: {
      fs: { allow: [projectRoot, hemyRoot] },
    },
    esbuild: {
      supported: { "top-level-await": true },
    },
  };
});
