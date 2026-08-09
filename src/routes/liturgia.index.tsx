import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ArrowLeft, ScrollText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LITURGY, KINDS, KIND_LABEL, searchLiturgy, type LiturgyKind } from "@/lib/liturgy";

export const Route = createFileRoute("/liturgia/")({
  head: () => ({
    meta: [
      { title: "Litanias, Salmos e Invocatórias — Hinário Evangélico" },
      {
        name: "description",
        content:
          "Textos litúrgicos organizados para o culto: invocatórias, litanias responsivas e leituras dos Salmos.",
      },
      { property: "og:title", content: "Litanias, Salmos e Invocatórias" },
      {
        property: "og:description",
        content: "Textos litúrgicos para uso durante o culto, prontos para ler em conjunto.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LiturgyIndex,
});

function LiturgyIndex() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<LiturgyKind | "Todos">("Todos");

  const results = useMemo(() => searchLiturgy(query, kind), [query, kind]);

  const grouped = useMemo(() => {
    return KINDS.map((k) => ({ kind: k, items: results.filter((i) => i.type === k) })).filter(
      (g) => g.items.length > 0,
    );
  }, [results]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Hinos
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 pt-8 pb-6 text-center">
        <p className="uppercase tracking-[0.2em] text-[10px] sm:text-xs text-accent-foreground/80 font-semibold mb-3">
          Ordem do Culto
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
          Litanias, Salmos e <span className="italic text-primary">Invocatórias</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
          {LITURGY.length} textos litúrgicos para ler em conjunto durante o culto.
        </p>

        <div className="mt-6 max-w-2xl mx-auto space-y-5">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Procurar por título ou texto…"
              inputMode="search"
              className="h-12 pl-12 pr-4 text-base rounded-2xl border-2 bg-card shadow-sm transition-shadow focus-visible:ring-2 focus-visible:ring-primary focus-visible:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_12%,transparent)]"
            />
          </div>
          <div className="-mx-4 px-4 overflow-x-auto sm:overflow-visible scrollbar-none">
            <div className="flex sm:justify-center gap-2 w-max sm:w-auto mx-auto">
              {(["Todos", ...KINDS] as const).map((k) => (
                <Button
                  key={k}
                  variant={kind === k ? "default" : "outline"}
                  size="sm"
                  onClick={() => setKind(k)}
                  className="rounded-full shrink-0"
                >
                  {k === "Todos" ? "Todos" : KIND_LABEL[k]}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-20 space-y-10">
        {grouped.length === 0 && (
          <p className="text-center py-16 text-muted-foreground">Nenhum texto encontrado.</p>
        )}
        {grouped.map((g) => (
          <div key={g.kind}>
            <h2 className="font-display text-xl font-semibold flex items-center gap-2 mb-3">
              <ScrollText className="h-5 w-5 text-primary" />
              {KIND_LABEL[g.kind]}
              <span className="text-sm font-normal text-muted-foreground">({g.items.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {g.items.map((i) => (
                <Link
                  key={i.id}
                  to="/liturgia/$id"
                  params={{ id: i.id }}
                  className="group rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-all p-4 flex items-start gap-3"
                >
                  <div className="shrink-0 h-11 w-11 rounded-md bg-secondary text-secondary-foreground grid place-items-center font-display text-lg font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {i.number}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-base leading-snug">{i.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {i.body.replace(/\s+/g, " ").slice(0, 70)}…
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
