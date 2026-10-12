export type BoundsTuple = {
  min: [number, number, number];
  max: [number, number, number];
};

export type PropertyDefinition = {
  id: "bs17" | "sol10";
  label: string;
  description: string;
  epsg: number;
  ifc: { label: string; url: string };
  scan: { label: string; manifestUrl: string };
  alignment: { status: "metadata-derived"; note: string };
};

export const propertyCatalog: readonly PropertyDefinition[] = [
  {
    id: "bs17",
    label: "BS17",
    description: "ARST as-built IFC + Loft LCC2 scan",
    epsg: 32632,
    ifc: {
      label: "BS17-SEMY-ARST-ASBUILT.ifc",
      url: "property-data/bs17/ifc",
    },
    scan: {
      label: "BS17 Loft scan",
      manifestUrl: "property-data/bs17/lcc/manifest.lcc2",
    },
    alignment: {
      status: "metadata-derived",
      note: "Aligned from the IFC coordination matrix and the LCC EPSG:32632 origin.",
    },
  },
  {
    id: "sol10",
    label: "SOL10",
    description: "SOL10 IFC + outdoor LCC2 scan",
    epsg: 32632,
    ifc: { label: "SOL10.ifc", url: "property-data/sol10/ifc" },
    scan: {
      label: "SOL10 outdoor scan",
      manifestUrl: "property-data/sol10/lcc/manifest.lcc2",
    },
    alignment: {
      status: "metadata-derived",
      note: "Aligned from the IFC coordination matrix and the LCC EPSG:32632 origin; visual survey verification is still required.",
    },
  },
] as const;

export function getProperty(id: string) {
  return propertyCatalog.find((property) => property.id === id);
}
