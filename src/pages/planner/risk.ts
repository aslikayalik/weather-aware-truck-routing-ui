import { RiskLevelKey, TripHeatmap } from '@app/types/trip';

export const RISK_LEVELS: RiskLevelKey[] = ['low', 'moderate', 'high', 'severe', 'no_travel'];

export const RISK_COLORS: Record<RiskLevelKey, string> = {
  low: '#2e7d32',
  moderate: '#f9a825',
  high: '#ef6c00',
  severe: '#c62828',
  no_travel: '#6a1b9a',
};

export const UNKNOWN_COLOR = '#9e9e9e';

export const RISK_LABELS: Record<RiskLevelKey, string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  severe: 'Severe',
  no_travel: 'No Travel',
};

export const riskColor = (level: RiskLevelKey | null | undefined) => (level ? RISK_COLORS[level] : UNKNOWN_COLOR);

export type HeatMetric = 'risk' | 'wind' | 'rain' | 'snow';

/**
 * Raw-value thresholds for each risk level (Low..No Travel), identical to the backend
 * rules. Used to place a raw value on the same 0-4 colour axis as the risk score.
 */
const METRIC_THRESHOLDS: Record<Exclude<HeatMetric, 'risk'>, number[]> = {
  wind: [0, 25, 35, 45, 55],
  rain: [0, 0.1, 0.25, 0.5, 1.0],
  snow: [0, 0.5, 1, 2, 3],
};

export const METRIC_UNITS: Record<HeatMetric, string> = {
  risk: '',
  wind: 'mph',
  rain: 'in/hr',
  snow: 'in/hr',
};

const toIndex = (value: number, thresholds: number[]) => {
  for (let i = 1; i < thresholds.length; i++) {
    if (value <= thresholds[i]) {
      return i - 1 + (value - thresholds[i - 1]) / (thresholds[i] - thresholds[i - 1]);
    }
  }
  return thresholds.length - 1;
};

/** Value of `metric` at heatmap point `point`, `hour` hours after heatmap.start, on a 0-4 scale. */
export const heatIndex = (heatmap: TripHeatmap, metric: HeatMetric, point: number, hour: number) => {
  switch (metric) {
    case 'wind':
      return toIndex(heatmap.wind_mph[point][hour], METRIC_THRESHOLDS.wind);
    case 'rain':
      return toIndex(heatmap.rain_in_hr[point][hour], METRIC_THRESHOLDS.rain);
    case 'snow':
      return toIndex(heatmap.snow_in_hr[point][hour], METRIC_THRESHOLDS.snow);
    default:
      return heatmap.risk[point][hour];
  }
};

export const metricThresholds = (metric: HeatMetric) => (metric === 'risk' ? null : METRIC_THRESHOLDS[metric]);

const STOPS = RISK_LEVELS.map(level => {
  const hex = RISK_COLORS[level];
  return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
});

/** Colour for a continuous 0-4 index, blending between the risk-level colours. */
export const heatColor = (index: number) => {
  const clamped = Math.min(Math.max(index, 0), 4);
  const lower = Math.min(Math.floor(clamped), 3);
  const t = clamped - lower;
  const [r, g, b] = STOPS[lower].map((c, i) => Math.round(c + (STOPS[lower + 1][i] - c) * t));
  return `rgb(${r}, ${g}, ${b})`;
};

/** Calm areas stay faint so the base map and routes remain readable. */
export const heatOpacity = (index: number) => 0.18 + 0.14 * Math.min(Math.max(index, 0), 4);

export const formatDuration = (seconds: number) => {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours ? `${hours} h ${minutes} min` : `${minutes} min`;
};
