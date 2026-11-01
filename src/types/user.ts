import { UserRole } from './userRole';
import { UserGroup } from './userGroup';

export interface User {
  id: string;
  is_active: boolean;
  is_superuser?: boolean;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  expire_date?: string;
  profile: {
    id: string;
    avatar: string;
    initials?: string;  
    avatar_bg_color?: string; 
    use_initials_avatar?: boolean;
  };
  role: string | null; 
  role_detail?: UserRole | null; 
  user_groups: UserGroup[];
  last_login?: string | null;
}


export interface UserFormData {
  id?: string;
  is_active: boolean;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  expire_date?: string | null;
  role: string; 
  password?: string;
  password_confirmation?: string;
  user_groups?: UserGroup[];
  profile?: {
    avatar?: string;
    initials?: string;  
    avatar_bg_color?: string; 
    use_initials_avatar?: boolean;
    initials_type?: string;
  };
}

export interface UserAdmin {
  id?: string;
  is_active: boolean;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  expire_date?: string | null;
  profile?: {
    id?: string;
    avatar?: string;
    initials?: string;  
    avatar_bg_color?: string; 
    use_initials_avatar?: boolean;
    initials_type?: string;
  };
  role: string | UserRole; 
  user_groups?: UserGroup[];
  password?: string;
  password_confirmation?: string;
}