import raw from "@/data/liturgy.json";

export type LiturgyKind = "invocatoria" | "litania" | "salmo";

export type LiturgyItem = {
  id: string;
  type: LiturgyKind;
  number: string;
  title: string;
  body: string;
};

export const LITURGY: LiturgyItem[] = raw as LiturgyItem[];

export const KIND_LABEL: Record<LiturgyKind, string> = {
  invocatoria: "Invocatórias",
  litania: "Litanias",
  salmo: "Leituras Responsivas (Salmos)",
};

export const KINDS: LiturgyKind[] = ["invocatoria", "litania", "salmo"];

export function findLiturgy(id: string): LiturgyItem | undefined {
  return LITURGY.find((i) => i.id === id);
}

export function searchLiturgy(query: string, kind?: LiturgyKind | "Todos"): LiturgyItem[] {
  const q = query.trim().toLowerCase();
  let list = LITURGY;
  if (kind && kind !== "Todos") list = list.filter((i) => i.type === kind);
  if (!q) return list;
  return list.filter(
    (i) => i.title.toLowerCase().includes(q) || i.body.toLowerCase().includes(q),
  );
}

export function liturgyToShareText(i: LiturgyItem): string {
  return `*${i.title}*\n\n${i.body.trim()}\n\n— Hinário Evangélico`;
}
