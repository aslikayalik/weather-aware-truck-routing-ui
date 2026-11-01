export interface UserGroup  {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    users?: string[];
    expire_date?: string;
    is_active: boolean;
}