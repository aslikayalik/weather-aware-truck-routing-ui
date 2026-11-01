import React, { FormEvent, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Box, IconButton, InputAdornment, Stack, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import RouteIcon from '@mui/icons-material/Route';
import PlaceAutocomplete from './PlaceAutocomplete';
import { CheckpointInterval, Place, TripPlanRequest } from '@app/types/trip';

const INTERVALS: CheckpointInterval[] = [10, 25, 50];
const MAX_LOAD_LB = 80000;
// Must match the backend: the whole trip has to fit in the 7-day forecast.
const MAX_DAYS_AHEAD = 4;

const nextQuarterHour = () => {
  const now = dayjs();
  return now
    .add(15 - (now.minute() % 15), 'minute')
    .second(0)
    .millisecond(0);
};

interface TripFormProps {
  loading: boolean;
  /** When a plan is already shown, changing the interval re-plans immediately. */
  hasPlan: boolean;
  onSubmit: (request: TripPlanRequest) => void;
}

type Errors = Partial<Record<'origin' | 'destination' | 'departure' | 'load', string>>;

const TripForm = ({ loading, hasPlan, onSubmit }: TripFormProps) => {
  const { t } = useTranslation();
  const [origin, setOrigin] = useState<Place | null>(null);
  const [destination, setDestination] = useState<Place | null>(null);
  const [departure, setDeparture] = useState<Dayjs | null>(nextQuarterHour);
  const [load, setLoad] = useState('35000');
  const [checkpointInterval, setCheckpointInterval] = useState<CheckpointInterval>(25);
  const [errors, setErrors] = useState<Errors>({});

  const validate = (): Errors => {
    const result: Errors = {};
    if (!origin) result.origin = t('planner.form.required', 'Required');
    if (!destination) result.destination = t('planner.form.required', 'Required');
    if (!departure || !departure.isValid()) {
      result.departure = t('planner.form.required', 'Required');
    } else if (departure.isBefore(dayjs().subtract(30, 'minute')) || departure.isAfter(dayjs().add(MAX_DAYS_AHEAD, 'day'))) {
      result.departure = t('planner.form.departureRange', 'Choose a time within the next {{days}} days', { days: MAX_DAYS_AHEAD });
    }
    const loadValue = Number(load);
    if (load.trim() === '' || Number.isNaN(loadValue) || loadValue < 0 || loadValue > MAX_LOAD_LB) {
      result.load = t('planner.form.loadRange', 'Enter 0 – {{max}} lb', { max: MAX_LOAD_LB.toLocaleString() });
    }
    return result;
  };

  const submit = (intervalMiles: CheckpointInterval) => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length || !origin || !destination || !departure) return;
    onSubmit({
      origin,
      destination,
      departure_time: departure.toISOString(),
      load_weight_lb: Number(load),
      checkpoint_interval_miles: intervalMiles,
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit(checkpointInterval);
  };

  const handleIntervalChange = (_: unknown, value: CheckpointInterval | null) => {
    if (!value) return;
    setCheckpointInterval(value);
    if (hasPlan) submit(value);
  };

  const swap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
            <PlaceAutocomplete label={t('planner.form.origin', 'Origin')} value={origin} onChange={setOrigin} error={errors.origin} />
            <PlaceAutocomplete
              label={t('planner.form.destination', 'Destination')}
              value={destination}
              onChange={setDestination}
              error={errors.destination}
            />
          </Stack>
          <Tooltip title={t('planner.form.swap', 'Swap origin and destination')}>
            <IconButton onClick={swap} aria-label={t('planner.form.swap', 'Swap origin and destination')}>
              <SwapVertIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <DateTimePicker
          label={t('planner.form.departure', 'Departure')}
          value={departure}
          onChange={setDeparture}
          ampm={false}
          disablePast
          maxDateTime={dayjs().add(MAX_DAYS_AHEAD, 'day')}
          slotProps={{ textField: { size: 'small', fullWidth: true, error: Boolean(errors.departure), helperText: errors.departure } }}
        />

        <TextField
          label={t('planner.form.load', 'Load weight')}
          size="small"
          type="number"
          value={load}
          onChange={event => setLoad(event.target.value)}
          error={Boolean(errors.load)}
          helperText={errors.load}
          inputProps={{ min: 0, max: MAX_LOAD_LB, step: 500 }}
          InputProps={{ endAdornment: <InputAdornment position="end">lb</InputAdornment> }}
        />

        <Box>
          <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
            {t('planner.form.interval', 'Weather checkpoint every')}
          </Typography>
          <ToggleButtonGroup exclusive fullWidth size="small" value={checkpointInterval} onChange={handleIntervalChange} disabled={loading}>
            {INTERVALS.map(value => (
              <ToggleButton key={value} value={value}>
                {value} mi
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <LoadingButton type="submit" variant="contained" loading={loading} startIcon={<RouteIcon />} loadingPosition="start">
          {t('planner.form.submit', 'Plan routes')}
        </LoadingButton>
      </Stack>
    </Box>
  );
};

export default TripForm;
