// Absolute, app-directed counts. No faction AI or phase rules are computed here.
export function buildInfluenceArrangement(profile, state, updates) {
  if (profile.gameId !== 'milan-uprising' || !Array.isArray(updates) || !updates.length || updates.length > 90) throw Error('Geef invloedseindstanden op.');
  const groups = { anarchs: 'anarch-cubes', camarilla: 'camarilla-cubes', ambrose: 'ambrose-cubes' };
  const seen = new Set();
  for (const update of updates) {
    const key = `${update?.zoneId}:${update?.faction}`;
    if (!profile.zones.some(z => z.id === update?.zoneId && z.area === 'city') || !Object.hasOwn(groups, update?.faction) ||
        !Number.isInteger(update.count) || update.count < 0 || update.count > 3 || seen.has(key)) throw Error('Ongeldige of dubbele invloedseindstand.');
    seen.add(key);
  }
  const placements = { ...state.placements };
  // Release excess cubes first, so every increase can use the returned stock.
  for (const { zoneId, faction, count } of updates) {
    const existing = profile.components.filter(c => c.groupId === groups[faction] && placements[c.id] === zoneId);
    for (const cube of existing.slice(count)) placements[cube.id] = null;
  }
  for (const { zoneId, faction, count } of updates) {
    const pool = profile.components.filter(c => c.groupId === groups[faction]);
    const present = pool.filter(c => placements[c.id] === zoneId).length;
    const free = pool.filter(c => !placements[c.id]);
    if (free.length < count - present) throw Error('Onvoldoende vrije invloedskubussen.');
    for (const cube of free.slice(0, count - present)) placements[cube.id] = zoneId;
  }
  return {
    changed: Object.keys(placements).some(id => placements[id] !== state.placements[id]),
    placements: Object.entries(placements).filter(([, zoneId]) => zoneId).map(([componentId, zoneId]) => ({ componentId, zoneId })),
    faces: Object.entries(state.faces || {}).map(([componentId, faceId]) => ({ componentId, faceId }))
  };
}
