# Property IFC + LCC Viewer

A small Three.js viewer for choosing a property and loading its IFC and LCC2
scan together. The current catalog contains **BS17** and **SOL10**; users do not
upload files.

Features:

- property selector backed by `src/property-catalog.ts`;
- local IFC parsing with That Open Components and `web-ifc`;
- LCC2 rendering with the XGRIDS SDK already present in
  `hemy360-viewer-lab-main`;
- automatic metadata alignment using the IFC coordination matrix, the LCC
  EPSG:32632 origin, and a Z-up to Y-up axis conversion;
- IFC/LCC visibility controls, fit-to-property, IFC highlighting, and an IFC
  property panel.

The Vite middleware streams the source files from their existing locations. It
does not copy the large models into this app or expose arbitrary filesystem
paths.

## Run locally

```powershell
npm install
npm run dev
```

Open the URL printed by Vite and select **BS17** or **SOL10**.

The checked-in defaults point to the current sibling data folders. A different
machine can set these variables in `.env.local` without changing viewer code:

```text
MINI_BS17_IFC=C:\path\to\BS17.ifc
MINI_BS17_LCC2_ROOT=C:\path\to\bs17-lcc-folder
MINI_SOL10_IFC=C:\path\to\SOL10.ifc
MINI_SOL10_LCC2_ROOT=C:\path\to\sol10-lcc-folder
```

Each LCC root must contain exactly one `.lcc2` manifest, either directly or
through a chain of single nested folders.

## Alignment workflow

For each selected property the viewer:

1. validates the LCC manifest EPSG, origin, and bounds;
2. lets WebIFC shift the large IFC coordinates near the origin;
3. reads that exact IFC coordination shift from the converted model;
4. combines it with the LCC `[east, north, height]` offset;
5. converts LCC Z-up coordinates to Three.js/WebIFC Y-up coordinates;
6. rejects the result when the transformed IFC and LCC spatial envelopes do
   not overlap within a small validation tolerance.

This is deterministic and reusable for properties whose IFC and scan truly use
the same CRS/datum. It is still labelled **metadata aligned**, not survey
verified. A production ingestion workflow should also record control-point QA
and reject datasets whose bounds or checkpoints do not agree.

## Large IFC note

SOL10 is about 211 MB. It is parsed in the browser in this prototype, so its
first load can consume substantial memory. At portfolio scale, convert each IFC
once to a streamed Fragments artifact during ingestion, keep the original IFC
for archive/download, and point the property manifest at the optimized artifact.

## Checks

```powershell
npm run build
npm run smoke:ifc -- C:\path\to\model.ifc
npm run inspect:bounds -- C:\path\to\model.ifc --origin
```

The build bundles the locally available licensed XGRIDS SDK. Do not publish the
generated `dist` folder unless your SDK licence permits that deployment.
