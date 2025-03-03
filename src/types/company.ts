
export interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  address?: string | null;
  created_at?: string;
  updated_at?: string;
}
