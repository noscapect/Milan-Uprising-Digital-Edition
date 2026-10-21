import { validateProfile } from './profile.js';
export const ENGINE_VERSION = 1;
export function createSession(profile, module, mode = 'sandbox') {
  validateProfile(profile);
  if (module?.id !== profile.gameId || module.contractVersion !== 1 || !module.modes.includes(mode)) throw Error('Module of modus niet ondersteund');
  const placements = module.setup(structuredClone(profile));
  if (Object.keys(placements).length !== profile.components.length || profile.components.some(c => placements[c.id] !== null)) throw Error('Ongeldige beginopstelling');
  return { engineVersion: ENGINE_VERSION, gameId: profile.gameId, moduleVersion: module.version, packageVersion: profile.version, mode, revision: 0, placements, events: [] };
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
