// localStorage that cannot throw.
//
// Browsers refuse storage far more often than you'd think: Telegram's in-app
// browser (where our own bot's "back to the site" button lands students),
// private mode, blocked cookies, and a full quota all make `setItem` raise.
// An unguarded write on the login path therefore took the whole sign-in down
// -- silently at first, then as a bogus "server error".
//
// Every read/write goes through here instead. Order of preference:
//   localStorage -> sessionStorage -> in-memory
// so the worst case degrades to "session lasts until the tab closes" rather
// than "cannot log in at all".

const memory = new Map<string, string>();

function probe(store: Storage | undefined): Storage | null {
  try {
    if (!store) return null;
    const k = '__pravaon_probe__';
    store.setItem(k, '1');
    store.removeItem(k);
    return store;
  } catch {
    return null;
  }
}

let resolved: Storage | null | undefined;

function backend(): Storage | null {
  if (resolved !== undefined) return resolved;
  if (typeof window === 'undefined') {
    resolved = null;
    return resolved;
  }
  resolved = probe(window.localStorage) ?? probe(window.sessionStorage);
  return resolved;
}

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      const v = backend()?.getItem(key);
      if (v !== null && v !== undefined) return v;
    } catch {
      /* fall through to the in-memory copy */
    }
    return memory.get(key) ?? null;
  },

  setItem(key: string, value: string): void {
    // Always keep an in-memory copy first: even if the browser rejects the
    // write (quota/blocked), the value stays usable for this session.
    memory.set(key, value);
    try {
      backend()?.setItem(key, value);
    } catch {
      /* quota exceeded or storage blocked -- in-memory copy still stands */
    }
  },

  removeItem(key: string): void {
    memory.delete(key);
    try {
      backend()?.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

// True when the browser is refusing persistent storage, so the UI can warn that
// the session will not survive a reload.
export function isPersistentStorageAvailable(): boolean {
  return backend() !== null;
}
