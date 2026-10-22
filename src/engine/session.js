import { validateProfile } from './profile.js';
export const ENGINE_VERSION = 1;
export function createSession(profile, module, mode = 'sandbox') {
  validateProfile(profile);
  if (module?.id !== profile.gameId || module.contractVersion !== 1 || !module.modes.includes(mode)) throw Error('Module of modus niet ondersteund');
  const placements = module.setup(structuredClone(profile));
  if (Object.keys(placements).length !== profile.components.length || profile.components.some(c => placements[c.id] !== null)) throw Error('Ongeldige beginopstelling');
  return { engineVersion: ENGINE_VERSION, gameId: profile.gameId, moduleVersion: module.version, packageVersion: profile.version, mode, revision: 0, placements,
    ...(profile.schemaVersion === 2 ? { faces: Object.fromEntries(profile.components.filter(c => c.faces).map(c => [c.id, c.faces[0].id])) } : {}), events: [] };
}
export function applyCommand(state, command, profile, module) {
  if (state.gameId !== profile.gameId || module.id !== state.gameId || state.moduleVersion !== module.version || state.packageVersion !== profile.version) throw Error('Sessie past niet bij module of gegevens');
  if (command?.expectedRevision !== state.revision) throw Error('Verouderde opdracht');
  if (command.actorId !== 'local') throw Error('Onbekende speler');
  const payload = command.payload;
  if (!payload || typeof payload !== 'object') throw Error('Payload ontbreekt');
  const next = structuredClone(state);
  switch (command.type) {
    case 'component.place': {
      if (!Object.hasOwn(state.placements, payload.componentId)) throw Error('Onbekende pion');
      const zone = profile.zones.find(z => z.id === payload.zoneId);
      if (!zone) throw Error('Onbekende zone');
      const occupancy = Object.entries(state.placements).filter(([key, value]) => key !== payload.componentId && value === zone.id).length;
      if (occupancy >= zone.capacity) throw Error('Deze zone is bezet');
      next.placements[payload.componentId] = zone.id;
      break;
    }
    case 'component.remove':
      if (!Object.hasOwn(state.placements, payload.componentId)) throw Error('Onbekende pion');
      next.placements[payload.componentId] = null;
      break;
    case 'component.interact':
      if (!Object.hasOwn(state.placements, payload.componentId) || !profile.zones.some(zone => zone.id === payload.zoneId) || state.placements[payload.componentId] !== payload.zoneId) throw Error('Pion staat niet in deze zone');
      // Generic interaction intent. The game/app decides its actual meaning.
      break;
    case 'component.flip': {
      const component = profile.components.find(c => c.id === payload.componentId);
      if (!component?.faces || !Object.hasOwn(state.faces || {}, component.id)) throw Error('Onderdeel heeft geen omkeerbare zijde');
      const currentIndex = component.faces.findIndex(face => face.id === state.faces[component.id]);
      if (currentIndex < 0) throw Error('Onbekende componentzijde');
      next.faces[component.id] = component.faces[1 - currentIndex].id;
      break;
    }
    case 'table.arrange': {
      if (!Array.isArray(payload.placements) || payload.placements.length > profile.components.length || !Array.isArray(payload.faces) || payload.faces.length > profile.components.length) throw Error('Ongeldige tafelopstelling');
      next.placements = Object.fromEntries(profile.components.map(c => [c.id, null]));
      if (next.faces) next.faces = Object.fromEntries(profile.components.filter(c => c.faces).map(c => [c.id, c.faces[0].id]));
      const placed = new Set(), faced = new Set(), occupancy = new Map();
      for (const item of payload.placements) {
        if (!Object.hasOwn(next.placements, item?.componentId) || placed.has(item.componentId)) throw Error('Onbekend of dubbel onderdeel in opstelling');
        const zone = profile.zones.find(z => z.id === item.zoneId);
        if (!zone) throw Error('Onbekende zone in opstelling');
        const count = (occupancy.get(zone.id) || 0) + 1;
        if (count > zone.capacity) throw Error('Zonecapaciteit overschreden in opstelling');
        occupancy.set(zone.id, count); placed.add(item.componentId); next.placements[item.componentId] = zone.id;
      }
      for (const item of payload.faces) {
        const component = profile.components.find(c => c.id === item?.componentId);
        if (!component?.faces?.some(face => face.id === item.faceId) || faced.has(component.id) || !Object.hasOwn(next.faces || {}, component.id)) throw Error('Ongeldige of dubbele fichezijde in opstelling');
        faced.add(component.id); next.faces[component.id] = item.faceId;
      }
      break;
    }
    case 'dice.record':
      if (!profile.dice.includes(payload.sides) || !Number.isInteger(payload.value) || payload.value < 1 || payload.value > payload.sides) throw Error('Ongeldige worp');
      break;
    default: throw Error('Onbekende opdracht');
  }
  // Modules cannot mutate the real session, command or profile during validation.
  module.validate(structuredClone(state), structuredClone(command), structuredClone(profile));
  next.revision++;
  next.events.push({ sequence: next.revision, schemaVersion: 1, type: command.type, actorId: command.actorId, payload: structuredClone(payload) });
  return next;
}
