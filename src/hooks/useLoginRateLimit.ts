// Client-side rate limiting pentru pagini de login
// Blochează 60 de secunde după 5 încercări eșuate consecutive

const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 60_000; // 60 secunde

function getKey(page: string) {
  return `dc_login_rl_${page}`;
}

interface RateLimitState {
  attempts: number;
  blockedUntil: number | null;
}

function load(page: string): RateLimitState {
  try {
    const raw = sessionStorage.getItem(getKey(page));
    if (raw) return JSON.parse(raw);
  } catch {}
  return { attempts: 0, blockedUntil: null };
}

function save(page: string, state: RateLimitState) {
  try {
    sessionStorage.setItem(getKey(page), JSON.stringify(state));
  } catch {}
}

export function useLoginRateLimit(page: "student" | "creator") {
  function isBlocked(): { blocked: boolean; secondsLeft: number } {
    const state = load(page);
    if (state.blockedUntil && Date.now() < state.blockedUntil) {
      return {
        blocked: true,
        secondsLeft: Math.ceil((state.blockedUntil - Date.now()) / 1000),
      };
    }
    return { blocked: false, secondsLeft: 0 };
  }

  function recordFailure(): { blocked: boolean; secondsLeft: number } {
    const state = load(page);
    // Reset if previous block expired
    if (state.blockedUntil && Date.now() >= state.blockedUntil) {
      state.attempts = 0;
      state.blockedUntil = null;
    }
    state.attempts += 1;
    if (state.attempts >= MAX_ATTEMPTS) {
      state.blockedUntil = Date.now() + COOLDOWN_MS;
    }
    save(page, state);
    return isBlocked();
  }

  function recordSuccess() {
    save(page, { attempts: 0, blockedUntil: null });
  }

  return { isBlocked, recordFailure, recordSuccess };
}
