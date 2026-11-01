import { baseApi } from './baseApi';
import type { UserRole, CreateUserRoleRequest, UpdateUserRoleRequest, UserRoleListResponse } from '@app/types/userRole';

export const userRoleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserRoles: builder.query<UserRoleListResponse, { page: number; rowsPerPage: number; search?: string }>({
      query({ page, rowsPerPage, search }) {
        const offset = page * rowsPerPage;
        return `user-roles/user-roles/?is_active=true&limit=${rowsPerPage}&offset=${offset}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
      },
      transformResponse: (response: UserRoleListResponse) => response,
      providesTags: (result) =>
        result && result.results
          ? [
              ...result.results.map(({ id }) => ({ type: 'UserRole' as const, id })),
              { type: 'UserRole', id: 'LIST' },
            ]
          : [{ type: 'UserRole', id: 'LIST' }],
    }),

    getUserRole: builder.query<UserRole, string>({
      query: (id) => `user-roles/user-roles/${id}/`,
      providesTags: (result, error, id) => [{ type: 'UserRole', id }],
    }),

    createUserRole: builder.mutation<UserRole, CreateUserRoleRequest>({
      query: (body) => ({
        url: 'user-roles/user-roles/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'UserRole', id: 'LIST' }],
    }),

    updateUserRole: builder.mutation<UserRole, { id: string; data: UpdateUserRoleRequest }>({
      query: ({ id, data }) => ({
        url: `user-roles/user-roles/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'UserRole', id },
        { type: 'UserRole', id: 'LIST' },
      ],
    }),

    deleteUserRole: builder.mutation<void, { id: string; force?: boolean }>({
      query: ({ id, force = false }) => ({
        url: `user-roles/user-roles/${id}/${force ? '?force=true' : ''}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'UserRole', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUserRolesQuery,
  useGetUserRoleQuery,
  useCreateUserRoleMutation,
  useUpdateUserRoleMutation,
  useDeleteUserRoleMutation,
} = userRoleApi;