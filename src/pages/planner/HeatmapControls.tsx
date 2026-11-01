import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Box, IconButton, Paper, Slider, Stack, Switch, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { TripHeatmap } from '@app/types/trip';
import { HeatMetric, METRIC_UNITS, RISK_LABELS, RISK_LEVELS, heatColor, metricThresholds } from './risk';

const PLAY_STEP_MS = 600;
const METRICS: HeatMetric[] = ['risk', 'wind', 'rain', 'snow'];
const METRIC_LABELS: Record<HeatMetric, string> = { risk: 'Risk', wind: 'Wind', rain: 'Rain', snow: 'Snow' };

const GRADIENT = `linear-gradient(to right, ${[0, 1, 2, 3, 4].map(i => heatColor(i)).join(', ')})`;

interface HeatmapControlsProps {
  heatmap: TripHeatmap;
  departureTime: string;
  hour: number;
  onHourChange: (hour: number) => void;
  metric: HeatMetric;
  onMetricChange: (metric: HeatMetric) => void;
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
}

const HeatmapControls = ({
  heatmap,
  departureTime,
  hour,
  onHourChange,
  metric,
  onMetricChange,
  visible,
  onVisibleChange,
}: HeatmapControlsProps) => {
  const { t } = useTranslation();
  const [playing, setPlaying] = useState(false);
  const start = useMemo(() => dayjs(heatmap.start), [heatmap.start]);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => onHourChange((hour + 1) % (heatmap.hours + 1)), PLAY_STEP_MS);
    return () => window.clearInterval(timer);
  }, [playing, hour, heatmap.hours, onHourChange]);

  const marks = useMemo(() => {
    const result: { value: number; label?: string }[] = [0, 12, 24, 36, 48]
      .filter(h => h <= heatmap.hours)
      .map(h => ({ value: h, label: `+${h}h` }));
    const departureHour = Math.round(dayjs(departureTime).diff(start, 'hour', true));
    if (departureHour > 0 && departureHour <= heatmap.hours) {
      result.push({ value: departureHour });
    }
    return result;
  }, [heatmap.hours, departureTime, start]);

  const thresholds = metricThresholds(metric);
  const legendLabels = thresholds
    ? thresholds.map(v => `${v}`).concat(METRIC_UNITS[metric])
    : RISK_LEVELS.map(level => t(`planner.risk.${level}`, RISK_LABELS[level]));

  return (
    <Paper elevation={3} sx={{ p: 1.5, pb: 0.5 }}>
      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
        <Tooltip title={t('planner.heatmap.toggle', 'Show heatmap')}>
          <Switch size="small" checked={visible} onChange={event => onVisibleChange(event.target.checked)} />
        </Tooltip>
        <Typography variant="subtitle2" sx={{ mr: 1 }}>
          {t('planner.heatmap.title', 'Weather forecast')}
        </Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={metric}
          onChange={(_, value) => value && onMetricChange(value)}
          disabled={!visible}
        >
          {METRICS.map(value => (
            <ToggleButton key={value} value={value} sx={{ py: 0.25, px: 1 }}>
              {t(`planner.heatmap.metric.${value}`, METRIC_LABELS[value])}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Box sx={{ flex: 1 }} />
        <Typography variant="body2" fontWeight={600} sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {start.add(hour, 'hour').format('ddd D MMM HH:mm')} (+{hour}h)
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 0.5 }}>
        <IconButton
          size="small"
          onClick={() => setPlaying(prev => !prev)}
          disabled={!visible}
          aria-label={playing ? t('planner.heatmap.pause', 'Pause') : t('planner.heatmap.play', 'Play')}
        >
          {playing ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <Slider
          size="small"
          min={0}
          max={heatmap.hours}
          step={1}
          value={hour}
          marks={marks}
          disabled={!visible}
          onChange={(_, value) => onHourChange(value as number)}
          valueLabelDisplay="auto"
          valueLabelFormat={value => start.add(value, 'hour').format('ddd HH:mm')}
          aria-label={t('planner.heatmap.hour', 'Forecast hour')}
          sx={{
            flex: 1,
            mr: 1,
            mb: 2.5,
            // The heatmap updates instantly; an animated thumb would lag behind it.
            '& .MuiSlider-thumb, & .MuiSlider-track': { transition: 'none' },
          }}
        />
      </Stack>

      <Box sx={{ mt: 2.5, mb: 0.5 }}>
        <Box sx={{ height: 6, borderRadius: 3, background: GRADIENT }} />
        <Stack direction="row" justifyContent="space-between">
          {legendLabels.map(label => (
            <Typography key={label} variant="caption" color="text.secondary">
              {label}
            </Typography>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
};

export default HeatmapControls;
