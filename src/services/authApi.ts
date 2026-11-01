import { User } from '../types/user';
import { baseApi, baseApiPublic } from './baseApi';

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  user: User;
  access: string;
  refresh: string;
  remember: boolean;
}

export const authApi = baseApiPublic.injectEndpoints({
  endpoints: build => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (body: LoginRequest) => ({
        url: 'auth/token/',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useLoginMutation } = authApi;

const sessionApi = baseApi.injectEndpoints({
  endpoints: build => ({
    logoutSession: build.mutation<void, void>({
      query: () => ({ url: 'auth/logout/', method: 'POST' }),
    }),
  }),
});

export const { useLogoutSessionMutation } = sessionApi;
