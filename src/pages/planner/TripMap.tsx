import React, { memo, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import L from 'leaflet';
import { CircleMarker, MapContainer, Pane, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';
import './planner.scss';
import { Checkpoint, PlannedRoute, TripPlan } from '@app/types/trip';
import HeatmapLayer from './HeatmapLayer';
import { HeatMetric, RISK_LABELS, formatDuration, riskColor } from './risk';

const US_CENTER: L.LatLngTuple = [39.5, -98.35];
const ROUTE_GRAY = '#546e7a';
// Routes often share their middle; label each one at a different point along it.
const LABEL_POSITIONS = [0.5, 0.3, 0.7];

const labelPosition = (route: PlannedRoute) =>
  route.path[Math.floor((route.path.length - 1) * LABEL_POSITIONS[(route.rank - 1) % LABEL_POSITIONS.length])];

const CheckpointDetails = ({ checkpoint, routeLabel }: { checkpoint: Checkpoint; routeLabel: string }) => {
  const { t } = useTranslation();
  const { weather, risk } = checkpoint;
  return (
    <div style={{ minWidth: 170 }}>
      <strong>{routeLabel}</strong>
      <div>
        {t('planner.checkpoints.mile', 'Mile')} {Math.round(checkpoint.mile)} · ETA {dayjs(checkpoint.eta).format('ddd HH:mm')}
      </div>
      {weather ? (
        <div>
          {t('planner.checkpoints.wind', 'Wind')} {Math.round(weather.wind_mph)} mph ({t('planner.checkpoints.gust', 'gust')}{' '}
          {Math.round(weather.gust_mph)}) · {t('planner.checkpoints.rain', 'Rain')} {weather.rain_in_hr.toFixed(2)} in/h ·{' '}
          {t('planner.checkpoints.snow', 'Snow')} {weather.snow_in_hr.toFixed(2)} in/h
        </div>
      ) : (
        <div>{t('planner.risk.unknown', 'No forecast')}</div>
      )}
      {risk && (
        <div style={{ color: riskColor(risk.level), fontWeight: 700 }}>
          {t(`planner.risk.${risk.level}`, RISK_LABELS[risk.level])}
          {risk.drivers.length > 0 && ` (${risk.drivers.join(', ')})`}
          {risk.load_adjusted && ` · ${t('planner.checkpoints.loadAdjusted', 'Raised by the load-weight wind rule')}`}
        </div>
      )}
    </div>
  );
};

const FitToRoutes = ({ routes }: { routes: PlannedRoute[] }) => {
  const map = useMap();
  useEffect(() => {
    const points = routes.flatMap(route => route.path);
    if (points.length) map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
  }, [map, routes]);
  return null;
};

const FlyToCheckpoint = ({ checkpoint }: { checkpoint: Checkpoint | null }) => {
  const map = useMap();
  useEffect(() => {
    if (checkpoint) map.flyTo([checkpoint.lat, checkpoint.lon], Math.max(map.getZoom(), 9), { duration: 0.6 });
  }, [map, checkpoint]);
  return null;
};

interface RouteLayersProps {
  routes: PlannedRoute[];
  selectedId: number;
  onSelect: (id: number) => void;
}

/** Memoised so scrubbing the heatmap slider never re-renders the route geometry. */
const RouteLayers = memo(({ routes, selectedId, onSelect }: RouteLayersProps) => {
  const { t } = useTranslation();
  const selected = routes.find(route => route.id === selectedId);
  const others = routes.filter(route => route.id !== selectedId);

  const routeTooltip = (route: PlannedRoute) =>
    `#${route.rank}${route.recommended ? ' ★' : ''} · ${formatDuration(route.duration_seconds)} · ${Math.round(route.distance_miles)} mi`;

  return (
    <>
      <Pane name="otherRoutes" style={{ zIndex: 410 }}>
        {others.map(route => (
          <React.Fragment key={route.id}>
            <Polyline
              positions={route.path}
              pathOptions={{ color: ROUTE_GRAY, weight: 5, opacity: 0.75 }}
              eventHandlers={{ click: () => onSelect(route.id) }}
            />
            {route.checkpoints.map(cp => (
              <CircleMarker
                key={cp.mile}
                center={[cp.lat, cp.lon]}
                radius={3}
                pathOptions={{ color: '#fff', weight: 1, fillColor: riskColor(cp.risk?.level), fillOpacity: 0.9 }}
                eventHandlers={{ click: () => onSelect(route.id) }}
              >
                <Tooltip pane="tooltipPane">
                  <CheckpointDetails checkpoint={cp} routeLabel={`#${route.rank} ${route.label}`} />
                </Tooltip>
              </CircleMarker>
            ))}
          </React.Fragment>
        ))}
      </Pane>
      {selected && (
        <Pane name="selectedRoute" style={{ zIndex: 420 }}>
          <Polyline positions={selected.path} pathOptions={{ color: '#fff', weight: 11, opacity: 0.95 }} />
          {selected.segments.map(segment => (
            <Polyline
              key={segment.from_mile}
              positions={segment.path}
              pathOptions={{ color: riskColor(segment.level), weight: 6, opacity: 1, lineCap: 'butt' }}
            />
          ))}
          {selected.checkpoints.map(cp => (
            <CircleMarker
              key={cp.mile}
              center={[cp.lat, cp.lon]}
              radius={6}
              pathOptions={{ color: '#fff', weight: 2, fillColor: riskColor(cp.risk?.level), fillOpacity: 1 }}
            >
              <Tooltip pane="tooltipPane">
                <CheckpointDetails checkpoint={cp} routeLabel={`#${selected.rank} ${selected.label}`} />
              </Tooltip>
            </CircleMarker>
          ))}
        </Pane>
      )}
      {routes.map(route => (
        // Invisible anchor: react-leaflet v4 tooltips need a parent layer. Keyed by the
        // selection because Leaflet never updates a tooltip's className after creation.
        <CircleMarker
          key={`${route.id}-${route.id === selectedId}`}
          center={labelPosition(route)}
          radius={0}
          pathOptions={{ opacity: 0, fillOpacity: 0 }}
          interactive={false}
        >
          <Tooltip
            permanent
            direction="center"
            pane="tooltipPane"
            className={route.id === selectedId ? 'route-label route-label--selected' : 'route-label'}
          >
            {routeTooltip(route)}
          </Tooltip>
        </CircleMarker>
      ))}
      <Pane name="endpoints" style={{ zIndex: 430 }}>
        {routes[0] && (
          <>
            <CircleMarker
              center={routes[0].path[0]}
              radius={9}
              pathOptions={{ color: '#fff', weight: 3, fillColor: '#1565c0', fillOpacity: 1 }}
            >
              <Tooltip pane="tooltipPane">{t('planner.form.origin', 'Origin')}</Tooltip>
            </CircleMarker>
            <CircleMarker
              center={routes[0].path[routes[0].path.length - 1]}
              radius={9}
              pathOptions={{ color: '#fff', weight: 3, fillColor: '#212121', fillOpacity: 1 }}
            >
              <Tooltip pane="tooltipPane">{t('planner.form.destination', 'Destination')}</Tooltip>
            </CircleMarker>
          </>
        )}
      </Pane>
    </>
  );
});
RouteLayers.displayName = 'RouteLayers';

interface TripMapProps {
  plan: TripPlan | null;
  selectedId: number;
  onSelect: (id: number) => void;
  heatmapVisible: boolean;
  hour: number;
  metric: HeatMetric;
  focusedCheckpoint: Checkpoint | null;
}

const TripMap = ({ plan, selectedId, onSelect, heatmapVisible, hour, metric, focusedCheckpoint }: TripMapProps) => {
  const routes = useMemo(() => plan?.routes ?? [], [plan]);

  return (
    <MapContainer center={US_CENTER} zoom={4} preferCanvas style={{ height: '100%', width: '100%' }} worldCopyJump>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      {plan && heatmapVisible && <HeatmapLayer heatmap={plan.heatmap} hour={hour} metric={metric} />}
      <RouteLayers routes={routes} selectedId={selectedId} onSelect={onSelect} />
      <FitToRoutes routes={routes} />
      <FlyToCheckpoint checkpoint={focusedCheckpoint} />
    </MapContainer>
  );
};

export default TripMap;
