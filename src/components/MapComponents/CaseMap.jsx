import { createEffect, onMount, onCleanup } from 'solid-js';
import L from 'leaflet';

export default function CaseMap(props) {
  let mapContainer;
  let mapInstance;
  let markersLayer;

  onMount(() => {
    mapInstance = L.map(mapContainer, {
      zoomControl: false,
    }).setView([20, 0], 2);

    L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(mapInstance);

    markersLayer = L.layerGroup().addTo(mapInstance);
  });

  onCleanup(() => {
    if (mapInstance) mapInstance.remove();
  });

  createEffect(() => {
    const data = props.cases();
    if (!markersLayer || !data) return;

    markersLayer.clearLayers();

    const groups = {};
    data.forEach((c) => {
      if (c.lat && c.lng) {
        const key = `${c.lat},${c.lng}`;
        if (!groups[key]) {
          groups[key] = { lat: c.lat, lng: c.lng, items: [] };
        }
        groups[key].items.push(c);
      }
    });

    Object.values(groups).forEach((group) => {
      const totalCases = group.items.reduce((sum, c) => sum + (c.case_count || 1), 0);
      const titles = group.items.map((c) => c.title || 'Unnamed').filter(Boolean);
      const description = group.items.find((c) => c.description)?.description || '';
      const latestDate = group.items
        .map((c) => c.date)
        .filter(Boolean)
        .sort()
        .pop() || '';

      const marker = L.circleMarker([group.lat, group.lng], {
        radius: Math.min(6 + Math.sqrt(totalCases) * 2, 20),
        fillColor: '#ef4444',
        color: '#dc2626',
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.6,
      });

      const titleList = titles.length > 1
        ? `<ul style="margin:4px 0 0 16px;padding:0;">${titles.map((t) => `<li>${t}</li>`).join('')}</ul>`
        : titles[0] || 'Case';

      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; min-width: 160px;">
          <strong style="font-size: 14px;">${group.items.length > 1 ? `${group.items.length} reports` : titleList}</strong>
          ${description ? `<div style="margin-top: 4px; font-size: 12px; color: #475569;">${description}</div>` : ''}
          <div style="margin-top: 6px; display: flex; gap: 12px; font-size: 12px;">
            <span>📊 <strong>${totalCases}</strong> case${totalCases > 1 ? 's' : ''}</span>
            <span>📅 ${latestDate}</span>
          </div>
        </div>
      `);
      markersLayer.addLayer(marker);
    });
  });

  return (
    <div class="bg-white border border-surface-200 rounded-2xl shadow-sm overflow-hidden">
      <div ref={mapContainer} class="w-full h-[500px] sm:h-[600px]" id="leaflet-map" />
    </div>
  );
}