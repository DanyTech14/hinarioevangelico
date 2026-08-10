import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, BookOpen, Music, Star, ScrollText, Shuffle, Languages } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InstallPrompt } from "@/components/InstallPrompt";
import { NumberPad } from "@/components/NumberPad";
import { ScrollTopButton } from "@/components/ScrollTopButton";
import { HYMNS, LANGUAGES, searchHymns, randomHymn, lyricSnippet } from "@/lib/hymns";
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

const ORDER = ["Todos", "Português", "Umbundu", "Adicionais (PT/Umbundu)"];

function orderedLanguages() {
  const rest = LANGUAGES.filter((l) => !ORDER.includes(l)).sort((a, b) => a.localeCompare(b));
  return [...ORDER.filter((l) => LANGUAGES.includes(l) || l === "Todos"), ...rest];
}

function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState<string>("Todos");
  const [onlyFavs, setOnlyFavs] = useState(false);
  const { ids: favIds, isFavorite, toggle: toggleFav } = useFavorites();

  const openRandom = () => {
    const h = randomHymn(lang);
    navigate({
      to: "/hino/$language/$number",
      params: { language: h.language, number: h.number },
    });
  };


  const results = useMemo(() => {
    const base = searchHymns(query, lang);
    if (!onlyFavs) return base;
    const set = new Set(favIds);
    return base.filter((h) => set.has(favId(h.language, h.number)));
  }, [query, lang, onlyFavs, favIds]);
  const visible = results.slice(0, 200);

  const langs = useMemo(orderedLanguages, []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center shadow-sm">
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

      <section className="mx-auto max-w-5xl px-4 pt-10 sm:pt-16 pb-8 sm:pb-10 text-center">
        <p className="uppercase tracking-[0.22em] sm:tracking-[0.28em] text-[10px] sm:text-xs text-muted-foreground font-semibold mb-4">
          Hinário Evangélico Completo
        </p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] sm:leading-[1] text-balance">
          Cante com a congregação,
          <br />
          <span className="italic text-primary">em qualquer momento do culto.</span>
        </h1>
        <p className="mt-5 sm:mt-6 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2 leading-relaxed">
          {HYMNS.length} hinos em {LANGUAGES.length} línguas. Pesquise por número, título ou letra
          e cante em ecrã grande, com tipografia legível mesmo em luz baixa.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full gap-2 px-4">
            <Link to="/liturgia">
              <ScrollText className="h-4 w-4" />
              Litanias, Salmos e Invocatórias
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openRandom}
            className="rounded-full gap-2 px-4"
          >
            <Shuffle className="h-4 w-4" />
            Hino aleatório
          </Button>
        </div>


        <div className="mt-8 sm:mt-10 max-w-2xl mx-auto space-y-5">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Procurar: número, título ou letra…"
              inputMode="search"
              enterKeyHint="search"
              className="h-12 sm:h-14 pl-12 pr-12 text-base sm:text-lg rounded-2xl border-2 bg-card shadow-sm transition-shadow focus-visible:ring-2 focus-visible:ring-primary focus-visible:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_12%,transparent)]"
            />
          </div>

          <div className="-mx-4 px-4 overflow-x-auto sm:overflow-visible scrollbar-none">
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
              {langs.map((l) => (
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

      <section className="mx-auto max-w-5xl px-4 pb-28">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 mb-5 sm:flex sm:flex-wrap sm:justify-between sm:gap-4">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold flex items-center gap-2 min-w-0">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
            <span className="truncate">
              {query ? `${results.length} resultado(s)` : `Hinos em ${lang}`}
            </span>
          </h2>
          {results.length > visible.length && (
            <p className="text-sm text-muted-foreground shrink-0">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {visible.map((h) => {
              const fav = isFavorite(h.language, h.number);
              const flat = h.body.replace(/\s+/g, " ").trim();
              const snippet = lyricSnippet(h.body, query);
              const preview = snippet ?? flat.slice(0, 60) + (flat.length > 60 ? "…" : "");
              return (
                <div
                  key={`${h.language}-${h.number}`}
                  className="group relative rounded-2xl border border-border bg-card hover:border-primary transition-colors cursor-pointer"
                >
                  <Link
                    to="/hino/$language/$number"
                    params={{ language: h.language, number: h.number }}
                    className="p-4 flex items-start gap-4"
                  >
                    <span className="font-display text-2xl font-semibold text-primary/40 group-hover:text-primary transition-colors shrink-0 w-10">
                      {h.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate flex items-center gap-1.5">
                        <Languages className="h-3 w-3 shrink-0 text-primary/70" />
                        <span className="truncate">
                          {h.language}
                          {h.category ? ` · ${h.category}` : ""}
                        </span>
                      </p>
                      <p className="font-display text-lg leading-snug truncate">{h.title}</p>
                      <p
                        className={`text-xs line-clamp-2 italic mt-0.5 ${snippet ? "text-foreground/80" : "text-muted-foreground line-clamp-1"}`}
                      >
                        {preview}
                      </p>
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
                    className="absolute top-2 right-2 h-9 w-9 grid place-items-center rounded-lg hover:bg-accent transition-colors"
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

      <div className="fixed bottom-5 right-5 z-40">
        <NumberPad language={lang} />
      </div>
    </div>
  );
}
