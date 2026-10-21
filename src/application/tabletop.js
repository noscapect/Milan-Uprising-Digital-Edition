import { createSession, applyCommand } from '../engine/session.js';
export function createTabletop({ profile, module, random }) {
  profile = structuredClone(profile);
  let state = createSession(profile, module);
  const send = (type, payload) => { state = applyCommand(state, { type, payload, actorId: 'local', expectedRevision: state.revision }, profile, module); };
  return Object.freeze({
    place: (componentId, zoneId) => send('component.place', { componentId, zoneId }),
    remove: componentId => send('component.remove', { componentId }),
    interact: (componentId, zoneId) => send('component.interact', { componentId, zoneId }),
    roll(sides) { const value = random(sides); send('dice.record', { sides, value }); return value; },
    reset() { state = createSession(profile, module); },
    snapshot: () => structuredClone(state),
    project() {
      return structuredClone({ mode: state.mode, revision: state.revision, components: profile.components, dice: profile.dice, presentation: profile.presentation,
        zones: profile.zones.map(zone => ({ id: zone.id, label: zone.label, occupants: profile.components.filter(c => state.placements[c.id] === zone.id) })), events: state.events });
    },
    exportSession: () => ({ format: 'tabletop-session', schemaVersion: 1, module: { id: module.id, version: module.version }, package: { gameId: profile.gameId, releaseId: profile.releaseId, version: profile.version }, state: structuredClone(state) })
  });
}
