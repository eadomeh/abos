import { useEffect, useState } from 'react';

function currentMatch(query: string): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(query).matches;
}

/** Live result of a CSS media query (for example "(min-width: 768px)"). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => currentMatch(query));

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    if (typeof list.addEventListener === 'function') {
      list.addEventListener('change', update);
      return () => list.removeEventListener('change', update);
    }
    list.addListener(update);
    return () => list.removeListener(update);
  }, [query]);

  return matches;
}
