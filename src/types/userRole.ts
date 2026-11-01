export interface UserRole {
  id: string;
  name: string;
  display_name: string;
  rank: number;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface CreateUserRoleRequest {
  name: string;
  display_name: string;
  rank?: number;
  is_active?: boolean;
}

export interface UpdateUserRoleRequest {
  name?: string;
  display_name?: string;
  rank?: number;
  is_active?: boolean;
}

export interface UserRoleListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserRole[];
}