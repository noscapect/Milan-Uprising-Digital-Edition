const check = (ok, message) => { if (!ok) throw Error(message); };
const id = value => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(value);
export function validateProfile(profile) {
  check([1, 2].includes(profile?.schemaVersion), 'Onbekend gegevensschema');
  for (const field of ['gameId', 'releaseId', 'version']) check(id(profile[field]), `Ongeldig ${field}`);
  check(typeof profile.provenance === 'string' && profile.provenance.length > 0, 'Herkomst ontbreekt');
  for (const field of ['zones', 'components']) {
    const list = profile[field];
    check(Array.isArray(list) && list.length > 0, `${field} ontbreekt`);
    check(new Set(list.map(item => item?.id)).size === list.length, `Dubbele IDs in ${field}`);
    for (const item of list) {
      check(id(item?.id) && typeof item.label === 'string', `Ongeldig item in ${field}`);
      if (field === 'zones') check(Number.isSafeInteger(item.capacity) && item.capacity > 0, 'Ongeldige capaciteit');
      else {
        check(['piece', 'token', 'cube'].includes(item.kind), 'Niet ondersteund componenttype');
        if (item.faces !== undefined) {
          check(profile.schemaVersion === 2 && Array.isArray(item.faces) && item.faces.length === 2, 'Ongeldige componentzijden');
          check(new Set(item.faces.map(face => face?.id)).size === 2, 'Dubbele componentzijden');
          for (const face of item.faces) {
            check(id(face?.id) && typeof face.label === 'string', 'Ongeldige componentzijde');
            if (face.color !== undefined) check(/^#[0-9a-fA-F]{6}$/.test(face.color), 'Ongeldige kleur');
          }
        }
        if (item.color !== undefined) check(/^#[0-9a-fA-F]{6}$/.test(item.color), 'Ongeldige kleur');
      }
    }
  }
  if (profile.schemaVersion === 2) {
    check(Array.isArray(profile.sources) && profile.sources.length > 0, 'Bronnen ontbreken');
    check(new Set(profile.sources.map(source => source?.id)).size === profile.sources.length, 'Dubbele bronnen');
    for (const source of profile.sources) check(id(source?.id) && typeof source.title === 'string' && typeof source.url === 'string' && source.url.startsWith('https://') && !/\s/.test(source.url), 'Ongeldige bron');
    check(Array.isArray(profile.componentGroups) && profile.componentGroups.length > 0, 'Onderdeelgroepen ontbreken');
    check(new Set(profile.componentGroups.map(group => group?.id)).size === profile.componentGroups.length, 'Dubbele onderdeelgroepen');
    for (const group of profile.componentGroups) check(id(group?.id) && typeof group.label === 'string', 'Ongeldige onderdeelgroep');
    for (const component of profile.components) {
      check(profile.componentGroups.some(group => group.id === component.groupId), 'Onbekende onderdeelgroep');
      check(profile.sources.some(source => source.id === component.sourceId), 'Onbekende componentbron');
    }
  }
  check(Array.isArray(profile.dice) && profile.dice.every(n => Number.isSafeInteger(n) && n >= 2 && n <= 1000), 'Ongeldige dobbelstenen');
  // Content schemas are intentionally deferred; never silently accept unimplemented content.
  for (const field of ['cards', 'tokens', 'characters', 'scenarios']) check(Array.isArray(profile[field]) && profile[field].length === 0, `${field}: inhoud nog niet ondersteund`);
  return profile;
}
