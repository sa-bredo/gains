export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
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
          integrations: Json | null
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
          integrations?: Json | null
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
          integrations?: Json | null
          invited?: boolean | null
          last_name?: string
          mobile_number?: string | null
          role?: string
          start_job_date?: string | null
        }
        Relationships: []
      }
      flow_assignments: {
        Row: {
          assigned_to: string
          completed_at: string | null
          created_at: string
          current_page_index: number
          flow_id: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to: string
          completed_at?: string | null
          created_at?: string
          current_page_index?: number
          flow_id: string
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string
          completed_at?: string | null
          created_at?: string
          current_page_index?: number
          flow_id?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_assignments_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "page_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_progress: {
        Row: {
          assignment_id: string
          completed_at: string | null
          created_at: string
          id: string
          input_data: Json | null
          page_id: string
          status: string
          updated_at: string
        }
        Insert: {
          assignment_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          input_data?: Json | null
          page_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          input_data?: Json | null
          page_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_progress_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "flow_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flow_progress_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          data: Json
          form_id: string
          id: string
          starred: boolean
          submitted_at: string | null
        }
        Insert: {
          data?: Json
          form_id: string
          id?: string
          starred?: boolean
          submitted_at?: string | null
        }
        Update: {
          data?: Json
          form_id?: string
          id?: string
          starred?: boolean
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
          archived: boolean
          completion_message: Json | null
          created_at: string | null
          description: string | null
          form_type: string | null
          id: string
          json_config: Json
          public_url: string
          title: string
          updated_at: string | null
        }
        Insert: {
          archived?: boolean
          completion_message?: Json | null
          created_at?: string | null
          description?: string | null
          form_type?: string | null
          id?: string
          json_config?: Json
          public_url: string
          title: string
          updated_at?: string | null
        }
        Update: {
          archived?: boolean
          completion_message?: Json | null
          created_at?: string | null
          description?: string | null
          form_type?: string | null
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
      message_templates: {
        Row: {
          category: string
          content: string
          created_at: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          error: string | null
          id: string
          recipient_id: string
          recipient_type: string
          sent_at: string | null
          sent_by: string | null
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          error?: string | null
          id?: string
          recipient_id: string
          recipient_type: string
          sent_at?: string | null
          sent_by?: string | null
          status?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          error?: string | null
          id?: string
          recipient_id?: string
          recipient_type?: string
          sent_at?: string | null
          sent_by?: string | null
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      page_flows: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string | null
          data_binding_id: string | null
          data_binding_type: string | null
          description: string | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          data_binding_id?: string | null
          data_binding_type?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          data_binding_id?: string | null
          data_binding_type?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_flows_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          actions: Json | null
          automation_config: Json | null
          content: string | null
          created_at: string
          description: string | null
          document_id: string | null
          flow_id: string
          id: string
          order_index: number
          page_type: string
          title: string
          updated_at: string
        }
        Insert: {
          actions?: Json | null
          automation_config?: Json | null
          content?: string | null
          created_at?: string
          description?: string | null
          document_id?: string | null
          flow_id: string
          id?: string
          order_index: number
          page_type: string
          title: string
          updated_at?: string
        }
        Update: {
          actions?: Json | null
          automation_config?: Json | null
          content?: string | null
          created_at?: string
          description?: string | null
          document_id?: string | null
          flow_id?: string
          id?: string
          order_index?: number
          page_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pages_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "page_flows"
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
      create_invite_token: { Args: { employee_id: string }; Returns: string }
      get_user_auth_data: { Args: never; Returns: string }
    }
    Enums: {
      employee_role: "Front Of House" | "Manager" | "Admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      employee_role: ["Front Of House", "Manager", "Admin"],
    },
  },
} as const
