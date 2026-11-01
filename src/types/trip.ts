export type RiskLevelKey = 'low' | 'moderate' | 'high' | 'severe' | 'no_travel';

export type LatLngTuple = [number, number];

export interface Place {
  lat: number;
  lon: number;
  label?: string;
}

export type CheckpointInterval = 10 | 25 | 50;

export interface TripPlanRequest {
  origin: Place;
  destination: Place;
  departure_time: string;
  load_weight_lb: number;
  checkpoint_interval_miles: CheckpointInterval;
}

export interface CheckpointWeather {
  wind_mph: number;
  gust_mph: number;
  rain_in_hr: number;
  snow_in_hr: number;
}

export interface CheckpointRisk {
  level: RiskLevelKey;
  wind: RiskLevelKey;
  rain: RiskLevelKey;
  snow: RiskLevelKey;
  drivers: Array<'wind' | 'rain' | 'snow'>;
  load_adjusted: boolean;
}

export interface Checkpoint {
  mile: number;
  lat: number;
  lon: number;
  eta: string;
  /** null when the ETA is beyond the forecast range */
  weather: CheckpointWeather | null;
  risk: CheckpointRisk | null;
}

export interface RouteSegment {
  from_mile: number;
  to_mile: number;
  level: RiskLevelKey | null;
  path: LatLngTuple[];
}

export interface RouteSummary {
  miles_by_level: Record<RiskLevelKey, number>;
  unknown_miles: number;
  average_risk: number;
  max_level: RiskLevelKey | null;
}

export interface PlannedRoute {
  id: number;
  label: string;
  provider: string;
  rank: number;
  recommended: boolean;
  distance_miles: number;
  duration_seconds: number;
  departure_time: string;
  arrival_time: string;
  path: LatLngTuple[];
  segments: RouteSegment[];
  checkpoints: Checkpoint[];
  summary: RouteSummary;
}

export interface TripHeatmap {
  start: string;
  step_hours: number;
  hours: number;
  cell_size_degrees: number;
  points: LatLngTuple[];
  /** [point][hour] */
  risk: number[][];
  wind_mph: number[][];
  rain_in_hr: number[][];
  snow_in_hr: number[][];
}

export interface TripPlan {
  origin: Place;
  destination: Place;
  departure_time: string;
  load_weight_lb: number;
  checkpoint_interval_miles: CheckpointInterval;
  recommended_route_id: number;
  recommendation_reason: string;
  routes: PlannedRoute[];
  heatmap: TripHeatmap;
}
