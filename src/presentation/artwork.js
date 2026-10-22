// Images decorate a projection only; session data and engine remain artwork-free.
export function withArtwork(view, catalog, { locationArtwork = true } = {}) {
  const url = id => {
    const value = catalog?.assets?.[id];
    return typeof value === 'string' && /^\/local-artwork\/[a-z0-9-]+\.png$/.test(value) ? value : null;
  };
  const decorate = component => ({ ...component,
    icon: url(catalog?.faces?.[component.faceId]) || url(catalog?.components?.[component.id]?.icon) || url(catalog?.groups?.[component.groupId]),
    portrait: url(catalog?.components?.[component.id]?.detail)
  });
  return { ...view, components:view.components.map(decorate),
    zones:view.zones.map(zone => ({ ...zone, background:locationArtwork ? url(catalog?.zones?.[zone.id]?.background) : null, occupants:zone.occupants.map(decorate) })) };
}
export function artworkImage(url, className = '') {
  const image = document.createElement('img'); image.src = url; image.alt = ''; image.className = className;
  image.loading = 'lazy'; image.onerror = () => image.remove(); return image;
}
