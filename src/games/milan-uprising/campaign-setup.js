// Manual transcription of an app-directed arrangement, not an official start preset.
export function buildCampaignArrangement(profile, input) {
  if (profile.gameId !== 'milan-uprising' || profile.campaignSetup?.version !== 1) throw Error('This profile does not support campaign setup');
  const placements = [], faces = [], used = new Set();
  const components = new Map(profile.components.map(c => [c.id, c]));
  const zones = new Map(profile.zones.map(z => [z.id, z]));
  const place = (componentId, zoneId, groups) => {
    const component = components.get(componentId);
    if (!component || !groups.includes(component.groupId)) throw Error('Incorrect component for this setup');
    if (!zones.has(zoneId)) throw Error('Choose a valid starting location');
    if (used.has(componentId)) throw Error('A component can only appear once in the setup');
    used.add(componentId); placements.push({ componentId, zoneId });
  };
  if (!Array.isArray(input?.characters) || input.characters.length !== 4) throw Error('Choose exactly four different characters and their starting locations');
  for (const item of input.characters) place(item?.componentId, item?.zoneId, ['characters']);
  if (!Array.isArray(input.locations) || !Array.isArray(input.otherPieces)) throw Error('Missing location data');
  const cubeGroups = { anarchs: 'anarch-cubes', camarilla: 'camarilla-cubes', ambrose: 'ambrose-cubes' };
  const cubePools = Object.fromEntries(Object.entries(cubeGroups).map(([faction, group]) => [faction, profile.components.filter(c => c.groupId === group)]));
  const cubeUsed = { anarchs: 0, camarilla: 0, ambrose: 0 };
  const investigation = profile.components.filter(c => c.groupId === 'investigation');
  const controls = [], seenZones = new Set(); let investigationUsed = 0;
  for (const location of input.locations) {
    if (zones.get(location?.zoneId)?.area !== 'city' || seenZones.has(location.zoneId)) throw Error('Unknown or duplicate city district');
    seenZones.add(location.zoneId);
    if (!location.influence || typeof location.restricted !== 'boolean') throw Error('Invalid location data');
    for (const faction of Object.keys(cubeGroups)) {
      const count = location.influence[faction];
      if (!Number.isInteger(count) || count < 0 || count > 3) throw Error('Enter zero to three Influence cubes per faction');
      for (let i = 0; i < count; i++) {
        const cube = cubePools[faction][cubeUsed[faction]++];
        if (!cube) throw Error('Not enough Influence cubes in retail stock');
        place(cube.id, location.zoneId, [cubeGroups[faction]]);
      }
    }
    if (!['none', ...Object.keys(cubeGroups)].includes(location.control)) throw Error('Unknown controlling faction');
    if (location.control !== 'none') controls.push({ zoneId: location.zoneId, faction: location.control });
    if (location.restricted) {
      const token = investigation[investigationUsed++];
      if (!token) throw Error('Not enough Investigation/Restricted location tokens');
      place(token.id, location.zoneId, ['investigation']); faces.push({ componentId: token.id, faceId: 'restricted' });
    }
  }
  // Match double-sided tokens to all requested factions. A greedy allocation could
  // consume an Anarch/Camarilla token that a later Camarilla location needs.
  const tokens = profile.components.filter(c => c.groupId === 'control');
  const matched = new Map();
  function assign(index, visited) {
    for (const token of tokens) {
      if (visited.has(token.id) || !token.faces.some(face => face.id === controls[index].faction)) continue;
      visited.add(token.id);
      if (!matched.has(token.id) || assign(matched.get(token.id), visited)) { matched.set(token.id, index); return true; }
    }
    return false;
  }
  for (let index = 0; index < controls.length; index++) if (!assign(index, new Set())) throw Error('This distribution cannot be represented by the available Control tokens');
  for (const [componentId, index] of matched) {
    place(componentId, controls[index].zoneId, ['control']); faces.push({ componentId, faceId: controls[index].faction });
  }
  for (const item of input.otherPieces) place(item?.componentId, item?.zoneId, ['allies', 'ghouls', 'npcs']);
  if (input.masqueradeZoneId) {
    if (zones.get(input.masqueradeZoneId)?.area !== 'city') throw Error('Choose a city district for the Masquerade token');
    const token = profile.components.find(c => c.groupId === 'masquerade');
    if (!token) throw Error('Missing Masquerade token');
    place(token.id, input.masqueradeZoneId, ['masquerade']);
  }
  return { placements, faces };
}
