import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import { TripHeatmap } from '@app/types/trip';
import { HeatMetric, heatColor, heatIndex, heatOpacity } from './risk';

export const HEATMAP_PANE = 'heatmap';

interface HeatmapLayerProps {
  heatmap: TripHeatmap;
  hour: number;
  metric: HeatMetric;
}

/**
 * Forecast grid drawn as canvas rectangles in a blurred pane, so it reads as a smooth
 * heatmap while every cell still shows its own value (no additive blending like a
 * point-density heatmap). Cells are created once per plan; moving the time slider only
 * restyles them, which keeps scrubbing smooth.
 */
const HeatmapLayer = ({ heatmap, hour, metric }: HeatmapLayerProps) => {
  const map = useMap();
  const cellsRef = useRef<L.Rectangle[]>([]);

  useEffect(() => {
    const pane = map.getPane(HEATMAP_PANE) ?? map.createPane(HEATMAP_PANE);
    pane.style.zIndex = '350';
    pane.style.pointerEvents = 'none';
    // Blur by about half a cell at the current zoom so neighbouring cells blend
    // smoothly instead of showing as blocks.
    const updateBlur = () => {
      const center = map.getCenter();
      const a = map.latLngToLayerPoint(center);
      const b = map.latLngToLayerPoint([center.lat, center.lng + heatmap.cell_size_degrees]);
      const cellPx = Math.abs(b.x - a.x);
      pane.style.filter = `blur(${Math.min(Math.max(cellPx * 0.5, 4), 40).toFixed(0)}px)`;
    };
    updateBlur();
    map.on('zoomend', updateBlur);

    const renderer = L.canvas({ pane: HEATMAP_PANE, padding: 0.5 });
    const half = heatmap.cell_size_degrees / 2;
    const group = L.layerGroup().addTo(map);
    cellsRef.current = heatmap.points.map(([lat, lon]) =>
      L.rectangle(
        [
          [lat - half, lon - half],
          [lat + half, lon + half],
        ],
        { renderer, pane: HEATMAP_PANE, stroke: false, fillOpacity: 0, interactive: false },
      ).addTo(group),
    );
    return () => {
      map.off('zoomend', updateBlur);
      group.remove();
      cellsRef.current = [];
    };
  }, [map, heatmap]);

  useEffect(() => {
    cellsRef.current.forEach((cell, i) => {
      const index = heatIndex(heatmap, metric, i, hour);
      cell.setStyle({ fillColor: heatColor(index), fillOpacity: heatOpacity(index) });
    });
  }, [heatmap, hour, metric]);

  return null;
};

export default HeatmapLayer;
