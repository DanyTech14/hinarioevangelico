import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Voltar ao topo"
      className="fixed bottom-5 left-5 z-40 h-12 w-12 rounded-full bg-card/90 backdrop-blur border border-border shadow-lg grid place-items-center text-primary hover:bg-card transition-colors"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
