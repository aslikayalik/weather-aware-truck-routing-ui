export interface ListResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
  meta?: ListMeta;
}

export interface SearchUserAndGroup {
  text: string;
  id: string;
  object_type: string;
  email: string;
  role: string;
}

export interface ListMeta {
  all_count: number;
  active_count: number;
  inactive_count: number;
}

export interface CaptchaGenerateResponse {
  key: string;
  image_url: string;
}

export interface CaptchaValidateRequest {
  key: string;
  value: string;
}

export interface CaptchaValidateResponse {
  valid: boolean;
}