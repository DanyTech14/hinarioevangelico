import { useEffect, useState, useCallback } from "react";

const KEY = "hymn-favorites";

export type FavoriteId = string; // `${language}::${number}`

export function favId(language: string, number: string): FavoriteId {
  return `${language}::${number}`;
}

function read(): FavoriteId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(ids: FavoriteId[]) {
  localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent("favorites-changed"));
}

export function useFavorites() {
  const [ids, setIds] = useState<FavoriteId[]>(() => read());

  useEffect(() => {
    const sync = () => setIds(read());
    window.addEventListener("favorites-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("favorites-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((language: string, number: string) => {
    const id = favId(language, number);
    const current = read();
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    write(next);
    setIds(next);
  }, []);

  const isFavorite = useCallback(
    (language: string, number: string) => ids.includes(favId(language, number)),
    [ids],
  );

  return { ids, toggle, isFavorite };
}
