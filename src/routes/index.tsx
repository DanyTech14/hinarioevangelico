import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, BookOpen, Music, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InstallPrompt } from "@/components/InstallPrompt";
import { NumberPad } from "@/components/NumberPad";
import { HYMNS, LANGUAGES, searchHymns } from "@/lib/hymns";
import { useFavorites, favId } from "@/lib/favorites";

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
  const [onlyFavs, setOnlyFavs] = useState(false);
  const { ids: favIds, isFavorite, toggle: toggleFav } = useFavorites();

  const results = useMemo(() => {
    const base = searchHymns(query, lang);
    if (!onlyFavs) return base;
    const set = new Set(favIds);
    return base.filter((h) => set.has(favId(h.language, h.number)));
  }, [query, lang, onlyFavs, favIds]);
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

      <section className="mx-auto max-w-6xl px-4 pt-8 sm:pt-12 pb-6 sm:pb-8 text-center">
        <p className="uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[10px] sm:text-xs text-accent-foreground/80 font-semibold mb-3">
          Hinário Evangélico Completo
        </p>
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-semibold leading-[1.1] sm:leading-[1.05] text-balance">
          Cante com a congregação,
          <br />
          <span className="italic text-primary">em qualquer momento do culto.</span>
        </h1>
        <p className="mt-4 sm:mt-5 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto px-2">
          {HYMNS.length} hinos em {LANGUAGES.length} línguas. Pesquise por número, título ou letra
          e cante em ecrã grande, com tipografia legível mesmo em luz baixa.
        </p>

        <div className="mt-6 sm:mt-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Procurar: número, título ou letra…"
              inputMode="search"
              enterKeyHint="search"
              className="h-12 sm:h-14 pl-12 pr-4 text-base sm:text-lg rounded-xl border-2 bg-card shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div className="mt-4 -mx-4 px-4 overflow-x-auto sm:overflow-visible scrollbar-none">
            <div className="flex sm:flex-wrap sm:justify-center gap-2 w-max sm:w-auto mx-auto">
              <Button
                variant={onlyFavs ? "default" : "outline"}
                size="sm"
                onClick={() => setOnlyFavs((v) => !v)}
                className="rounded-full shrink-0 gap-1.5"
                aria-pressed={onlyFavs}
              >
                <Star className={`h-3.5 w-3.5 ${onlyFavs ? "fill-current" : ""}`} />
                Favoritos{favIds.length > 0 ? ` (${favIds.length})` : ""}
              </Button>
              {[
                "Todos",
                "Português",
                "Umbundu",
                "Adicionais (PT/Umbundu)",
                ...LANGUAGES.filter(
                  (l) =>
                    l !== "Português" &&
                    l !== "Umbundu" &&
                    l !== "Adicionais (PT/Umbundu)",
                ),
              ].map((l) => (
                <Button
                  key={l}
                  variant={lang === l ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLang(l)}
                  className="rounded-full shrink-0"
                >
                  {l}
                </Button>
              ))}
            </div>
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
            {onlyFavs && favIds.length === 0
              ? "Ainda não tem favoritos. Abra um hino e toque na ⭐ para guardar."
              : "Nenhum hino encontrado."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visible.map((h) => {
              const fav = isFavorite(h.language, h.number);
              return (
                <div
                  key={`${h.language}-${h.number}`}
                  className="group relative rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-all"
                >
                  <Link
                    to="/hino/$language/$number"
                    params={{ language: h.language, number: h.number }}
                    className="p-4 pr-12 flex items-start gap-3"
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFav(h.language, h.number);
                    }}
                    aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    aria-pressed={fav}
                    className="absolute top-2 right-2 h-9 w-9 grid place-items-center rounded-md hover:bg-accent transition-colors"
                  >
                    <Star className={`h-4 w-4 ${fav ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Hinário Evangélico — Igreja Evangélica Congregacional em Angola (6ª edição)
      </footer>

      <InstallPrompt />
    </div>
  );
}
