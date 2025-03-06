export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          access_token: string
          created_at: string | null
          id: string
          institution_name: string | null
          item_id: string
          name: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          id?: string
          institution_name?: string | null
          item_id: string
          name: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          id?: string
          institution_name?: string | null
          item_id?: string
          name?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      clerk_user_mapping: {
        Row: {
          clerk_user_id: string
          created_at: string | null
          email: string | null
          id: string
          supabase_user_id: string
        }
        Insert: {
          clerk_user_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          supabase_user_id: string
        }
        Update: {
          clerk_user_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          supabase_user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      config: {
        Row: {
          company_id: string | null
          created_at: string | null
          display_name: string
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          display_name: string
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          display_name?: string
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      document_instances: {
        Row: {
          created_at: string | null
          fields: Json
          id: string
          name: string
          status: string
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fields?: Json
          id?: string
          name: string
          status?: string
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fields?: Json
          id?: string
          name?: string
          status?: string
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_instances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          created_at: string | null
          description: string | null
          fields: Json
          id: string
          name: string
          pdf_data: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          fields?: Json
          id?: string
          name: string
          pdf_data: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          fields?: Json
          id?: string
          name?: string
          pdf_data?: string
        }
        Relationships: []
      }
      employee_invites: {
        Row: {
          created_at: string | null
          employee_id: string | null
          expires_at: string
          id: string
          token: string
        }
        Insert: {
          created_at?: string | null
          employee_id?: string | null
          expires_at?: string
          id?: string
          token: string
        }
        Update: {
          created_at?: string | null
          employee_id?: string | null
          expires_at?: string
          id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_invites_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          auth_id: string | null
          avatar_url: string | null
          contract_signed: boolean | null
          contract_url: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          end_job_date: string | null
          first_name: string
          hourly_rate: number | null
          id: string
          insurance_url: string | null
          invited: boolean | null
          last_name: string
          mobile_number: string | null
          role: string
          start_job_date: string | null
        }
        Insert: {
          address?: string | null
          auth_id?: string | null
          avatar_url?: string | null
          contract_signed?: boolean | null
          contract_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          end_job_date?: string | null
          first_name: string
          hourly_rate?: number | null
          id?: string
          insurance_url?: string | null
          invited?: boolean | null
          last_name: string
          mobile_number?: string | null
          role: string
          start_job_date?: string | null
        }
        Update: {
          address?: string | null
          auth_id?: string | null
          avatar_url?: string | null
          contract_signed?: boolean | null
          contract_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          end_job_date?: string | null
          first_name?: string
          hourly_rate?: number | null
          id?: string
          insurance_url?: string | null
          invited?: boolean | null
          last_name?: string
          mobile_number?: string | null
          role?: string
          start_job_date?: string | null
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          data: Json
          form_id: string
          id: string
          submitted_at: string | null
        }
        Insert: {
          data?: Json
          form_id: string
          id?: string
          submitted_at?: string | null
        }
        Update: {
          data?: Json
          form_id?: string
          id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          json_config: Json
          public_url: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          json_config?: Json
          public_url: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          json_config?: Json
          public_url?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      gocardless_accounts: {
        Row: {
          account_id: string
          balance: number | null
          bban: string | null
          bic: string | null
          created_at: string | null
          currency: string | null
          iban: string | null
          id: string
          institution_id: string
          institution_name: string | null
          name: string | null
          requisition_id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          balance?: number | null
          bban?: string | null
          bic?: string | null
          created_at?: string | null
          currency?: string | null
          iban?: string | null
          id?: string
          institution_id: string
          institution_name?: string | null
          name?: string | null
          requisition_id: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          balance?: number | null
          bban?: string | null
          bic?: string | null
          created_at?: string | null
          currency?: string | null
          iban?: string | null
          id?: string
          institution_id?: string
          institution_name?: string | null
          name?: string | null
          requisition_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gocardless_requisitions: {
        Row: {
          created_at: string | null
          id: string
          institution_id: string
          reference: string | null
          requisition_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          institution_id: string
          reference?: string | null
          requisition_id: string
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          institution_id?: string
          reference?: string | null
          requisition_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          address: string | null
          company_id: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          address?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          address?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          created_at: string | null
          description: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          active: boolean | null
          can_create: boolean | null
          can_delete: boolean | null
          can_edit: boolean | null
          can_view: boolean | null
          created_at: string | null
          id: string
          resource: string
          role: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          resource: string
          role: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          resource?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_resource_fkey"
            columns: ["resource"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["name"]
          },
        ]
      }
      shift_templates: {
        Row: {
          created_at: string | null
          day_of_week: string
          employee_id: string | null
          end_time: string
          id: string
          location_id: string
          name: string | null
          notes: string | null
          start_time: string
          version: number
        }
        Insert: {
          created_at?: string | null
          day_of_week: string
          employee_id?: string | null
          end_time: string
          id?: string
          location_id: string
          name?: string | null
          notes?: string | null
          start_time: string
          version?: number
        }
        Update: {
          created_at?: string | null
          day_of_week?: string
          employee_id?: string | null
          end_time?: string
          id?: string
          location_id?: string
          name?: string | null
          notes?: string | null
          start_time?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "shift_templates_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_templates_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          created_at: string | null
          date: string
          employee_id: string | null
          end_time: string
          id: string
          location_id: string | null
          name: string
          start_time: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          employee_id?: string | null
          end_time: string
          id?: string
          location_id?: string | null
          name: string
          start_time: string
          status: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          employee_id?: string | null
          end_time?: string
          id?: string
          location_id?: string | null
          name?: string
          start_time?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shifts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          category: string | null
          created_at: string | null
          date: string
          description: string | null
          id: string
          merchant_name: string | null
          pending: boolean | null
          transaction_id: string
          updated_at: string | null
        }
        Insert: {
          account_id: string
          amount: number
          category?: string | null
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          merchant_name?: string | null
          pending?: boolean | null
          transaction_id: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          amount?: number
          category?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          merchant_name?: string | null
          pending?: boolean | null
          transaction_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions_gocardless: {
        Row: {
          account_id: string
          amount: number
          category: string | null
          created_at: string | null
          currency: string | null
          date: string
          description: string | null
          id: string
          merchant_name: string | null
          pending: boolean | null
          status: string | null
          transaction_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          category?: string | null
          created_at?: string | null
          currency?: string | null
          date: string
          description?: string | null
          id?: string
          merchant_name?: string | null
          pending?: boolean | null
          status?: string | null
          transaction_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          category?: string | null
          created_at?: string | null
          currency?: string | null
          date?: string
          description?: string | null
          id?: string
          merchant_name?: string | null
          pending?: boolean | null
          status?: string | null
          transaction_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_gocardless_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "gocardless_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      unavailable_shifts: {
        Row: {
          created_at: string | null
          date: string
          employee_id: string
          end_time: string
          id: string
          reason: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          employee_id: string
          end_time: string
          id?: string
          reason?: string | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          employee_id?: string
          end_time?: string
          id?: string
          reason?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unavailable_shifts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      user_companies: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          role: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          role?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          payload: Json | null
          source: string
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          source: string
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          source?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_invite_token: {
        Args: {
          employee_id: string
        }
        Returns: string
      }
      get_user_auth_data: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      employee_role: "Front Of House" | "Manager" | "Admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
