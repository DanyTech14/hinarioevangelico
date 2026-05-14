import raw from "@/data/hymns.json";

export type Hymn = {
  language: string;
  number: string;
  category: string;
  title: string;
  body: string;
};

export const HYMNS: Hymn[] = raw as Hymn[];

export const LANGUAGES = Array.from(new Set(HYMNS.map((h) => h.language)));

export function findHymn(language: string, number: string): Hymn | undefined {
  return HYMNS.find(
    (h) =>
      h.language.toLowerCase() === language.toLowerCase() &&
      h.number.toLowerCase() === number.toLowerCase(),
  );
}

export function searchHymns(query: string, language?: string): Hymn[] {
  const q = query.trim().toLowerCase();
  let list = HYMNS;
  if (language && language !== "Todos") list = list.filter((h) => h.language === language);
  if (!q) return list;
  // number match boost
  const numMatch = list.filter((h) => h.number.toLowerCase() === q);
  const rest = list.filter(
    (h) =>
      h.number.toLowerCase() !== q &&
      (h.title.toLowerCase().includes(q) ||
        h.body.toLowerCase().includes(q) ||
        h.category.toLowerCase().includes(q)),
  );
  return [...numMatch, ...rest];
}
