const check = (ok, message) => { if (!ok) throw Error(message); };
const id = value => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(value);
export function validateProfile(profile) {
  check(profile?.schemaVersion === 1, 'Onbekend gegevensschema');
  for (const field of ['gameId', 'releaseId', 'version']) check(id(profile[field]), `Ongeldig ${field}`);
  check(typeof profile.provenance === 'string' && profile.provenance.length > 0, 'Herkomst ontbreekt');
  for (const field of ['zones', 'components']) {
    const list = profile[field];
    check(Array.isArray(list) && list.length > 0, `${field} ontbreekt`);
    check(new Set(list.map(item => item?.id)).size === list.length, `Dubbele IDs in ${field}`);
    for (const item of list) {
      check(id(item?.id) && typeof item.label === 'string', `Ongeldig item in ${field}`);
      if (field === 'zones') check(Number.isSafeInteger(item.capacity) && item.capacity > 0, 'Ongeldige capaciteit');
      else check(item.kind === 'piece', 'Niet ondersteund componenttype');
    }
  }
  check(Array.isArray(profile.dice) && profile.dice.every(n => Number.isSafeInteger(n) && n >= 2 && n <= 1000), 'Ongeldige dobbelstenen');
  // Content schemas are intentionally deferred; never silently accept unimplemented content.
  for (const field of ['cards', 'tokens', 'characters', 'scenarios']) check(Array.isArray(profile[field]) && profile[field].length === 0, `${field}: inhoud nog niet ondersteund`);
  return profile;
}
