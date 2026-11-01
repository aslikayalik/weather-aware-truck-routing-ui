import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';
import { User } from '../../types/user';
import { UserRole as UserRoleType } from '../../types/userRole';
import { RootState } from '../store';

export interface TokenPayload {
  access: string;
  refresh: string;
}

interface AuthPayload extends TokenPayload {
  user: User;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  availableRoles: UserRoleType[];
  rolesLoading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  availableRoles: [],
  rolesLoading: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthUser(state, action: PayloadAction<User>) {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    login(state, action: PayloadAction<AuthPayload>) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.access;
      state.refreshToken = action.payload.refresh;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
    },
    refreshToken(state, action: PayloadAction<TokenPayload>) {
      state.accessToken = action.payload.access;
      state.refreshToken = action.payload.refresh;
    },
    setAvailableRoles(state, action: PayloadAction<UserRoleType[]>) {
      state.availableRoles = action.payload;
      state.rolesLoading = false;
    },
  },
});

export const { setAuthUser, login, logout, refreshToken, setAvailableRoles } = authSlice.actions;

export const selectUser = createSelector(
  (state: RootState) => state.auth.user,
  (state: RootState) => state.auth.isAuthenticated,
  (user, isAuthenticated) => ({
    user,
    isAuthenticated,
  }),
);

export const selectAuth = (state: RootState) => state.auth;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectAvailableRoles = (state: RootState) => state.auth.availableRoles;
export const selectRolesLoading = (state: RootState) => state.auth.rolesLoading;

export default authSlice.reducer;