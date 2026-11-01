import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { useDispatch as useDispatchBase, useSelector as useSelectorBase } from 'react-redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { baseApi, baseApiPublic } from '@services/baseApi';
import authSlice from './slices/authSlice';
import settingsSlice from './slices/settingsSlice';
import errorMiddleware from './error-middleware';

const rootPersistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'settings'],
};

const rootReducer = combineReducers({
  auth: authSlice,
  settings: settingsSlice,
  [baseApiPublic.reducerPath]: baseApiPublic.reducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }).concat([baseApiPublic.middleware, baseApi.middleware, errorMiddleware]),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useDispatch = () => useDispatchBase<AppDispatch>();

export const useSelector = <TSelected = unknown>(selector: (state: RootState) => TSelected): TSelected =>
  useSelectorBase<RootState, TSelected>(selector);

export const persistor = persistStore(store);

// RTK Query: required for refetchOnFocus and refetchOnReconnect
setupListeners(store.dispatch);

export default store;
