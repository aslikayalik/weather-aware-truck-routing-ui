# Weather-Aware Truck Routing — Web Client

Web application for planning truck trips around the weather. Drivers enter an origin, a
destination, a departure time and a load weight. They then compare three routes on an
interactive map, with the risk at every checkpoint and a 48-hour weather heatmap of the corridor.

The API, along with the routing, weather and risk logic, lives in the companion
`weather-aware-truck-routing-backend` repository.

## Features

- **Trip planning:**
  - Origin and destination with place search
  - Departure date and time
  - Load weight in lb
  - Weather checkpoints every 10, 25 or 50 miles. Changing the interval re-plans immediately.
- **Recommendation** banner that explains why the route was chosen.
- **Route comparison cards:** distance, drive time, arrival, Severe and High miles, average risk,
  and a bar showing how many miles fall in each risk level.
- **Checkpoint table** for the selected route: mile, ETA, wind, rain, snow and risk.
  - ⚖ marks checkpoints whose risk was raised by the load weight.
  - Click a row to jump to it on the map.
- **Interactive map:**
  - The selected route is coloured by risk segment; the other routes stay visible in grey.
  - Every checkpoint has a tooltip with its ETA, weather and risk level.
  - Each route has a label with its rank, drive time and distance; ★ marks the recommended route.
  - Click a route to select it.
- **Weather heatmap:**
  - Covers the trip corridor, with a 0–48 hour forecast slider and playback.
  - Shows Risk, Wind, Rain or Snow on the same colour scale as the risk levels.
  - Opens at the departure hour.
- English and Turkish UI, user and role administration, profile and settings pages.

## Tech stack

React 18, TypeScript, Material UI 5, Redux Toolkit / RTK Query, Leaflet + react-leaflet, Day.js,
i18next, Webpack 5.

## Getting started

### Prerequisites

- Node.js 18.18+ and Yarn 1.x
- A running backend (see the backend README; `docker compose up -d`)

### Development

```sh
yarn install
yarn start          # http://localhost:9060
```

The dev server proxies `/api` to `http://127.0.0.1:8000`. Point it elsewhere with
`DEV_PROXY_TARGET`, e.g. `DEV_PROXY_TARGET=http://127.0.0.1:8080 yarn start`.

Sign in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` configured in the backend's `.env`.

### Production build

```sh
yarn build          # output: target/classes/static
```

The included `Dockerfile` builds the app and serves it with nginx.

### Configuration

| Variable (`.env`) | Description |
|---|---|
| `REACT_APP_API_URL` | API base path, `/api/v1/` by default |

The map uses OpenStreetMap's standard tiles, which are intended for light use. For production
traffic, switch the `TileLayer` URL in `src/pages/planner/TripMap.tsx` to a commercial tile provider.

## Heatmap rendering

The heatmap is designed to stay smooth while scrubbing through time:

- **No network on scrub.** The plan response contains all 49 hourly values for every grid point,
  so moving the slider never triggers a request.
- **Cells are created once.** `HeatmapLayer` draws one canvas rectangle per grid cell when a plan
  arrives. Changing the hour or the metric only restyles those rectangles.
- **Route layers never re-render.** They are memoised and do not depend on the selected hour.
- **Smooth look without blending.** The cells sit in their own map pane with a CSS blur sized to
  about half a cell at the current zoom. It reads as a smooth heatmap, while each cell keeps its
  own value instead of adding up with its neighbours like a point-density heatmap.

## Project structure

```
src/
  pages/planner/
    PlannerPage.tsx         page state: plan, selected route, forecast hour, metric
    TripForm.tsx            trip inputs and validation
    PlaceAutocomplete.tsx   debounced place search
    RouteCards.tsx          route summaries and risk distribution bar
    CheckpointTable.tsx     checkpoints of the selected route
    TripMap.tsx             Leaflet map: routes, risk segments, checkpoints, labels
    HeatmapLayer.tsx        canvas grid restyled per forecast hour
    HeatmapControls.tsx     time slider, playback, metric toggle, legend
    risk.ts                 risk colours, labels and colour scales
  services/                 RTK Query APIs (routingApi.ts, auth, users, roles, settings)
  types/                    API types (trip.ts, user.ts, ...)
  pages/                    login, profile, settings, user and role administration
  shared/layout/app/        header, sidebar, menu
  routes/                   route tree, path constants, role-based PrivateRoute
  store/                    auth and settings slices (redux-persist)
  locales/                  en.json, tr.json
```
