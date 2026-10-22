// Manual transcription of an app-directed arrangement, not an official start preset.
export function buildCampaignArrangement(profile, input) {
  if (profile.gameId !== 'milan-uprising' || profile.campaignSetup?.version !== 1) throw Error('Dit profiel ondersteunt geen campagne-opstelling');
  const placements = [], faces = [], used = new Set();
  const components = new Map(profile.components.map(c => [c.id, c]));
  const zones = new Map(profile.zones.map(z => [z.id, z]));
  const place = (componentId, zoneId, groups) => {
    const component = components.get(componentId);
    if (!component || !groups.includes(component.groupId)) throw Error('Onjuist onderdeel voor deze opstelling');
    if (!zones.has(zoneId)) throw Error('Kies een geldige startlocatie');
    if (used.has(componentId)) throw Error('Een onderdeel kan maar één keer in de opstelling voorkomen');
    used.add(componentId); placements.push({ componentId, zoneId });
  };
  if (!Array.isArray(input?.characters) || input.characters.length !== 4) throw Error('Kies precies vier verschillende personages met een startlocatie');
  for (const item of input.characters) place(item?.componentId, item?.zoneId, ['characters']);
  if (!Array.isArray(input.locations) || !Array.isArray(input.otherPieces)) throw Error('Locatiegegevens ontbreken');
  const cubeGroups = { anarchs: 'anarch-cubes', camarilla: 'camarilla-cubes', ambrose: 'ambrose-cubes' };
  const cubePools = Object.fromEntries(Object.entries(cubeGroups).map(([faction, group]) => [faction, profile.components.filter(c => c.groupId === group)]));
  const cubeUsed = { anarchs: 0, camarilla: 0, ambrose: 0 };
  const investigation = profile.components.filter(c => c.groupId === 'investigation');
  const controls = [], seenZones = new Set(); let investigationUsed = 0;
  for (const location of input.locations) {
    if (zones.get(location?.zoneId)?.area !== 'city' || seenZones.has(location.zoneId)) throw Error('Onbekend of dubbel stadsdistrict');
    seenZones.add(location.zoneId);
    if (!location.influence || typeof location.restricted !== 'boolean') throw Error('Ongeldige locatiegegevens');
    for (const faction of Object.keys(cubeGroups)) {
      const count = location.influence[faction];
      if (!Number.isInteger(count) || count < 0 || count > 3) throw Error('Vul per factie 0 tot 3 invloedskubussen in');
      for (let i = 0; i < count; i++) {
        const cube = cubePools[faction][cubeUsed[faction]++];
        if (!cube) throw Error('Niet genoeg invloedskubussen in de retailvoorraad');
        place(cube.id, location.zoneId, [cubeGroups[faction]]);
      }
    }
    if (!['none', ...Object.keys(cubeGroups)].includes(location.control)) throw Error('Onbekende controlerende factie');
    if (location.control !== 'none') controls.push({ zoneId: location.zoneId, faction: location.control });
    if (location.restricted) {
      const token = investigation[investigationUsed++];
      if (!token) throw Error('Niet genoeg onderzoek/afgesloten-locatiefiches');
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
  for (let index = 0; index < controls.length; index++) if (!assign(index, new Set())) throw Error('Deze verdeling past niet op de beschikbare controlefiches');
  for (const [componentId, index] of matched) {
    place(componentId, controls[index].zoneId, ['control']); faces.push({ componentId, faceId: controls[index].faction });
  }
  for (const item of input.otherPieces) place(item?.componentId, item?.zoneId, ['allies', 'ghouls', 'npcs']);
  if (input.masqueradeZoneId) {
    if (zones.get(input.masqueradeZoneId)?.area !== 'city') throw Error('Kies een stadsdistrict voor het Masquerade-fiche');
    const token = profile.components.find(c => c.groupId === 'masquerade');
    if (!token) throw Error('Masquerade-fiche ontbreekt');
    place(token.id, input.masqueradeZoneId, ['masquerade']);
  }
  return { placements, faces };
}
