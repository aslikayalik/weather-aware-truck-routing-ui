import { UserGroup } from '../types/userGroup';
import { baseApi } from './baseApi';
import { ListResponse } from '@app/types/common';

export const userGroupApi = baseApi.injectEndpoints({
  endpoints: build => ({
    getUserGroups: build.query<ListResponse<UserGroup>, number>({
      query: (page: number = 0) => ({
        url: `team/user-group/?limit=20&offset=${page * 20}`,
      }),
      providesTags: (result, _, page) =>
      result
        ? [...result.results.map(({ id }) => ({ type: 'AdminUserGroup' as const, id })), { type: 'AdminUserGroup' as const, id: `page-${page}` }]
        : [{ type: 'AdminUserGroup' as const, id: 'LIST' }],

    }),
    getUserGroup: build.query<UserGroup, string>({
      query: (id: string) => ({
        url: `team/user-group/${id}/`,
      }),
    }),
    createUserGroup: build.mutation<UserGroup, UserGroup>({
      query: (body: UserGroup) => ({
        url: 'team/user-group/',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'AdminUserGroup', id: 'LIST' }],
    }),
    updateUserGroup: build.mutation<UserGroup, UserGroup>({
      query: (body: UserGroup) => ({
        url: `team/user-group/${body.id}/`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'AdminUserGroup', id }],
    }),
    deleteUserGroup: build.mutation<void, string>({
      query: (id: string) => ({
        url: `team/user-group/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'AdminUserGroup', id }],
    }),
  }),
});

export const {
  useGetUserGroupsQuery,
  useGetUserGroupQuery,
  useLazyGetUserGroupQuery,
  useCreateUserGroupMutation,
  useUpdateUserGroupMutation,
  useDeleteUserGroupMutation,
} = userGroupApi;