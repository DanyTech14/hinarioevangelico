import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Delete, Keyboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { findHymn, LANGUAGES } from "@/lib/hymns";

type Props = {
  language: string;
};

const ORDER = ["Português", "Umbundu", "Adicionais (PT/Umbundu)"];

function orderedLanguages() {
  const rest = LANGUAGES.filter((l) => !ORDER.includes(l)).sort((a, b) =>
    a.localeCompare(b),
  );
  return [...ORDER.filter((l) => LANGUAGES.includes(l)), ...rest];
}

export function NumberPad({ language }: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [lang, setLang] = useState(
    language === "Todos" ? "Português" : language,
  );
  const navigate = useNavigate();

  const langs = useMemo(orderedLanguages, []);
  const match = value ? findHymn(lang, value) : undefined;

  // Segue o filtro escolhido na página
  useEffect(() => {
    if (language !== "Todos") setLang(language);
  }, [language]);

  const press = (d: string) => setValue((v) => (v + d).slice(0, 4));
  const go = () => {
    if (!match) return;
    setOpen(false);
    setValue("");
    navigate({
      to: "/hino/$language/$number",
      params: { language: match.language, number: match.number },
    });
  };

  // Teclado físico
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") setValue((v) => v.slice(0, -1));
      else if (e.key === "Escape") setOpen(false);
      else if (e.key === "Enter") go();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <>
      <Button
        variant="default"
        size="icon"
        onClick={() => setOpen(true)}
        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Abrir teclado numérico"
      >
        <Hash className="h-6 w-6" />
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl border border-border bg-card p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Número do hino</p>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setOpen(false)}
                className="h-8 w-8 grid place-items-center rounded-md hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="-mx-1 px-1 overflow-x-auto scrollbar-none mb-3">
              <div className="flex gap-2 w-max">
                {langs.map((l) => (
                  <Button
                    key={l}
                    size="sm"
                    variant={lang === l ? "default" : "outline"}
                    onClick={() => setLang(l)}
                    className="rounded-full shrink-0 text-xs"
                  >
                    {l}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border-2 border-border bg-background px-4 py-3 text-center">
              <div className="font-display text-4xl font-semibold tabular-nums min-h-[2.5rem]">
                {value || "—"}
              </div>
              <p className="text-xs mt-1 truncate text-muted-foreground">
                {value
                  ? match
                    ? match.title
                    : `Não existe em ${lang}`
                  : `Digite o número — ${lang}`}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                <Button
                  key={d}
                  variant="secondary"
                  onClick={() => press(d)}
                  className="h-14 text-2xl font-display"
                >
                  {d}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={() => setValue("")}
                className="h-14 text-sm"
              >
                Limpar
              </Button>
              <Button
                variant="secondary"
                onClick={() => press("0")}
                className="h-14 text-2xl font-display"
              >
                0
              </Button>
              <Button
                variant="outline"
                onClick={() => setValue((v) => v.slice(0, -1))}
                className="h-14"
                aria-label="Apagar"
              >
                <Delete className="h-5 w-5" />
              </Button>
            </div>

            <Button
              onClick={go}
              disabled={!match}
              className="mt-3 w-full h-12 text-base"
            >
              {match ? `Abrir ${match.number}. ${match.title}` : "Abrir hino"}
            </Button>

          </div>
        </div>
      )}
    </>
  );
}
