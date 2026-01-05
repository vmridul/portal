function normalizeUUID(id: string): string | null {
  const clean = id.replace(/-/g, "").toLowerCase();

  if (!/^[0-9a-f]{32}$/.test(clean)) return null;

  // insert hyphens: 8-4-4-4-12
  return clean.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5");
}

export default normalizeUUID;
