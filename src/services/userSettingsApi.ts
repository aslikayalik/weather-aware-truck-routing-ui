// @app/services/userSettingsApi.ts
import { baseApi } from './baseApi';

export interface UserSettings {
    font_size: number;
    max_upload_size_mb: number;
}

export const userSettingsApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getUserSettings: build.query<UserSettings, void>({
            query: () => ({
                url: 'common/user-settings/get_settings/',
                method: 'GET',
            }),
            // Tag this query so mutations can invalidate it
            providesTags: ['UserSettings'],
        }),
        updateFontSize: build.mutation<void, { font_size: number }>({
            query: (body) => ({
                url: 'common/user-settings/update_font_size/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['UserSettings'],
        }),
    }),
});
export const { useGetUserSettingsQuery, useUpdateFontSizeMutation } = userSettingsApi;