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
      companies: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          matricola_inps: string | null
          name: string
          phone: string | null
          posizione_inail: string | null
          updated_at: string | null
          vat_number: string | null
          voce_inail: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          matricola_inps?: string | null
          name: string
          phone?: string | null
          posizione_inail?: string | null
          updated_at?: string | null
          vat_number?: string | null
          voce_inail?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          matricola_inps?: string | null
          name?: string
          phone?: string | null
          posizione_inail?: string | null
          updated_at?: string | null
          vat_number?: string | null
          voce_inail?: string | null
        }
        Relationships: []
      }
      education_records: {
        Row: {
          company_id: string
          created_at: string | null
          date: string | null
          employee_id: string
          grade: string | null
          id: string
          name: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          date?: string | null
          employee_id: string
          grade?: string | null
          id?: string
          name: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          date?: string | null
          employee_id?: string
          grade?: string | null
          id?: string
          name?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "education_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "education_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          base_salary: number
          company_id: string
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at: string | null
          cv_url: string | null
          dependents_count: number | null
          email: string
          employee_type: string | null
          first_name: string | null
          full_name: string
          hire_date: string
          iban: string | null
          id: string
          id_card_expiry_date: string | null
          id_card_issue_date: string | null
          id_card_municipality: string | null
          id_card_province: string | null
          inail_position: string | null
          inps_position: string | null
          is_active: boolean | null
          last_name: string | null
          marital_status: string | null
          national_contract_type: string | null
          nationality: string | null
          passport_expiry_date: string | null
          passport_issue_date: string | null
          passport_municipality: string | null
          passport_number: string | null
          passport_province: string | null
          payment_category: string | null
          pension_fund: string | null
          phone: string | null
          police_station: string | null
          tax_code: string
          tax_deductions: number | null
          updated_at: string | null
          visa_document_url: string | null
          visa_expiry_date: string | null
          visa_issue_date: string | null
          visa_number: string | null
          work_permit_number: string | null
          working_hours: number | null
        }
        Insert: {
          base_salary: number
          company_id: string
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at?: string | null
          cv_url?: string | null
          dependents_count?: number | null
          email: string
          employee_type?: string | null
          first_name?: string | null
          full_name: string
          hire_date: string
          iban?: string | null
          id?: string
          id_card_expiry_date?: string | null
          id_card_issue_date?: string | null
          id_card_municipality?: string | null
          id_card_province?: string | null
          inail_position?: string | null
          inps_position?: string | null
          is_active?: boolean | null
          last_name?: string | null
          marital_status?: string | null
          national_contract_type?: string | null
          nationality?: string | null
          passport_expiry_date?: string | null
          passport_issue_date?: string | null
          passport_municipality?: string | null
          passport_number?: string | null
          passport_province?: string | null
          payment_category?: string | null
          pension_fund?: string | null
          phone?: string | null
          police_station?: string | null
          tax_code: string
          tax_deductions?: number | null
          updated_at?: string | null
          visa_document_url?: string | null
          visa_expiry_date?: string | null
          visa_issue_date?: string | null
          visa_number?: string | null
          work_permit_number?: string | null
          working_hours?: number | null
        }
        Update: {
          base_salary?: number
          company_id?: string
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string | null
          cv_url?: string | null
          dependents_count?: number | null
          email?: string
          employee_type?: string | null
          first_name?: string | null
          full_name?: string
          hire_date?: string
          iban?: string | null
          id?: string
          id_card_expiry_date?: string | null
          id_card_issue_date?: string | null
          id_card_municipality?: string | null
          id_card_province?: string | null
          inail_position?: string | null
          inps_position?: string | null
          is_active?: boolean | null
          last_name?: string | null
          marital_status?: string | null
          national_contract_type?: string | null
          nationality?: string | null
          passport_expiry_date?: string | null
          passport_issue_date?: string | null
          passport_municipality?: string | null
          passport_number?: string | null
          passport_province?: string | null
          payment_category?: string | null
          pension_fund?: string | null
          phone?: string | null
          police_station?: string | null
          tax_code?: string
          tax_deductions?: number | null
          updated_at?: string | null
          visa_document_url?: string | null
          visa_expiry_date?: string | null
          visa_issue_date?: string | null
          visa_number?: string | null
          work_permit_number?: string | null
          working_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_records: {
        Row: {
          base_salary: number
          bonuses: number | null
          company_id: string
          confirmed_at: string | null
          created_at: string | null
          employee_id: string
          gross_total: number
          id: string
          inps_contribution: number
          irpef_tax: number
          month: number
          net_salary: number
          overtime_pay: number | null
          pdf_url: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["payroll_status"] | null
          updated_at: string | null
          year: number
        }
        Insert: {
          base_salary: number
          bonuses?: number | null
          company_id: string
          confirmed_at?: string | null
          created_at?: string | null
          employee_id: string
          gross_total: number
          id?: string
          inps_contribution: number
          irpef_tax: number
          month: number
          net_salary: number
          overtime_pay?: number | null
          pdf_url?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["payroll_status"] | null
          updated_at?: string | null
          year: number
        }
        Update: {
          base_salary?: number
          bonuses?: number | null
          company_id?: string
          confirmed_at?: string | null
          created_at?: string | null
          employee_id?: string
          gross_total?: number
          id?: string
          inps_contribution?: number
          irpef_tax?: number
          month?: number
          net_salary?: number
          overtime_pay?: number | null
          pdf_url?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["payroll_status"] | null
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      presence_records: {
        Row: {
          company_id: string
          created_at: string | null
          employee_id: string
          exclude_weekends: boolean | null
          id: string
          is_validated: boolean | null
          month: number
          night_holiday_hours: number | null
          other_absences: number | null
          overtime_hours: number | null
          sick_days: number | null
          updated_at: string | null
          vacation_days: number | null
          validated_at: string | null
          validated_by: string | null
          working_days: number | null
          year: number
        }
        Insert: {
          company_id: string
          created_at?: string | null
          employee_id: string
          exclude_weekends?: boolean | null
          id?: string
          is_validated?: boolean | null
          month: number
          night_holiday_hours?: number | null
          other_absences?: number | null
          overtime_hours?: number | null
          sick_days?: number | null
          updated_at?: string | null
          vacation_days?: number | null
          validated_at?: string | null
          validated_by?: string | null
          working_days?: number | null
          year: number
        }
        Update: {
          company_id?: string
          created_at?: string | null
          employee_id?: string
          exclude_weekends?: boolean | null
          id?: string
          is_validated?: boolean | null
          month?: number
          night_holiday_hours?: number | null
          other_absences?: number | null
          overtime_hours?: number | null
          sick_days?: number | null
          updated_at?: string | null
          vacation_days?: number | null
          validated_at?: string | null
          validated_by?: string | null
          working_days?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "presence_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presence_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_company_for_user: {
        Args: {
          _company_email: string
          _company_name: string
          _user_id: string
        }
        Returns: string
      }
      get_user_company: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role_in_company: {
        Args: {
          _company_id: string
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      absence_type: "ferie" | "malattia" | "permesso" | "congedo_parentale"
      contract_type:
        | "indeterminato"
        | "determinato"
        | "part_time"
        | "consulente"
      payroll_status: "bozza" | "generato" | "inviato" | "confermato"
      user_role: "admin" | "hr_manager" | "employee"
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
      absence_type: ["ferie", "malattia", "permesso", "congedo_parentale"],
      contract_type: [
        "indeterminato",
        "determinato",
        "part_time",
        "consulente",
      ],
      payroll_status: ["bozza", "generato", "inviato", "confermato"],
      user_role: ["admin", "hr_manager", "employee"],
    },
  },
} as const
