import React, { useState } from 'react';
import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGeocodeQuery } from '@services/routingApi';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { Place } from '@app/types/trip';

const MIN_QUERY_LENGTH = 3;

interface PlaceAutocompleteProps {
  label: string;
  value: Place | null;
  onChange: (place: Place | null) => void;
  error?: string;
}

const PlaceAutocomplete = ({ label, value, onChange, error }: PlaceAutocompleteProps) => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const query = useDebouncedValue(input.trim(), 350);
  const skip = query.length < MIN_QUERY_LENGTH || query === value?.label;
  const { data = [], isFetching, isError } = useGeocodeQuery(query, { skip });

  return (
    <Autocomplete
      value={value}
      options={skip ? (value ? [value] : []) : data}
      filterOptions={options => options}
      getOptionLabel={option => option.label ?? `${option.lat.toFixed(4)}, ${option.lon.toFixed(4)}`}
      isOptionEqualToValue={(a, b) => a.lat === b.lat && a.lon === b.lon}
      onChange={(_, place) => onChange(place)}
      inputValue={input}
      onInputChange={(_, text) => setInput(text)}
      loading={isFetching}
      noOptionsText={
        isError
          ? t('planner.form.searchFailed', 'Place search failed')
          : input.trim().length < MIN_QUERY_LENGTH
            ? t('planner.form.typeToSearch', 'Type at least 3 characters')
            : t('planner.form.noPlaces', 'No places found')
      }
      renderOption={(props, option) => (
        <li {...props} key={`${option.lat},${option.lon},${option.label}`}>
          {option.label}
        </li>
      )}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          size="small"
          error={Boolean(error)}
          helperText={error}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isFetching ? <CircularProgress color="inherit" size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default PlaceAutocomplete;
