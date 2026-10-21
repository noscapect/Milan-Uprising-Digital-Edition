// Local behavioural simulation only. No BLE, RFID, Teburu payloads or app connection.
export function createVirtualCore(tabletop, sensorMap) {
  const scene = tabletop.project();
  const zones = new Set(scene.zones.map(zone => zone.id));
  const mappings = new Map(Object.entries(sensorMap));
  if (!mappings.size || [...mappings.values()].some(zone => !zones.has(zone))) throw Error('Ongeldige demosensormapping');
  let active = null, contact = null, trace = [];
  const record = (type, data) => trace.push({ sequence: trace.length + 1, type, ...data });
  return Object.freeze({
    capabilities: Object.freeze({ source:'local-simulation', officialAppConnected:false, ble:false, rfid:false, physicalMappingVerified:false }),
    register(componentId) {
      if (contact !== null) throw Error('Maak eerst het sensorcontact vrij');
      if (!scene.components.some(component => component.id === componentId)) throw Error('Onbekende demopion');
      active = componentId;
      record('local.identity-selected', { componentId });
    },
    touch(sensorId) {
      if (!active) throw Error('Registreer eerst de geselecteerde demopion');
      if (contact !== null) throw Error('Maak eerst het sensorcontact vrij');
      if (!mappings.has(sensorId)) throw Error('Onbekende demosensor');
      const zoneId = mappings.get(sensorId);
      // Explicit selection replaces unknown real identity/turn inference.
      if (tabletop.snapshot().placements[active] === zoneId) tabletop.interact(active, zoneId);
      else tabletop.place(active, zoneId);
      contact = sensorId;
      record('local.sensor-contact', { sensorId, componentId:active, zoneId });
    },
    release() {
      if (contact === null) return;
      record('local.sensor-release', { sensorId:contact });
      contact = null; // Releasing a sensor does NOT remove the logical miniature.
    },
    reset() { active = null; contact = null; trace = []; },
    snapshot: () => structuredClone({ source:'local-simulation', mappingVerified:false, active, contact, trace })
  });
}
