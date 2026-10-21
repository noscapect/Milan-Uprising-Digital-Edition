export function cryptoDie(sides) {
  if (!Number.isInteger(sides) || sides < 2 || sides > 1000) throw Error('Ongeldig dobbelsteentype');
  const buffer = new Uint32Array(1), limit = Math.floor(2 ** 32 / sides) * sides;
  do { globalThis.crypto.getRandomValues(buffer); } while (buffer[0] >= limit);
  return buffer[0] % sides + 1;
}
