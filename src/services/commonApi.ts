import { baseApi } from '@services/baseApi';
import {
  SearchUserAndGroup,
  CaptchaGenerateResponse,
  CaptchaValidateRequest,
  CaptchaValidateResponse
} from '@app/types/common';

export const commonApi = baseApi.injectEndpoints({
  endpoints: build => ({
    searchUserAndGroup: build.query<SearchUserAndGroup[], { query: string; object_type?: string }>({
      query: ({ query, object_type }) => ({
        url: `common/search-sharing-object/`,
        params: object_type ? { query, object_type } : { query },
      }),
      providesTags: (result, error, { query, object_type }) => [{ type: 'UserAndGroupSearch', id: `${query}-${object_type || 'all'}` }],
    }),
    generateCaptcha: build.query<CaptchaGenerateResponse, void>({
      query: () => ({
        url: 'common/captcha/generate/',
      }),
    }),
    validateCaptcha: build.mutation<CaptchaValidateResponse, CaptchaValidateRequest>({
      query: (data) => ({
        url: 'common/captcha/validate/',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useSearchUserAndGroupQuery,
  useLazyGenerateCaptchaQuery,
  useValidateCaptchaMutation,
} = commonApi;
