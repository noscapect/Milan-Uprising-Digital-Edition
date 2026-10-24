// Concurrent readers share one request. After it settles, the next call is fresh.
export function createSingleFlight(read) {
  let pending = null;
  return (...args) => {
    if (!pending) pending = Promise.resolve().then(() => read(...args)).finally(() => { pending = null; });
    return pending;
  };
}
