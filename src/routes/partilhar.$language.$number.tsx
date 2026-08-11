import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Download, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { findHymn, shareHymn } from "@/lib/hymns";
import { parseStanzas } from "@/lib/stanzas";

export const Route = createFileRoute("/partilhar/$language/$number")({
  loader: ({ params }) => {
    const hymn = findHymn(params.language, params.number);
    if (!hymn) throw notFound();
    return { hymn };
  },
  head: ({ loaderData }) => {
    const h = loaderData?.hymn;
    const title = h ? `Partilhar hino ${h.number} — ${h.title}` : "Partilhar hino";
    const description = h
      ? `Crie uma imagem bonita do hino ${h.number} (${h.language}) para partilhar no WhatsApp.`
      : "Crie uma imagem do hino para partilhar.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: SharePage,
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

type ThemeKey = "areia" | "noite" | "salvia";

const THEMES: Record<
  ThemeKey,
  { label: string; bg: string; bg2: string; fg: string; soft: string; accent: string }
> = {
  areia: {
    label: "Areia",
    bg: "#faf8f5",
    bg2: "#efe7da",
    fg: "#4a3f31",
    soft: "#8b7355",
    accent: "#8b7355",
  },
  noite: {
    label: "Noite",
    bg: "#171412",
    bg2: "#221d17",
    fg: "#f2ece2",
    soft: "#c9a84c",
    accent: "#c9a84c",
  },
  salvia: {
    label: "Sálvia",
    bg: "#f2f5f0",
    bg2: "#dfe8db",
    fg: "#33402f",
    soft: "#5e7d59",
    accent: "#5e7d59",
  },
};

const W = 1080;
const H = 1350;

function SharePage() {
  const { hymn } = Route.useLoaderData();
  const navigate = useNavigate();
  const stanzas = useMemo(() => parseStanzas(hymn.body), [hymn.body]);
  const [theme, setTheme] = useState<ThemeKey>("areia");
  const [selected, setSelected] = useState<number[]>(() => [0]);
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const toggle = (i: number) =>
    setSelected((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i].sort((a, b) => a - b)));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const t = THEMES[theme];

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, t.bg);
    grad.addColorStop(1, t.bg2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // moldura
    ctx.strokeStyle = t.accent + "55";
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 48, W - 96, H - 96);

    const M = 110;
    let y = 176;

    ctx.textAlign = "center";
    ctx.fillStyle = t.soft;
    ctx.font = "500 26px Karla, system-ui, sans-serif";
    ctx.fillText(hymn.language.toUpperCase(), W / 2, y);
    y += 66;

    ctx.fillStyle = t.accent;
    ctx.font = "600 96px 'Cormorant Garamond', Georgia, serif";
    ctx.fillText(hymn.number, W / 2, y);
    y += 70;

    ctx.fillStyle = t.fg;
    ctx.font = "600 46px 'Cormorant Garamond', Georgia, serif";
    for (const line of wrap(ctx, hymn.title, W - M * 2)) {
      ctx.fillText(line, W / 2, y);
      y += 56;
    }
    y += 24;

    ctx.strokeStyle = t.accent + "66";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 60, y);
    ctx.lineTo(W / 2 + 60, y);
    ctx.stroke();
    y += 60;

    const picked = selected.length ? selected : [0];
    const blocks = picked
      .map((i) => stanzas[i])
      .filter(Boolean)
      .map((st) => ({ chorus: st.kind === "chorus", lines: st.lines }));

    // ajuste automático do tamanho da letra
    const available = H - y - 150;
    let size = 44;
    let laid: { text: string; chorus: boolean; gap: boolean }[] = [];
    for (; size >= 22; size -= 2) {
      laid = [];
      for (const b of blocks) {
        if (b.chorus) laid.push({ text: "CORO", chorus: true, gap: false });
        for (const l of b.lines) {
          ctx.font = `${b.chorus ? "italic " : ""}400 ${size}px 'Cormorant Garamond', Georgia, serif`;
          for (const w of wrap(ctx, l, W - M * 2)) laid.push({ text: w, chorus: b.chorus, gap: false });
        }
        laid.push({ text: "", chorus: false, gap: true });
      }
      if (laid.length * (size * 1.45) <= available) break;
    }

    const lh = size * 1.45;
    for (const item of laid) {
      if (item.gap) {
        y += lh * 0.6;
        continue;
      }
      if (item.text === "CORO" && item.chorus) {
        ctx.fillStyle = t.accent;
        ctx.font = `600 ${Math.round(size * 0.52)}px Karla, system-ui, sans-serif`;
        ctx.fillText("C O R O", W / 2, y);
        y += lh * 0.9;
        continue;
      }
      ctx.fillStyle = t.fg;
      ctx.font = `${item.chorus ? "italic " : ""}400 ${size}px 'Cormorant Garamond', Georgia, serif`;
      ctx.fillText(item.text, W / 2, y);
      y += lh;
    }

    ctx.fillStyle = t.soft;
    ctx.font = "500 24px Karla, system-ui, sans-serif";
    ctx.fillText("Hinário Evangélico", W / 2, H - 96);

    setUrl(canvas.toDataURL("image/png"));
  }, [hymn, stanzas, selected, theme]);

  const download = () => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `hino-${hymn.number}-${hymn.language}.png`;
    a.click();
  };

  const shareImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/png"));
    const file = blob ? new File([blob], `hino-${hymn.number}.png`, { type: "image/png" }) : null;
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (file && nav.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Hino ${hymn.number} — ${hymn.title}`,
        });
        return;
      } catch {
        /* utilizador cancelou */
      }
    }
    download();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="mx-auto max-w-5xl px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 rounded-xl"
            onClick={() =>
              navigate({
                to: "/hino/$language/$number",
                params: { language: hymn.language, number: hymn.number },
              })
            }
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <p className="font-display text-lg truncate">Partilhar</p>
          <span className="w-16" />
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-6 space-y-6">
        <div className="rounded-2xl border border-border bg-card p-3">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="w-full h-auto rounded-xl shadow-sm"
          />
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Estilo</p>
          <div className="flex gap-2">
            {(Object.keys(THEMES) as ThemeKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setTheme(k)}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm transition-colors ${
                  theme === k
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border hover:bg-secondary"
                }`}
              >
                {THEMES[k].label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Estrofes a incluir
          </p>
          <div className="grid gap-2">
            {stanzas.map((st, i) => {
              const on = selected.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => toggle(i)}
                  className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                    on ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"
                  }`}
                >
                  <span
                    className={`mt-0.5 h-5 w-5 shrink-0 rounded-md border grid place-items-center ${
                      on ? "bg-primary border-primary text-primary-foreground" : "border-border"
                    }`}
                  >
                    {on && <Check className="h-3.5 w-3.5" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {st.kind === "chorus" ? "Coro" : `Estrofe ${st.number ?? i + 1}`}
                    </span>
                    <span className="block font-display truncate">{st.lines[0]}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={shareImage} className="gap-2 rounded-xl">
            <Share2 className="h-4 w-4" /> Partilhar imagem
          </Button>
          <Button variant="outline" onClick={download} className="gap-2 rounded-xl">
            <Download className="h-4 w-4" /> Guardar
          </Button>
        </div>
        {copied && (
          <p className="text-xs text-muted-foreground text-center">
            Imagem guardada — anexe-a no WhatsApp.
          </p>
        )}
        <Button
          variant="ghost"
          onClick={() => shareHymn(hymn)}
          className="w-full rounded-xl text-muted-foreground"
        >
          Partilhar como texto
        </Button>
      </main>
    </div>
  );
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > max && line) {
      out.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) out.push(line);
  return out.length ? out : [""];
}
