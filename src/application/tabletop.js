import { createSession, applyCommand } from '../engine/session.js';
export function createTabletop({ profile, module, random }) {
  profile = structuredClone(profile);
  let state = createSession(profile, module);
  let past = [], future = [];
  const listeners = new Set();
  const notify = () => {
    for (const listener of [...listeners]) {
      try { listener(); } catch (error) { console.error('Tafelweergave bijwerken mislukt', error); }
    }
  };
  const commit = next => {
    past.push(state);
    if (past.length > 100) past.shift();
    future = [];
    state = next; notify();
  };
  const send = (type, payload) => commit(applyCommand(state, { type, payload, actorId: 'local', expectedRevision: state.revision }, profile, module));
  return Object.freeze({
    subscribe(listener) {
      if (typeof listener !== 'function') throw Error('Invalid table observer');
      listeners.add(listener); return () => listeners.delete(listener);
    },
    place: (componentId, zoneId) => send('component.place', { componentId, zoneId }),
    remove: componentId => send('component.remove', { componentId }),
    interact: (componentId, zoneId) => send('component.interact', { componentId, zoneId }),
    flip: componentId => send('component.flip', { componentId }),
    arrange: arrangement => send('table.arrange', arrangement),
    roll(sides) { const value = random(sides); send('dice.record', { sides, value }); return value; },
    reset() { commit(createSession(profile, module)); },
    undo() {
      if (!past.length) throw Error('No action to undo');
      future.push(state); state = past.pop(); notify();
    },
    redo() {
      if (!future.length) throw Error('No action to redo');
      past.push(state); state = future.pop(); notify();
    },
    restoreSession(saved) {
      if (saved?.format !== 'tabletop-session' || saved.schemaVersion !== 1) throw Error('Unknown session format');
      if (saved.inputSimulation) throw Error('Sensor studies cannot be resumed yet; use a manual-table export');
      if (saved.module?.id !== module.id || saved.module.version !== module.version ||
          saved.package?.gameId !== profile.gameId || saved.package.releaseId !== profile.releaseId || saved.package.version !== profile.version) throw Error('Session belongs to another table profile or version');
      const imported = saved.state;
      if (!Array.isArray(imported?.events) || imported.events.length > 10000) throw Error('Invalid or oversized activity log');
      let replay = createSession(profile, module);
      for (const event of imported.events) {
        if (event?.sequence !== replay.revision + 1 || event.schemaVersion !== 1) throw Error('Invalid event sequence or version');
        replay = applyCommand(replay, { type: event.type, actorId: event.actorId, payload: event.payload, expectedRevision: replay.revision }, profile, module);
      }
      // Compare JSON objects independent of property order; only commit after complete replay.
      const equivalent = (a, b) => {
        if (a === b) return true;
        if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
        const keys = Object.keys(a);
        return keys.length === Object.keys(b).length && keys.every(key => Object.hasOwn(b, key) && equivalent(a[key], b[key]));
      };
      if (!equivalent(replay, imported)) throw Error('Session state does not match the activity log');
      state = replay;
      past = []; future = []; notify();
    },
    snapshot: () => structuredClone(state),
    project() {
      const components = profile.components.map(component => {
        const face = component.faces?.find(face => face.id === state.faces?.[component.id]);
        return { ...component, ...(face ? { faceId: face.id, faceLabel: face.label, color: face.color || component.color } : {}) };
      });
      return structuredClone({ mode: state.mode, revision: state.revision, canUndo: past.length > 0, canRedo: future.length > 0, components, dice: profile.dice, presentation: profile.presentation,
        componentGroups: profile.componentGroups || [], sources: profile.sources || [], title: profile.title || '', contentNote: profile.contentNote || '',
        zones: profile.zones.map(zone => ({ id: zone.id, label: zone.label, capacity: zone.capacity, area: zone.area, attributes: zone.attributes || [], occupants: components.filter(c => state.placements[c.id] === zone.id) })), events: state.events });
    },
    exportSession: () => ({ format: 'tabletop-session', schemaVersion: 1, module: { id: module.id, version: module.version }, package: { gameId: profile.gameId, releaseId: profile.releaseId, version: profile.version }, state: structuredClone(state) })
  });
}
