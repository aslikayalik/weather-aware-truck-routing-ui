import { User, UserAdmin } from '../types/user';
import { baseApi } from './baseApi';
import { ListResponse } from '@app/types/common';

export const userApi = baseApi.injectEndpoints({
  endpoints: build => ({
    getUser: build.query<User, void>({
      query: () => ({
        url: 'user/me/',
      }),
    }),
    // Change password
    changeUserPassword: build.mutation<void, { oldPassword: string, newPassword: string, confirmNewPassword: string }>({
      query: ({ oldPassword, newPassword, confirmNewPassword }) => ({
        url: 'user/me/change-password/',
        method: 'POST',
        body: { old_password: oldPassword, new_password: newPassword, confirm_new_password: confirmNewPassword },
      }),
      invalidatesTags: [{ type: 'User', id: 'ME' }],
    }),
    // Change avatar
    changeUserAvatar: build.mutation<{ avatar: string }, FormData>({
      query: (formData) => ({
        url: 'user/me/change-avatar/',
        method: 'POST',
        body: formData, // Sent as FormData
      }),
      invalidatesTags: [{ type: 'User', id: 'ME' }],
    }),
  }),
});


// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints

export const userAdminApi = baseApi.injectEndpoints({
  endpoints: build => ({
    getAdminUsers: build.query<ListResponse<User>, { page: number; rowsPerPage: number; search?: string; status?: string }>({
      query: ({ page, rowsPerPage, search, status }) => ({
        url: `user/admin/?limit=${rowsPerPage}&offset=${page * rowsPerPage}${search ? `&search=${encodeURIComponent(search)}` : ''}${status ? `&status=${status}` : ''}`,
      }),
      providesTags: (result, error, { page }) =>
        result
          ? [...result.results.map(({ id }) => ({ type: 'AdminUser' as const, id })), { type: 'AdminUser' as const, id: `page-${page}` }]
          : [{ type: 'AdminUser' as const, id: 'LIST' }],
    }),
    getAdminUser: build.query<User, string>({
      query: (id: string) => ({
        url: `user/admin/${id}/`,
      }),
    }),
    createAdminUser: build.mutation<User, UserAdmin>({
      query: (body: UserAdmin) => ({
        url: `user/admin/`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'AdminUser', id: 'LIST' }],
    }),
    updateAdminUser: build.mutation<User, UserAdmin>({
      query: (body: UserAdmin) => ({
        url: `user/admin/${body.id}/`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'AdminUser', id }],
    }),
    deleteAdminUser: build.mutation<void, string>({
      query: (id: string) => ({
        url: `user/admin/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'AdminUser', id }],
    }),

  }),
});

export const { useGetUserQuery, useChangeUserPasswordMutation, useChangeUserAvatarMutation } = userApi;
export const {
  useUpdateAdminUserMutation,
  useCreateAdminUserMutation,
  useGetAdminUsersQuery,
  useGetAdminUserQuery,
  useLazyGetAdminUserQuery,
  useDeleteAdminUserMutation,
} = userAdminApi;
