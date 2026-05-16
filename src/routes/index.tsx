import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, BookOpen, Music } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InstallPrompt } from "@/components/InstallPrompt";
import { HYMNS, LANGUAGES, searchHymns } from "@/lib/hymns";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hinário Evangélico — Cantar em comunhão" },
      {
        name: "description",
        content:
          "Acesso fácil e organizado a centenas de hinos para uso no culto. Pesquise por número, título ou letra.",
      },
      { property: "og:title", content: "Hinário Evangélico" },
      {
        property: "og:description",
        content: "Hinário digital para uso durante o culto. Pesquise e cante.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState<string>("Português");

  const results = useMemo(() => searchHymns(query, lang), [query, lang]);
  const visible = results.slice(0, 200);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-md bg-primary text-primary-foreground grid place-items-center shadow-sm">
              <Music className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-xl font-semibold">Hinário</div>
              <div className="text-xs text-muted-foreground -mt-0.5">Cantar em comunhão</div>
            </div>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pt-12 pb-8 text-center">
        <p className="uppercase tracking-[0.25em] text-xs text-accent-foreground/80 font-semibold mb-3">
          Hinário Evangélico Completo
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-semibold leading-[1.05]">
          Cante com a congregação,
          <br />
          <span className="italic text-primary">em qualquer momento do culto.</span>
        </h1>
        <p className="mt-5 text-muted-foreground max-w-xl mx-auto">
          {HYMNS.length} hinos em {LANGUAGES.length} línguas. Pesquise por número, título ou letra
          e cante em ecrã grande, com tipografia legível mesmo em luz baixa.
        </p>

        <div className="mt-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Procurar hino: número, título ou trecho da letra…"
              className="h-14 pl-12 pr-4 text-lg rounded-xl border-2 bg-card shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {["Todos", ...LANGUAGES].map((l) => (
              <Button
                key={l}
                variant={lang === l ? "default" : "outline"}
                size="sm"
                onClick={() => setLang(l)}
                className="rounded-full"
              >
                {l}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {query ? `${results.length} resultado(s)` : `Hinos em ${lang}`}
          </h2>
          {results.length > visible.length && (
            <p className="text-sm text-muted-foreground">
              A mostrar os primeiros {visible.length}. Refine a pesquisa.
            </p>
          )}
        </div>

        {visible.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Nenhum hino encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visible.map((h) => (
              <Link
                key={`${h.language}-${h.number}`}
                to="/hino/$language/$number"
                params={{ language: h.language, number: h.number }}
                className="group rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-all p-4 flex items-start gap-3"
              >
                <div className="shrink-0 h-12 w-12 rounded-md bg-secondary text-secondary-foreground grid place-items-center font-display text-xl font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {h.number}
                </div>
                <div className="min-w-0">
                  {h.category && (
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">
                      {h.category}
                    </p>
                  )}
                  <p className="font-display text-lg leading-snug truncate">{h.title}</p>
                  <p className="text-xs text-muted-foreground">{h.language}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Hinário Evangélico — Igreja Evangélica Congregacional em Angola (6ª edição)
      </footer>
    </div>
  );
}
