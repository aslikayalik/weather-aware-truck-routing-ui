import React, { useCallback, useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Alert, Box, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { usePlanTripMutation } from '@services/routingApi';
import { Checkpoint, TripPlan, TripPlanRequest } from '@app/types/trip';
import TripForm from './TripForm';
import RouteCards from './RouteCards';
import CheckpointTable from './CheckpointTable';
import TripMap from './TripMap';
import HeatmapControls from './HeatmapControls';
import { HeatMetric, RISK_COLORS, RISK_LABELS, RISK_LEVELS, UNKNOWN_COLOR } from './risk';

const flattenMessages = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(flattenMessages);
  if (value && typeof value === 'object') return Object.values(value).flatMap(flattenMessages);
  return [];
};

const errorMessage = (error: unknown, t: TFunction) => {
  const { status, data } = (error ?? {}) as FetchBaseQueryError;
  // Only JSON bodies carry a message meant for users; HTML error pages are ignored.
  if (data && typeof data === 'object') {
    const detail = (data as Record<string, unknown>).detail;
    if (detail) return String(detail);
    const messages = flattenMessages(data);
    if (messages.length) return messages.join(' ');
  }
  const code = status === 'PARSING_ERROR' ? (error as { originalStatus?: number }).originalStatus : status;
  if (code === 'FETCH_ERROR') {
    return t('planner.errors.network', 'Could not reach the server. Check your connection and try again.');
  }
  if (code === 'TIMEOUT_ERROR' || code === 504) {
    return t('planner.errors.timeout', 'The server took too long to respond. Please try again.');
  }
  if (typeof code === 'number' && code >= 500) {
    return t('planner.errors.server', 'The server ran into a problem while planning this trip. Please try again in a moment.');
  }
  return t('planner.errors.generic', 'Could not plan the trip. Please try again.');
};

/** Hour on the forecast slider that matches the departure time, clamped to its range. */
const departureHour = (plan: TripPlan) => {
  const hours = Math.round(dayjs(plan.departure_time).diff(dayjs(plan.heatmap.start), 'hour', true));
  return Math.min(Math.max(hours, 0), plan.heatmap.hours);
};

const RiskLegend = () => {
  const { t } = useTranslation();
  return (
    <Paper elevation={2} sx={{ px: 1.25, py: 0.75 }}>
      {RISK_LEVELS.map(level => (
        <Stack key={level} direction="row" alignItems="center" spacing={0.75}>
          <Box sx={{ width: 14, height: 4, borderRadius: 2, bgcolor: RISK_COLORS[level] }} />
          <Typography variant="caption">{t(`planner.risk.${level}`, RISK_LABELS[level])}</Typography>
        </Stack>
      ))}
      <Stack direction="row" alignItems="center" spacing={0.75}>
        <Box sx={{ width: 14, height: 4, borderRadius: 2, bgcolor: UNKNOWN_COLOR }} />
        <Typography variant="caption">{t('planner.risk.unknown', 'No forecast')}</Typography>
      </Stack>
    </Paper>
  );
};

const PlannerPage = () => {
  const { t } = useTranslation();
  const [planTrip, { isLoading }] = usePlanTripMutation();
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState(0);
  const [hour, setHour] = useState(0);
  const [metric, setMetric] = useState<HeatMetric>('risk');
  const [heatmapVisible, setHeatmapVisible] = useState(true);
  const [focusedCheckpoint, setFocusedCheckpoint] = useState<Checkpoint | null>(null);

  const handleSubmit = useCallback(
    async (request: TripPlanRequest) => {
      setError(null);
      try {
        const result = await planTrip(request).unwrap();
        setPlan(result);
        setSelectedId(result.recommended_route_id);
        setHour(departureHour(result));
        setFocusedCheckpoint(null);
      } catch (err) {
        setError(errorMessage(err, t));
      }
    },
    [planTrip, t],
  );

  const selectedRoute = plan?.routes.find(route => route.id === selectedId);
  const recommended = plan?.routes.find(route => route.recommended);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        height: { md: 'calc(100vh - 112px)' },
      }}
    >
      <Paper variant="outlined" sx={{ width: { md: 420 }, flexShrink: 0, p: 2, overflowY: 'auto' }}>
        <Typography variant="h6" fontWeight={700}>
          {t('planner.title', 'Weather-Aware Truck Routing')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('planner.subtitle', 'Compare three truck routes by weather risk at each checkpoint’s arrival time.')}
        </Typography>

        <TripForm loading={isLoading} hasPlan={Boolean(plan)} onSubmit={handleSubmit} />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {plan && recommended && (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Alert severity="success" icon={<StarIcon fontSize="inherit" />}>
              <strong>
                {t('planner.routes.recommendedRoute', 'Recommended')}: #{recommended.rank} {recommended.label}
              </strong>
              <div>{plan.recommendation_reason}</div>
            </Alert>
            <RouteCards routes={plan.routes} selectedId={selectedId} onSelect={setSelectedId} />
            {selectedRoute && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {t('planner.checkpoints.title', 'Checkpoints every {{miles}} mi', { miles: plan.checkpoint_interval_miles })} — #
                  {selectedRoute.rank} {selectedRoute.label}
                </Typography>
                <CheckpointTable checkpoints={selectedRoute.checkpoints} onFocus={setFocusedCheckpoint} />
              </Box>
            )}
          </Stack>
        )}
      </Paper>

      <Box
        sx={{
          flex: 1,
          position: 'relative',
          minHeight: { xs: 520, md: 0 },
          borderRadius: 1,
          overflow: 'hidden',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <TripMap
          plan={plan}
          selectedId={selectedId}
          onSelect={setSelectedId}
          heatmapVisible={heatmapVisible}
          hour={hour}
          metric={metric}
          focusedCheckpoint={focusedCheckpoint}
        />
        {isLoading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }} />}
        {plan && (
          <>
            <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1000 }}>
              <RiskLegend />
            </Box>
            <Box sx={{ position: 'absolute', left: 12, right: 12, bottom: 24, zIndex: 1000, maxWidth: 760, mx: 'auto' }}>
              <HeatmapControls
                heatmap={plan.heatmap}
                departureTime={plan.departure_time}
                hour={hour}
                onHourChange={setHour}
                metric={metric}
                onMetricChange={setMetric}
                visible={heatmapVisible}
                onVisibleChange={setHeatmapVisible}
              />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default PlannerPage;
