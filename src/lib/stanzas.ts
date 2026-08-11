export type Stanza = {
  kind: "verse" | "chorus";
  number: string | null;
  lines: string[];
};

export function parseStanzas(body: string): Stanza[] {
  const lines = body.split("\n");
  const stanzas: Stanza[] = [];
  let current: Stanza | null = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (current && current.lines.length) {
        stanzas.push(current);
        current = null;
      }
      continue;
    }
    const chorus = /^coro\s*:?\s*(.*)$/i.exec(line);
    const m = /^(\d+)\.\s*(.*)$/.exec(line);
    if (chorus) {
      if (current) stanzas.push(current);
      current = { kind: "chorus", number: null, lines: chorus[1] ? [chorus[1]] : [] };
    } else if (m) {
      if (current) stanzas.push(current);
      current = { kind: "verse", number: m[1], lines: m[2] ? [m[2]] : [] };
    } else {
      if (!current) current = { kind: "verse", number: null, lines: [] };
      current.lines.push(line);
    }
  }
  if (current) stanzas.push(current);
  return stanzas;
}
