import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as BUI from "@thatopen/ui";
import * as CUI from "@thatopen/ui-obc";
import fragmentsWorkerUrl from "@thatopen/fragments/worker?url";
import {
  LCCRender,
  type LccObject,
} from "../../../hemy360-viewer-lab-main/vendor/xgrids-web-sdk/lcc-sdk-three.js";
import {
  getProperty,
  propertyCatalog,
  type BoundsTuple,
  type PropertyDefinition,
} from "./property-catalog";
import "./style.css";

type LccManifest = {
  epsg?: number;
  offset?: [number, number, number];
  root?: { boundingBox?: BoundsTuple };
};

function requiredElement<T extends Element>(selector: string) {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing required UI element: ${selector}`);
  return element;
}

const viewer = requiredElement<HTMLDivElement>("#viewer");
const propertySelect = requiredElement<HTMLSelectElement>("#property-select");
const fitButton = requiredElement<HTMLButtonElement>("#fit-button");
const status = requiredElement<HTMLSpanElement>("#status");
const emptyState = requiredElement<HTMLDivElement>("#empty-state");
const layerCard = requiredElement<HTMLElement>("#layer-card");
const propertyName = requiredElement<HTMLElement>("#property-name");
const propertyDescription = requiredElement<HTMLElement>("#property-description");
const alignmentNote = requiredElement<HTMLElement>("#alignment-note");
const showIfc = requiredElement<HTMLInputElement>("#show-ifc");
const showScan = requiredElement<HTMLInputElement>("#show-scan");
const propertiesPanel = requiredElement<HTMLElement>("#properties-panel");
const propertiesContent = requiredElement<HTMLDivElement>("#properties-content");
const closePropertiesButton = requiredElement<HTMLButtonElement>("#close-properties");

for (const property of propertyCatalog) {
  const option = document.createElement("option");
  option.value = property.id;
  option.textContent = property.label;
  propertySelect.append(option);
}

function setStatus(message: string, isError = false) {
  status.textContent = message;
  status.classList.toggle("error", isError);
}

function localUrl(relativePath: string) {
  return new URL(relativePath, document.baseURI).href;
}

async function fetchRequired(url: string, label: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${label} returned HTTP ${response.status}`);
  return response;
}

BUI.Manager.init();

const components = new OBC.Components();
const worlds = components.get(OBC.Worlds);
const world = worlds.create<
  OBC.SimpleScene,
  OBC.OrthoPerspectiveCamera,
  OBC.SimpleRenderer
>();

world.name = "Property IFC + LCC Viewer";
world.scene = new OBC.SimpleScene(components);
world.scene.setup();
world.scene.three.background = new THREE.Color(0x111722);
world.renderer = new OBC.SimpleRenderer(components, viewer, {
  antialias: false,
  powerPreference: "high-performance",
});
world.renderer.three.setPixelRatio(Math.min(devicePixelRatio, 1.5));
world.camera = new OBC.OrthoPerspectiveCamera(components);
world.camera.threePersp.near = 0.01;
world.camera.threePersp.far = 10_000;
world.camera.threePersp.updateProjectionMatrix();
world.camera.controls.restThreshold = 0.05;
world.camera.controls.setLookAt(12, 10, 12, 0, 0, 0, false);

world.onBeforeUpdate.add(() => LCCRender.update());
components.init();
components.get(OBC.Raycasters).get(world);

const fragments = components.get(OBC.FragmentsManager);
fragments.init(fragmentsWorkerUrl);

const ifcLoader = components.get(OBC.IfcLoader);
await ifcLoader.setup({
  autoSetWasm: false,
  wasm: {
    absolute: true,
    path: new URL("wasm/", document.baseURI).href,
  },
});

const highlighter = components.get(OBF.Highlighter);
highlighter.setup({
  world,
  selectMaterialDefinition: {
    color: new THREE.Color(0x7ee2a8),
    renderedFaces: 1,
    opacity: 1,
    transparent: false,
  },
});

const [propertiesTable, updatePropertiesTable] = CUI.tables.itemsData({
  components,
  modelIdMap: {},
});
propertiesTable.preserveStructureOnFilter = true;
propertiesContent.append(propertiesTable);

highlighter.events.select.onHighlight.add((modelIdMap) => {
  propertiesPanel.hidden = false;
  updatePropertiesTable({ modelIdMap });
});

highlighter.events.select.onClear.add(() => {
  propertiesPanel.hidden = true;
  updatePropertiesTable({ modelIdMap: {} });
});

closePropertiesButton.addEventListener("click", () => {
  void highlighter.clear("select");
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Escape") void highlighter.clear("select");
});

fragments.list.onItemSet.add(async ({ value: model }) => {
  model.useCamera(world.camera.three);
  world.scene.three.add(model.object);
  await fragments.core.update(true);
});

world.camera.controls.addEventListener("rest", () => {
  void fragments.core.update(true);
});

world.camera.projection.onChanged.add(() => {
  LCCRender.setCamera(world.camera.three);
  for (const [, model] of fragments.list) model.useCamera(world.camera.three);
});

const resizeObserver = new ResizeObserver(() => {
  world.renderer?.resize();
  world.camera.updateAspect();
});
resizeObserver.observe(viewer);

let currentModel: Awaited<ReturnType<typeof ifcLoader.load>> | null = null;
let currentScan: LccObject | null = null;
let currentScanBounds: THREE.Box3 | null = null;

function scanToIfcMatrix(
  offset: [number, number, number],
  coordinates: number[],
) {
  if (coordinates.length < 3 || !coordinates.slice(0, 3).every(Number.isFinite)) {
    throw new Error("IFC does not expose a usable coordination matrix");
  }

  const [east, north, height] = offset;
  const [coordinateX, coordinateY, coordinateZ] = coordinates;
  const translation = new THREE.Vector3(
    east + coordinateX,
    height + coordinateY,
    -north + coordinateZ,
  );

  // LCC is east/north/up (Z-up). WebIFC/Three is east/up/-north (Y-up).
  return new THREE.Matrix4()
    .makeRotationX(-Math.PI / 2)
    .setPosition(translation);
}

function transformedBounds(bounds: BoundsTuple, matrix: THREE.Matrix4) {
  return new THREE.Box3(
    new THREE.Vector3(...bounds.min),
    new THREE.Vector3(...bounds.max),
  ).applyMatrix4(matrix);
}

async function fitProperty() {
  const bounds = new THREE.Box3();
  if (currentModel && showIfc.checked && currentModel.object.visible) {
    bounds.union(currentModel.box.clone().applyMatrix4(currentModel.object.matrixWorld));
  }
  if (currentScanBounds && showScan.checked) bounds.union(currentScanBounds);
  if (bounds.isEmpty()) return;

  const sphere = bounds.getBoundingSphere(new THREE.Sphere());
  sphere.radius = Math.max(sphere.radius, 1);
  await world.camera.controls.fitToSphere(sphere, true);
  await fragments.core.update(true);
}

async function clearProperty() {
  await highlighter.clear("select");
  if (currentScan) {
    LCCRender.unload(currentScan);
    currentScan = null;
  }
  if (currentModel) {
    await fragments.core.disposeModel(currentModel.modelId);
    currentModel = null;
  }
  currentScanBounds = null;
}

function loadScan(
  manifestUrl: string,
  matrix: THREE.Matrix4,
  property: PropertyDefinition,
) {
  return new Promise<LccObject>((resolve, reject) => {
    let scan: LccObject;
    scan = LCCRender.load(
      {
        camera: world.camera.three,
        scene: world.scene.three,
        dataPath: manifestUrl,
        modelMatrix: matrix,
        renderLib: THREE,
        renderer: world.renderer!.three,
        canvas: world.renderer!.three.domElement,
        useEnv: false,
        useIndexDB: false,
        useLoadingEffect: false,
      },
      () => {
        scan.setMaxNodeSplats(400_000);
        scan.setMaxSplats(matchMedia("(max-width: 720px)").matches ? 750_000 : 1_800_000);
        resolve(scan);
      },
      (progress) => {
        const percent = Math.round(Math.min(Math.max(progress, 0), 1) * 100);
        setStatus(`Loading ${property.label} scan: ${percent}%`);
      },
      () => reject(new Error(`${property.scan.label} could not be loaded`)),
    );
    currentScan = scan;
  });
}

async function loadProperty(property: PropertyDefinition) {
  propertySelect.disabled = true;
  fitButton.disabled = true;
  showIfc.disabled = true;
  showScan.disabled = true;
  viewer.classList.add("loading");
  emptyState.hidden = true;
  layerCard.hidden = false;
  propertyName.textContent = property.label;
  propertyDescription.textContent = property.description;
  alignmentNote.textContent = property.alignment.note;
  showIfc.checked = true;
  showScan.checked = true;

  try {
    await clearProperty();
    setStatus(`Reading ${property.label} metadata…`);

    const manifestUrl = localUrl(property.scan.manifestUrl);
    const [manifestResponse, ifcResponse] = await Promise.all([
      fetchRequired(manifestUrl, property.scan.label),
      fetchRequired(localUrl(property.ifc.url), property.ifc.label),
    ]);
    const manifest = (await manifestResponse.json()) as LccManifest;
    if (
      manifest.epsg !== property.epsg ||
      !manifest.offset ||
      manifest.offset.length !== 3 ||
      !manifest.offset.every(Number.isFinite) ||
      !manifest.root?.boundingBox
    ) {
      throw new Error(`The ${property.label} LCC manifest has incomplete EPSG/origin/bounds metadata`);
    }

    const contentLength = Number(ifcResponse.headers.get("content-length"));
    const sizeText = Number.isFinite(contentLength)
      ? ` (${(contentLength / 1_000_000).toFixed(1)} MB)`
      : "";
    setStatus(`Downloading ${property.ifc.label}${sizeText}…`);
    const ifcBytes = new Uint8Array(await ifcResponse.arrayBuffer());
    setStatus(`Converting ${property.ifc.label} in the browser…`);

    // Disable cross-model auto-coordination. WebIFC still shifts the IFC to
    // the origin, and getCoordinates() exposes the exact shift we reuse here.
    const model = await ifcLoader.load(ifcBytes, false, `${property.id}.ifc`);
    currentModel = model;
    model.useCamera(world.camera.three);
    const coordinates = await model.getCoordinates();
    const lccMatrix = scanToIfcMatrix(manifest.offset, coordinates);
    currentScanBounds = transformedBounds(manifest.root.boundingBox, lccMatrix);
    const ifcBounds = model.box.clone().applyMatrix4(model.object.matrixWorld);
    const scanValidationBounds = currentScanBounds.clone().expandByScalar(10);
    if (!scanValidationBounds.intersectsBox(ifcBounds)) {
      throw new Error("IFC and LCC spatial envelopes do not overlap after metadata alignment");
    }

    setStatus(`Loading ${property.scan.label}…`);
    await loadScan(manifestUrl, lccMatrix, property);
    currentScan?.setVisible(showScan.checked);
    model.object.visible = showIfc.checked;
    await fragments.core.update(true);
    await fitProperty();
    fitButton.disabled = false;
    showIfc.disabled = false;
    showScan.disabled = false;
    setStatus(`${property.label} is ready · IFC and LCC are aligned from EPSG/origin metadata.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus(`Could not load ${property.label}: ${message}`, true);
    await clearProperty();
    emptyState.hidden = false;
    layerCard.hidden = true;
  } finally {
    propertySelect.disabled = false;
    viewer.classList.remove("loading");
  }
}

propertySelect.addEventListener("change", () => {
  const property = getProperty(propertySelect.value);
  if (property) {
    const url = new URL(location.href);
    url.searchParams.set("property", property.id);
    history.replaceState(null, "", url);
    void loadProperty(property);
  }
});

fitButton.addEventListener("click", () => void fitProperty());

showIfc.addEventListener("change", async () => {
  if (!currentModel) return;
  currentModel.object.visible = showIfc.checked;
  await highlighter.clear("select");
  await fragments.core.update(true);
});

showScan.addEventListener("change", () => {
  currentScan?.setVisible(showScan.checked);
});

const requestedProperty = getProperty(
  new URLSearchParams(location.search).get("property") ?? "",
);
if (requestedProperty) {
  propertySelect.value = requestedProperty.id;
  void loadProperty(requestedProperty);
}

window.addEventListener("beforeunload", () => {
  resizeObserver.disconnect();
  if (currentScan) LCCRender.unload(currentScan);
  LCCRender.dispose();
  components.dispose();
});
