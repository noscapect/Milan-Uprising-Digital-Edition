const check = (ok, message) => { if (!ok) throw Error(message); };
const id = value => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(value);
export function validateProfile(profile) {
  check([1, 2].includes(profile?.schemaVersion), 'Unknown data schema');
  for (const field of ['gameId', 'releaseId', 'version']) check(id(profile[field]), `Invalid ${field}`);
  check(typeof profile.provenance === 'string' && profile.provenance.length > 0, 'Missing provenance');
  for (const field of ['zones', 'components']) {
    const list = profile[field];
    check(Array.isArray(list) && list.length > 0, `Missing ${field}`);
    check(new Set(list.map(item => item?.id)).size === list.length, `Duplicate IDs in ${field}`);
    for (const item of list) {
      check(id(item?.id) && typeof item.label === 'string', `Invalid item in ${field}`);
      if (field === 'zones') {
        check(Number.isSafeInteger(item.capacity) && item.capacity > 0, 'Invalid capacity');
        if (item.area !== undefined) check(id(item.area), 'Invalid zone area');
        if (item.attributes !== undefined) check(Array.isArray(item.attributes) && item.attributes.every(id) && new Set(item.attributes).size === item.attributes.length, 'Invalid zone attributes');
      }
      else {
        check(['piece', 'token', 'cube'].includes(item.kind), 'Unsupported component type');
        if (item.faces !== undefined) {
          check(profile.schemaVersion === 2 && Array.isArray(item.faces) && item.faces.length === 2, 'Invalid component sides');
          check(new Set(item.faces.map(face => face?.id)).size === 2, 'Duplicate component sides');
          for (const face of item.faces) {
            check(id(face?.id) && typeof face.label === 'string', 'Invalid component side');
            if (face.color !== undefined) check(/^#[0-9a-fA-F]{6}$/.test(face.color), 'Invalid colour');
          }
        }
        if (item.color !== undefined) check(/^#[0-9a-fA-F]{6}$/.test(item.color), 'Invalid colour');
      }
    }
  }
  if (profile.schemaVersion === 2) {
    check(Array.isArray(profile.sources) && profile.sources.length > 0, 'Missing sources');
    check(new Set(profile.sources.map(source => source?.id)).size === profile.sources.length, 'Duplicate sources');
    for (const source of profile.sources) check(id(source?.id) && typeof source.title === 'string' && typeof source.url === 'string' && source.url.startsWith('https://') && !/\s/.test(source.url), 'Invalid source');
    check(Array.isArray(profile.componentGroups) && profile.componentGroups.length > 0, 'Missing component groups');
    check(new Set(profile.componentGroups.map(group => group?.id)).size === profile.componentGroups.length, 'Duplicate component groups');
    for (const group of profile.componentGroups) check(id(group?.id) && typeof group.label === 'string', 'Invalid component group');
    for (const component of profile.components) {
      check(profile.componentGroups.some(group => group.id === component.groupId), 'Unknown component group');
      check(profile.sources.some(source => source.id === component.sourceId), 'Unknown component source');
    }
    for (const zone of profile.zones) if (zone.sourceId !== undefined) check(profile.sources.some(source => source.id === zone.sourceId), 'Unknown zone source');
  }
  check(Array.isArray(profile.dice) && profile.dice.every(n => Number.isSafeInteger(n) && n >= 2 && n <= 1000), 'Invalid dice');
  // Content schemas are intentionally deferred; never silently accept unimplemented content.
  for (const field of ['cards', 'tokens', 'characters', 'scenarios']) check(Array.isArray(profile[field]) && profile[field].length === 0, `${field}: content not supported yet`);
  return profile;
}
