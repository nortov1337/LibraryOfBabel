import { useEffect } from 'react';
import { useLibrary } from '../state/LibraryContext';

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

/** Global keyboard shortcuts. Never breaks typing in inputs. */
export function useHotkeys(): void {
  const {
    random,
    prev,
    next,
    saveBookmark,
    copyText,
    focusSearch,
    setPaletteOpen,
    paletteOpen,
  } = useLibrary();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const typing = isTypingTarget(event.target);
      const mod = event.ctrlKey || event.metaKey;

      if (mod && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(!paletteOpen);
        return;
      }

      if (typing) return;

      if (mod && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveBookmark();
        return;
      }

      if (mod && event.key.toLowerCase() === 'c') {
        const selection = window.getSelection();
        if (!selection || selection.toString().length === 0) {
          event.preventDefault();
          copyText();
        }
        return;
      }

      if (event.key === '/') {
        event.preventDefault();
        focusSearch();
        return;
      }

      if (event.key.toLowerCase() === 'r' && !mod) {
        event.preventDefault();
        random();
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prev();
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        next();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [random, prev, next, saveBookmark, copyText, focusSearch, setPaletteOpen, paletteOpen]);
}
