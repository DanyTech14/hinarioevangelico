import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Minus, Plus, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { findLiturgy, liturgyToShareText, LITURGY } from "@/lib/liturgy";

export const Route = createFileRoute("/liturgia/$id")({
  head: ({ params }) => {
    const item = findLiturgy(params.id);
    const title = item ? `${item.title} — Hinário Evangélico` : "Texto litúrgico";
    const description = item
      ? `${item.title}: texto litúrgico para leitura em conjunto durante o culto.`
      : "Texto litúrgico para o culto.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: item?.title ?? "Texto litúrgico" },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  loader: ({ params }) => {
    const item = findLiturgy(params.id);
    if (!item) throw notFound();
    return item;
  },
  component: LiturgyDetail,
});

function LiturgyDetail() {
  const item = Route.useLoaderData();
  const [size, setSize] = useState(20);

  const index = LITURGY.findIndex((i) => i.id === item.id);
  const prev = index > 0 ? LITURGY[index - 1] : undefined;
  const next = index < LITURGY.length - 1 ? LITURGY[index + 1] : undefined;

  const share = () => {
    const text = liturgyToShareText(item);
    const nav = typeof navigator !== "undefined" ? navigator : undefined;
    if (nav && typeof nav.share === "function") {
      nav.share({ title: item.title, text }).catch(() => openWhats(text));
    } else {
      openWhats(text);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between gap-3">
          <Link
            to="/liturgia"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Litanias
          </Link>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setSize((s) => Math.max(14, s - 2))} aria-label="Diminuir texto">
              <Minus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setSize((s) => Math.min(56, s + 2))} aria-label="Aumentar texto">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={share} aria-label="Partilhar">
              <Share2 className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold mb-6">{item.title}</h1>
        <div className="space-y-4" style={{ fontSize: size, lineHeight: 1.65 }}>
          {item.body.split("\n\n").map((block: string, i: number) => {
            const m = block.match(/^(Dirigente|Congregação|Todos|Ministro)\s*:\s*([\s\S]*)$/);
            if (m) {
              const isCong = m[1] === "Congregação" || m[1] === "Todos";
              return (
                <p
                  key={i}
                  className={
                    isCong
                      ? "rounded-md border-l-4 border-primary bg-secondary/50 pl-4 pr-3 py-2 font-medium"
                      : "pl-1"
                  }
                >
                  <span className="uppercase tracking-wide text-[0.7em] font-semibold text-primary block mb-1">
                    {m[1]}
                  </span>
                  {m[2]}
                </p>
              );
            }
            return (
              <p key={i} className="whitespace-pre-line">
                {block}
              </p>
            );
          })}
        </div>

        <nav className="mt-12 flex items-center justify-between gap-3 border-t border-border pt-6">
          {prev ? (
            <Link to="/liturgia/$id" params={{ id: prev.id }} className="text-sm text-muted-foreground hover:text-foreground max-w-[45%] truncate">
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to="/liturgia/$id" params={{ id: next.id }} className="text-sm text-muted-foreground hover:text-foreground max-w-[45%] truncate text-right">
              {next.title} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
    </div>
  );
}

function openWhats(text: string) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
}
