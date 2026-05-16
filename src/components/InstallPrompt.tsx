import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "hinario-install-dismissed";

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    // Already installed?
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    if (standalone) return;

    const ua = window.navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(ua) && !/CriOS|FxiOS/i.test(ua);
    if (isIOS) {
      setIosHint(true);
      // Show iOS hint after a short delay
      const t = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(t);
    }

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    return () => window.removeEventListener("beforeinstallprompt", onBIP);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    dismiss();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-md rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-xl p-4 animate-in slide-in-from-bottom-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground grid place-items-center shrink-0">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-base font-semibold leading-tight">
            Instalar no telefone
          </p>
          {iosHint ? (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Toque em{" "}
              <Share className="inline h-3.5 w-3.5 -mt-0.5" /> Partilhar e depois em{" "}
              <span className="font-semibold">Adicionar ao Ecrã Principal</span> para usar
              offline.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Adicione o Hinário ao seu ecrã inicial para abrir rápido e cantar mesmo sem
              internet.
            </p>
          )}
          {!iosHint && (
            <Button size="sm" className="mt-3 h-8" onClick={install}>
              Instalar
            </Button>
          )}
        </div>
        <button
          onClick={dismiss}
          aria-label="Dispensar"
          className="h-8 w-8 -mt-1 -mr-1 rounded-full grid place-items-center text-muted-foreground hover:bg-secondary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
