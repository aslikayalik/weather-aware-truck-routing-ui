import { baseApi } from '@services/baseApi';
import { Place, TripPlan, TripPlanRequest } from '@app/types/trip';

export const routingApi = baseApi.injectEndpoints({
  endpoints: build => ({
    planTrip: build.mutation<TripPlan, TripPlanRequest>({
      query: body => ({
        url: 'routing/plan/',
        method: 'POST',
        body,
      }),
    }),
    geocode: build.query<Place[], string>({
      query: q => ({
        url: 'routing/geocode/',
        params: { q },
      }),
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { usePlanTripMutation, useGeocodeQuery } = routingApi;
