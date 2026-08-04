import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Minus, Plus, Maximize2, Minimize2, Home, Share2, MonitorPlay, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HYMNS, findHymn, shareHymn } from "@/lib/hymns";
import { useFavorites } from "@/lib/favorites";

export const Route = createFileRoute("/hino/$language/$number")({
  loader: ({ params }) => {
    const hymn = findHymn(params.language, params.number);
    if (!hymn) throw notFound();
    return { hymn };
  },
  head: ({ loaderData }) => {
    const h = loaderData?.hymn;
    return {
      meta: [
        { title: h ? `Hino ${h.number} — ${h.title}` : "Hino" },
        {
          name: "description",
          content: h ? `${h.title} (${h.language}). ${h.category}` : "Hino",
        },
      ],
    };
  },
  component: HymnPage,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center text-center p-6">
      <div>
        <p className="font-display text-3xl mb-2">Hino não encontrado</p>
        <Link to="/" className="text-primary underline">
          Voltar à lista
        </Link>
      </div>
    </div>
  ),
});

function HymnPage() {
  const { hymn } = Route.useLoaderData();
  const [size, setSize] = useState<number>(() => {
    if (typeof window === "undefined") return 28;
    const v = localStorage.getItem("hymn-size");
    return v ? parseInt(v) : 28;
  });
  const [focus, setFocus] = useState(false);
  const { isFavorite, toggle: toggleFav } = useFavorites();
  const fav = isFavorite(hymn.language, hymn.number);

  useEffect(() => {
    localStorage.setItem("hymn-size", String(size));
  }, [size]);

  const { prev, next } = useMemo(() => {
    const sameLang = HYMNS.filter((h) => h.language === hymn.language);
    const idx = sameLang.findIndex((h) => h.number === hymn.number);
    return {
      prev: idx > 0 ? sameLang[idx - 1] : null,
      next: idx >= 0 && idx < sameLang.length - 1 ? sameLang[idx + 1] : null,
    };
  }, [hymn]);

  const stanzas = useMemo(() => parseStanzas(hymn.body), [hymn.body]);

  return (
    <div className="min-h-screen flex flex-col">
      {!focus && (
        <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border">
          <div className="mx-auto max-w-5xl px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-1 sm:gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2 px-2 sm:px-3">
                <Home className="h-4 w-4" /> <span className="hidden xs:inline sm:inline">Início</span>
              </Button>
            </Link>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSize((s) => Math.max(16, s - 2))}
                aria-label="Diminuir texto"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-xs tabular-nums w-10 text-center text-muted-foreground">
                {size}px
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSize((s) => Math.min(72, s + 2))}
                aria-label="Aumentar texto"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleFav(hymn.language, hymn.number)}
                aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                aria-pressed={fav}
                className="ml-1"
              >
                <Star className={`h-4 w-4 ${fav ? "fill-primary text-primary" : ""}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => shareHymn(hymn)}
                aria-label="Partilhar no WhatsApp"
                className="ml-1 gap-1.5"
              >
                <Share2 className="h-4 w-4" /> <span className="hidden sm:inline">Partilhar</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFocus(true)}
                aria-label="Modo concentração"
                className="ml-1"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </header>
      )}

      {focus && (
        <button
          onClick={() => setFocus(false)}
          className="fixed top-4 right-4 z-40 h-10 w-10 rounded-full bg-card/90 border border-border grid place-items-center shadow-md hover:bg-card"
          aria-label="Sair do modo concentração"
        >
          <Minimize2 className="h-4 w-4" />
        </button>
      )}

      <main className="flex-1 mx-auto w-full max-w-3xl px-6 py-10">
        <div className="text-center mb-8">
          {hymn.category && (
            <p className="uppercase tracking-[0.25em] text-xs text-muted-foreground mb-2">
              {hymn.category}
            </p>
          )}
          <div className="flex items-center justify-center gap-3">
            <span className="font-display text-5xl md:text-6xl font-semibold text-primary leading-none">
              {hymn.number}
            </span>
            <div className="h-12 w-px bg-border" />
            <h1 className="font-display text-2xl md:text-3xl text-left">{hymn.title}</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-3">{hymn.language}</p>
        </div>

        <article
          className="font-display leading-relaxed text-foreground space-y-6 text-balance"
          style={{ fontSize: `${size}px`, lineHeight: 1.45 }}
        >
          {stanzas.map((st, i) =>
            st.kind === "chorus" ? (
              <div
                key={i}
                className="relative italic rounded-r-lg border-l-4 border-primary bg-primary/5 pl-5 pr-3 py-3 -ml-2"
              >
                <span
                  className="block uppercase tracking-[0.25em] font-sans not-italic font-semibold text-primary mb-2"
                  style={{ fontSize: `${Math.max(11, size * 0.45)}px` }}
                >
                  Coro
                </span>
                {st.lines.map((l, j) => (
                  <div key={j}>{l}</div>
                ))}
              </div>
            ) : (
              <div key={i} className="relative">
                {st.number && (
                  <span
                    className="absolute -left-10 md:-left-12 top-0 font-semibold text-primary/60 select-none"
                    style={{ fontSize: `${Math.max(14, size * 0.7)}px` }}
                  >
                    {st.number}
                  </span>
                )}
                {st.lines.map((l, j) => (
                  <div key={j}>{l}</div>
                ))}
              </div>
            ),
          )}
        </article>

        <nav className="mt-16 flex items-center justify-between gap-3 border-t border-border pt-6">
          {prev ? (
            <Link
              to="/hino/$language/$number"
              params={{ language: prev.language, number: prev.number }}
              className="flex-1 group rounded-lg border border-border p-3 hover:border-primary hover:bg-card transition-all"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ArrowLeft className="h-3 w-3" /> Anterior
              </div>
              <div className="font-display truncate">
                {prev.number}. {prev.title}
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {next ? (
            <Link
              to="/hino/$language/$number"
              params={{ language: next.language, number: next.number }}
              className="flex-1 group rounded-lg border border-border p-3 hover:border-primary hover:bg-card transition-all text-right"
            >
              <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                Próximo <ArrowRight className="h-3 w-3" />
              </div>
              <div className="font-display truncate">
                {next.number}. {next.title}
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </nav>
      </main>
    </div>
  );
}

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
