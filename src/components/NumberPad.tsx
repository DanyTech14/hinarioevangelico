import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Delete, Hash, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { findHymn } from "@/lib/hymns";

type Props = {
  language: string;
  onPick?: (n: string) => void;
};

export function NumberPad({ language, onPick }: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  const lang = language === "Todos" ? "Português" : language;
  const match = value ? findHymn(lang, value) : undefined;

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

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="rounded-full shrink-0 gap-1.5"
      >
        <Hash className="h-3.5 w-3.5" />
        Teclado
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl border border-border bg-card p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">
                Número do hino — <span className="text-foreground">{lang}</span>
              </p>
              <button
                type="button"
                aria-label="Fechar"
                onClick={() => setOpen(false)}
                className="h-8 w-8 grid place-items-center rounded-md hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl border-2 border-border bg-background px-4 py-3 text-center">
              <div className="font-display text-4xl font-semibold tabular-nums min-h-[2.5rem]">
                {value || "—"}
              </div>
              <p className="text-xs mt-1 truncate text-muted-foreground">
                {value
                  ? match
                    ? match.title
                    : "Não encontrado"
                  : "Digite o número"}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                <Button
                  key={d}
                  variant="secondary"
                  onClick={() => {
                    press(d);
                    onPick?.(value + d);
                  }}
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
