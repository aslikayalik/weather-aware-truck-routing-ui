import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Box, Card, CardActionArea, CardContent, Chip, Stack, Tooltip, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { PlannedRoute } from '@app/types/trip';
import { RISK_COLORS, RISK_LABELS, RISK_LEVELS, UNKNOWN_COLOR, formatDuration, riskColor } from './risk';

const RiskBar = ({ route }: { route: PlannedRoute }) => {
  const { t } = useTranslation();
  const { miles_by_level: miles, unknown_miles: unknown } = route.summary;
  const parts = [
    ...RISK_LEVELS.map(level => ({
      key: level,
      label: t(`planner.risk.${level}`, RISK_LABELS[level]),
      color: RISK_COLORS[level],
      miles: miles[level],
    })),
    { key: 'unknown', label: t('planner.risk.unknown', 'No forecast'), color: UNKNOWN_COLOR, miles: unknown },
  ].filter(part => part.miles > 0);
  const total = parts.reduce((sum, part) => sum + part.miles, 0) || 1;

  return (
    <Box sx={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', bgcolor: 'grey.200' }}>
      {parts.map(part => (
        <Tooltip key={part.key} title={`${part.label}: ${Math.round(part.miles)} mi`}>
          <Box sx={{ width: `${(part.miles / total) * 100}%`, bgcolor: part.color }} />
        </Tooltip>
      ))}
    </Box>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography variant="caption" color="text.secondary" noWrap component="div">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600} noWrap>
      {value}
    </Typography>
  </Box>
);

interface RouteCardsProps {
  routes: PlannedRoute[];
  selectedId: number;
  onSelect: (id: number) => void;
}

const RouteCards = ({ routes, selectedId, onSelect }: RouteCardsProps) => {
  const { t } = useTranslation();
  const ordered = [...routes].sort((a, b) => a.rank - b.rank);

  return (
    <Stack spacing={1.5}>
      {ordered.map(route => {
        const { summary } = route;
        const selected = route.id === selectedId;
        return (
          <Card
            key={route.id}
            variant="outlined"
            sx={{ borderColor: selected ? 'primary.main' : undefined, borderWidth: selected ? 2 : 1, transition: 'border-color .15s' }}
          >
            <CardActionArea onClick={() => onSelect(route.id)}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Typography fontWeight={700} noWrap sx={{ flex: 1, minWidth: 0 }} title={route.label}>
                    #{route.rank} {route.label}
                  </Typography>
                  {route.recommended && (
                    <Chip size="small" color="success" icon={<StarIcon />} label={t('planner.routes.recommended', 'Recommended')} />
                  )}
                </Stack>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 1 }}>
                  <Stat
                    label={t('planner.routes.distance', 'Distance')}
                    value={`${Math.round(route.distance_miles).toLocaleString()} mi`}
                  />
                  <Stat label={t('planner.routes.duration', 'Drive time')} value={formatDuration(route.duration_seconds)} />
                  <Stat label={t('planner.routes.arrival', 'Arrival')} value={dayjs(route.arrival_time).format('ddd HH:mm')} />
                  <Stat
                    label={t('planner.routes.severe', 'Severe+ mi')}
                    value={String(Math.round(summary.miles_by_level.severe + summary.miles_by_level.no_travel))}
                  />
                  <Stat label={t('planner.routes.high', 'High mi')} value={String(Math.round(summary.miles_by_level.high))} />
                  <Stat label={t('planner.routes.avgRisk', 'Avg risk')} value={`${summary.average_risk.toFixed(2)} / 4`} />
                </Box>
                <RiskBar route={route} />
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('planner.routes.worst', 'Worst')}:
                  </Typography>
                  <Chip
                    size="small"
                    label={summary.max_level ? t(`planner.risk.${summary.max_level}`, RISK_LABELS[summary.max_level]) : '—'}
                    sx={{ bgcolor: riskColor(summary.max_level), color: '#fff', height: 20 }}
                  />
                  {summary.miles_by_level.no_travel > 0 && (
                    <Typography variant="caption" color="error" fontWeight={600}>
                      {t('planner.routes.noTravelWarning', '{{miles}} mi of No Travel conditions', {
                        miles: Math.round(summary.miles_by_level.no_travel),
                      })}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        );
      })}
    </Stack>
  );
};

export default RouteCards;
