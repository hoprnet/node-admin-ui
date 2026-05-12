type Abortable = { abort: () => void };

const pending = new Set<Abortable>();

export const trackAbortable = (p: Abortable & PromiseLike<unknown>): void => {
  pending.add(p);
  const cleanup = () => pending.delete(p);
  p.then(cleanup, cleanup);
};

export const abortAllPending = (): void => {
  pending.forEach((p) => {
    try {
      p.abort();
    } catch {
      // ignore
    }
  });
  pending.clear();
};
