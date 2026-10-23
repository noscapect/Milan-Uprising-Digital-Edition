import { validateProfile } from './profile.js';
export const ENGINE_VERSION = 1;
export function createSession(profile, module, mode = 'sandbox') {
  validateProfile(profile);
  if (module?.id !== profile.gameId || module.contractVersion !== 1 || !module.modes.includes(mode)) throw Error('Module or mode not supported');
  const placements = module.setup(structuredClone(profile));
  if (Object.keys(placements).length !== profile.components.length || profile.components.some(c => placements[c.id] !== null)) throw Error('Invalid starting setup');
  return { engineVersion: ENGINE_VERSION, gameId: profile.gameId, moduleVersion: module.version, packageVersion: profile.version, mode, revision: 0, placements,
    ...(profile.schemaVersion === 2 ? { faces: Object.fromEntries(profile.components.filter(c => c.faces).map(c => [c.id, c.faces[0].id])) } : {}), events: [] };
}
export function applyCommand(state, command, profile, module) {
  if (state.gameId !== profile.gameId || module.id !== state.gameId || state.moduleVersion !== module.version || state.packageVersion !== profile.version) throw Error('Session does not match the module or data');
  if (command?.expectedRevision !== state.revision) throw Error('Stale command');
  if (command.actorId !== 'local') throw Error('Unknown player');
  const payload = command.payload;
  if (!payload || typeof payload !== 'object') throw Error('Missing payload');
  const next = structuredClone(state);
  switch (command.type) {
    case 'component.place': {
      if (!Object.hasOwn(state.placements, payload.componentId)) throw Error('Unknown miniature');
      const zone = profile.zones.find(z => z.id === payload.zoneId);
      if (!zone) throw Error('Unknown zone');
      const occupancy = Object.entries(state.placements).filter(([key, value]) => key !== payload.componentId && value === zone.id).length;
      if (occupancy >= zone.capacity) throw Error('This zone is occupied');
      next.placements[payload.componentId] = zone.id;
      break;
    }
    case 'component.remove':
      if (!Object.hasOwn(state.placements, payload.componentId)) throw Error('Unknown miniature');
      next.placements[payload.componentId] = null;
      break;
    case 'component.interact':
      if (!Object.hasOwn(state.placements, payload.componentId) || !profile.zones.some(zone => zone.id === payload.zoneId) || state.placements[payload.componentId] !== payload.zoneId) throw Error('The miniature is not in this zone');
      // Generic interaction intent. The game/app decides its actual meaning.
      break;
    case 'component.flip': {
      const component = profile.components.find(c => c.id === payload.componentId);
      if (!component?.faces || !Object.hasOwn(state.faces || {}, component.id)) throw Error('This component has no reversible side');
      const currentIndex = component.faces.findIndex(face => face.id === state.faces[component.id]);
      if (currentIndex < 0) throw Error('Unknown component side');
      next.faces[component.id] = component.faces[1 - currentIndex].id;
      break;
    }
    case 'table.arrange': {
      if (!Array.isArray(payload.placements) || payload.placements.length > profile.components.length || !Array.isArray(payload.faces) || payload.faces.length > profile.components.length) throw Error('Invalid table setup');
      next.placements = Object.fromEntries(profile.components.map(c => [c.id, null]));
      if (next.faces) next.faces = Object.fromEntries(profile.components.filter(c => c.faces).map(c => [c.id, c.faces[0].id]));
      const placed = new Set(), faced = new Set(), occupancy = new Map();
      for (const item of payload.placements) {
        if (!Object.hasOwn(next.placements, item?.componentId) || placed.has(item.componentId)) throw Error('Unknown or duplicate component in setup');
        const zone = profile.zones.find(z => z.id === item.zoneId);
        if (!zone) throw Error('Unknown setup zone');
        const count = (occupancy.get(zone.id) || 0) + 1;
        if (count > zone.capacity) throw Error('Zone capacity exceeded in setup');
        occupancy.set(zone.id, count); placed.add(item.componentId); next.placements[item.componentId] = zone.id;
      }
      for (const item of payload.faces) {
        const component = profile.components.find(c => c.id === item?.componentId);
        if (!component?.faces?.some(face => face.id === item.faceId) || faced.has(component.id) || !Object.hasOwn(next.faces || {}, component.id)) throw Error('Invalid or duplicate token side in setup');
        faced.add(component.id); next.faces[component.id] = item.faceId;
      }
      break;
    }
    case 'dice.record':
      if (!profile.dice.includes(payload.sides) || !Number.isInteger(payload.value) || payload.value < 1 || payload.value > payload.sides) throw Error('Invalid roll');
      break;
    default: throw Error('Unknown command');
  }
  // Modules cannot mutate the real session, command or profile during validation.
  module.validate(structuredClone(state), structuredClone(command), structuredClone(profile));
  next.revision++;
  next.events.push({ sequence: next.revision, schemaVersion: 1, type: command.type, actorId: command.actorId, payload: structuredClone(payload) });
  return next;
}
