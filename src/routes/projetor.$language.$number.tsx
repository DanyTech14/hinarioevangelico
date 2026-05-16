import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X, Maximize, Type, Palette } from "lucide-react";
import { findHymn, HYMNS } from "@/lib/hymns";
import { parseStanzas } from "./hino.$language.$number";

export const Route = createFileRoute("/projetor/$language/$number")({
  loader: ({ params }) => {
    const hymn = findHymn(params.language, params.number);
    if (!hymn) throw notFound();
    return { hymn };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData?.hymn ? `Projetor — ${loaderData.hymn.title}` : "Projetor" }],
  }),
  component: ProjectorPage,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center bg-black text-white">
      <Link to="/" className="underline">
        Voltar
      </Link>
    </div>
  ),
});

type Slide = { kind: "title" | "verse" | "chorus"; number?: string | null; lines: string[] };

const THEMES = [
  { bg: "#000000", fg: "#ffffff", muted: "#9ca3af" },
  { bg: "#0c1424", fg: "#f8fafc", muted: "#94a3b8" },
  { bg: "#1a0a14", fg: "#fef3c7", muted: "#fbbf24" },
  { bg: "#f8f5ee", fg: "#0a0a0a", muted: "#52525b" },
];

function ProjectorPage() {
  const { hymn } = Route.useLoaderData();
  const navigate = useNavigate();

  const slides = useMemo<Slide[]>(() => {
    const stanzas = parseStanzas(hymn.body);
    return [
      { kind: "title", lines: [hymn.title] },
      ...stanzas.map((s) => ({ kind: s.kind, number: s.number, lines: s.lines })),
    ];
  }, [hymn]);

  const [idx, setIdx] = useState(0);
  const [theme, setTheme] = useState(0);
  const [scale, setScale] = useState(1);
  const [chromeVisible, setChromeVisible] = useState(true);

  const total = slides.length;
  const next = useCallback(() => setIdx((i) => Math.min(total - 1, i + 1)), [total]);
  const prev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);

  // Auto-hide chrome
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const show = () => {
      setChromeVisible(true);
      clearTimeout(t);
      t = setTimeout(() => setChromeVisible(false), 2500);
    };
    show();
    window.addEventListener("mousemove", show);
    window.addEventListener("touchstart", show);
    return () => {
      clearTimeout(t);
      window.removeEventListener("mousemove", show);
      window.removeEventListener("touchstart", show);
    };
  }, []);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown" || e.key === "ArrowDown") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp" || e.key === "ArrowUp") {
        e.preventDefault();
        prev();
      } else if (e.key === "Home") setIdx(0);
      else if (e.key === "End") setIdx(total - 1);
      else if (e.key === "Escape") {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        else navigate({ to: "/hino/$language/$number", params: { language: hymn.language, number: hymn.number } });
      } else if (e.key.toLowerCase() === "f") toggleFullscreen();
      else if (e.key.toLowerCase() === "t") setTheme((t) => (t + 1) % THEMES.length);
      else if (e.key === "+" || e.key === "=") setScale((s) => Math.min(2, s + 0.1));
      else if (e.key === "-") setScale((s) => Math.max(0.5, s - 0.1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, total, navigate, hymn.language, hymn.number]);

  const t = THEMES[theme];
  const slide = slides[idx];

  // Auto-fit font size based on content length
  const baseSize = useMemo(() => {
    if (slide.kind === "title") return 9;
    const totalChars = slide.lines.join(" ").length;
    if (totalChars > 320) return 3.2;
    if (totalChars > 220) return 4;
    if (totalChars > 140) return 5;
    if (totalChars > 80) return 6;
    return 7;
  }, [slide]);

  const sameLang = useMemo(() => HYMNS.filter((h) => h.language === hymn.language), [hymn.language]);
  const hymnIdx = sameLang.findIndex((h) => h.number === hymn.number);
  const prevHymn = hymnIdx > 0 ? sameLang[hymnIdx - 1] : null;
  const nextHymn = hymnIdx >= 0 && hymnIdx < sameLang.length - 1 ? sameLang[hymnIdx + 1] : null;

  return (
    <div
      className="fixed inset-0 select-none overflow-hidden"
      style={{ backgroundColor: t.bg, color: t.fg }}
      onClick={(e) => {
        // Click left third = prev, right two-thirds = next
        const w = window.innerWidth;
        if (e.clientX < w / 3) prev();
        else next();
      }}
    >
      {/* Slide content */}
      <div className="h-full w-full grid place-items-center px-[6vw] py-[8vh] text-center">
        <div
          className="font-display leading-[1.25] text-balance"
          style={{ fontSize: `${baseSize * scale}vw` }}
        >
          {slide.kind === "title" ? (
            <div>
              <div
                className="font-semibold mb-[0.4em] opacity-90"
                style={{ fontSize: `${baseSize * 1.2 * scale}vw`, color: t.muted }}
              >
                {hymn.number}
              </div>
              <div className="italic">{hymn.title}</div>
              {hymn.category && (
                <div
                  className="mt-[0.6em] uppercase tracking-[0.3em]"
                  style={{ fontSize: `${1.5 * scale}vw`, color: t.muted }}
                >
                  {hymn.category} · {hymn.language}
                </div>
              )}
            </div>
          ) : (
            <div>
              {slide.number && (
                <div
                  className="mb-[0.5em] font-semibold"
                  style={{ fontSize: `${baseSize * 0.55 * scale}vw`, color: t.muted }}
                >
                  Estrofe {slide.number}
                </div>
              )}
              {slide.lines.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top chrome */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 transition-opacity duration-300"
        style={{ opacity: chromeVisible ? 1 : 0, pointerEvents: chromeVisible ? "auto" : "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <Link
            to="/hino/$language/$number"
            params={{ language: hymn.language, number: hymn.number }}
            className="h-10 w-10 rounded-full grid place-items-center backdrop-blur"
            style={{ backgroundColor: `${t.fg}22`, color: t.fg }}
            aria-label="Sair do projetor"
          >
            <X className="h-5 w-5" />
          </Link>
          <div className="text-sm opacity-70 px-2" style={{ color: t.muted }}>
            Hino {hymn.number} · {idx + 1}/{total}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
            className="h-10 w-10 rounded-full grid place-items-center backdrop-blur text-sm"
            style={{ backgroundColor: `${t.fg}22`, color: t.fg }}
            aria-label="Diminuir"
          >
            A−
          </button>
          <button
            onClick={() => setScale((s) => Math.min(2, s + 0.1))}
            className="h-10 w-10 rounded-full grid place-items-center backdrop-blur text-sm"
            style={{ backgroundColor: `${t.fg}22`, color: t.fg }}
            aria-label="Aumentar"
          >
            A+
          </button>
          <button
            onClick={() => setTheme((i) => (i + 1) % THEMES.length)}
            className="h-10 w-10 rounded-full grid place-items-center backdrop-blur"
            style={{ backgroundColor: `${t.fg}22`, color: t.fg }}
            aria-label="Mudar tema"
          >
            <Palette className="h-4 w-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="h-10 w-10 rounded-full grid place-items-center backdrop-blur"
            style={{ backgroundColor: `${t.fg}22`, color: t.fg }}
            aria-label="Ecrã inteiro"
          >
            <Maximize className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bottom chrome: progress + nav */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 pb-4 transition-opacity duration-300"
        style={{ opacity: chromeVisible ? 1 : 0, pointerEvents: chromeVisible ? "auto" : "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 w-full rounded-full overflow-hidden mb-3" style={{ backgroundColor: `${t.fg}22` }}>
          <div
            className="h-full transition-all"
            style={{ width: `${((idx + 1) / total) * 100}%`, backgroundColor: t.fg }}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={prev}
            disabled={idx === 0}
            className="h-12 w-12 rounded-full grid place-items-center backdrop-blur disabled:opacity-20"
            style={{ backgroundColor: `${t.fg}22`, color: t.fg }}
            aria-label="Anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2 text-xs" style={{ color: t.muted }}>
            <Type className="h-3 w-3" />
            <span>← → para navegar · F ecrã inteiro · T tema · Esc sair</span>
          </div>
          <button
            onClick={next}
            disabled={idx === total - 1}
            className="h-12 w-12 rounded-full grid place-items-center backdrop-blur disabled:opacity-20"
            style={{ backgroundColor: `${t.fg}22`, color: t.fg }}
            aria-label="Próximo"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
        {/* End-of-hymn navigation to neighbours */}
        {idx === total - 1 && (nextHymn || prevHymn) && (
          <div className="mt-3 flex justify-center gap-3">
            {prevHymn && (
              <Link
                to="/projetor/$language/$number"
                params={{ language: prevHymn.language, number: prevHymn.number }}
                onClick={() => setIdx(0)}
                className="text-xs px-3 py-1.5 rounded-full backdrop-blur"
                style={{ backgroundColor: `${t.fg}1a`, color: t.muted }}
              >
                ← {prevHymn.number}. {prevHymn.title}
              </Link>
            )}
            {nextHymn && (
              <Link
                to="/projetor/$language/$number"
                params={{ language: nextHymn.language, number: nextHymn.number }}
                onClick={() => setIdx(0)}
                className="text-xs px-3 py-1.5 rounded-full backdrop-blur"
                style={{ backgroundColor: `${t.fg}1a`, color: t.muted }}
              >
                {nextHymn.number}. {nextHymn.title} →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function toggleFullscreen() {
  if (typeof document === "undefined") return;
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.().catch(() => {});
  }
}

