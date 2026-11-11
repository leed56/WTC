const references = [
  { name: "Sapphire", min: "1.762", max: "1.770", source: "https://www.gia.edu/sapphire" },
  { name: "Spinel", min: "1.718", max: "1.718", source: "https://www.gia.edu/spinel" }
];

export function compareRefractiveIndex(reading) {
  if (!reading) return [];
  const measured = Number(reading);
  return references.map(reference => ({
    ...reference,
    matches: measured >= Number(reference.min) && measured <= Number(reference.max)
  }));
}
