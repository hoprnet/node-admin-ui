/*
 * The connected node of this browser tab. Kept in sessionStorage (cleared when
 * the tab closes) so a reload reconnects without the API token sitting in the
 * URL, the browser history or shared links.
 */

const KEY = 'admin-ui-session';

type Session = { apiEndpoint: string; apiToken: string };

export const saveSession = (session: Session) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(session));
  } catch (e) {
    // storage unavailable: the session simply won't survive a reload
  }
};

export const loadSession = (): Session | null => {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return typeof session?.apiEndpoint === 'string'
      ? { apiEndpoint: session.apiEndpoint, apiToken: session.apiToken ?? '' }
      : null;
  } catch (e) {
    return null;
  }
};

export const clearSession = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch (e) {
    // nothing to clear
  }
};
