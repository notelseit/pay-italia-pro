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
      audit_logs: {
        Row: {
          action: string
          company_id: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_value: Json | null
          old_value: Json | null
          user_agent: string | null
          user_email: string
          user_id: string | null
        }
        Insert: {
          action: string
          company_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
          user_email: string
          user_id?: string | null
        }
        Update: {
          action?: string
          company_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
          user_email?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      ccnl_contracts: {
        Row: {
          base_salary: number | null
          company_id: string
          contractual_entities: Json | null
          created_at: string | null
          description: string | null
          fixed_term_allowed: boolean | null
          fourteenth_salary: boolean | null
          id: string
          inail_rate: number | null
          inps_rate: number | null
          is_active: boolean | null
          meal_voucher_amount: number | null
          meal_vouchers: boolean | null
          name: string
          notes: string | null
          notice_period_days: number | null
          other_contributions: Json | null
          overtime_rules: Json | null
          part_time_allowed: boolean | null
          permits: Json | null
          salary_table: Json | null
          sick_leave_days: number | null
          sick_leave_rules: Json | null
          thirteenth_salary: boolean | null
          trial_period_days: number | null
          trial_periods: Json | null
          updated_at: string | null
          vacation_days: number | null
          work_hours: number | null
        }
        Insert: {
          base_salary?: number | null
          company_id: string
          contractual_entities?: Json | null
          created_at?: string | null
          description?: string | null
          fixed_term_allowed?: boolean | null
          fourteenth_salary?: boolean | null
          id?: string
          inail_rate?: number | null
          inps_rate?: number | null
          is_active?: boolean | null
          meal_voucher_amount?: number | null
          meal_vouchers?: boolean | null
          name: string
          notes?: string | null
          notice_period_days?: number | null
          other_contributions?: Json | null
          overtime_rules?: Json | null
          part_time_allowed?: boolean | null
          permits?: Json | null
          salary_table?: Json | null
          sick_leave_days?: number | null
          sick_leave_rules?: Json | null
          thirteenth_salary?: boolean | null
          trial_period_days?: number | null
          trial_periods?: Json | null
          updated_at?: string | null
          vacation_days?: number | null
          work_hours?: number | null
        }
        Update: {
          base_salary?: number | null
          company_id?: string
          contractual_entities?: Json | null
          created_at?: string | null
          description?: string | null
          fixed_term_allowed?: boolean | null
          fourteenth_salary?: boolean | null
          id?: string
          inail_rate?: number | null
          inps_rate?: number | null
          is_active?: boolean | null
          meal_voucher_amount?: number | null
          meal_vouchers?: boolean | null
          name?: string
          notes?: string | null
          notice_period_days?: number | null
          other_contributions?: Json | null
          overtime_rules?: Json | null
          part_time_allowed?: boolean | null
          permits?: Json | null
          salary_table?: Json | null
          sick_leave_days?: number | null
          sick_leave_rules?: Json | null
          thirteenth_salary?: boolean | null
          trial_period_days?: number | null
          trial_periods?: Json | null
          updated_at?: string | null
          vacation_days?: number | null
          work_hours?: number | null
        }
        Relationships: []
      }
      ccnl_versions: {
        Row: {
          ccnl_id: string
          change_summary: string | null
          company_id: string
          created_at: string
          created_by: string | null
          data_json: Json
          id: string
          is_active: boolean
          version_number: number
        }
        Insert: {
          ccnl_id: string
          change_summary?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          data_json: Json
          id?: string
          is_active?: boolean
          version_number?: number
        }
        Update: {
          ccnl_id?: string
          change_summary?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          data_json?: Json
          id?: string
          is_active?: boolean
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "ccnl_versions_ccnl_id_fkey"
            columns: ["ccnl_id"]
            isOneToOne: false
            referencedRelation: "ccnl_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ccnl_versions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          default_ccnl_contract_id: string | null
          email: string | null
          id: string
          matricola_inps: string | null
          name: string
          parent_company_id: string | null
          phone: string | null
          posizione_inail: string | null
          postal_code: string | null
          province: string | null
          street_number: string | null
          updated_at: string | null
          vat_number: string | null
          voce_inail: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          default_ccnl_contract_id?: string | null
          email?: string | null
          id?: string
          matricola_inps?: string | null
          name: string
          parent_company_id?: string | null
          phone?: string | null
          posizione_inail?: string | null
          postal_code?: string | null
          province?: string | null
          street_number?: string | null
          updated_at?: string | null
          vat_number?: string | null
          voce_inail?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          default_ccnl_contract_id?: string | null
          email?: string | null
          id?: string
          matricola_inps?: string | null
          name?: string
          parent_company_id?: string | null
          phone?: string | null
          posizione_inail?: string | null
          postal_code?: string | null
          province?: string | null
          street_number?: string | null
          updated_at?: string | null
          vat_number?: string | null
          voce_inail?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_default_ccnl_contract_id_fkey"
            columns: ["default_ccnl_contract_id"]
            isOneToOne: false
            referencedRelation: "ccnl_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_parent_company_id_fkey"
            columns: ["parent_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_versions: {
        Row: {
          change_summary: string | null
          company_id: string
          contract_id: string
          created_at: string
          created_by: string | null
          data_json: Json
          id: string
          is_active: boolean
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          company_id: string
          contract_id: string
          created_at?: string
          created_by?: string | null
          data_json: Json
          id?: string
          is_active?: boolean
          version_number?: number
        }
        Update: {
          change_summary?: string | null
          company_id?: string
          contract_id?: string
          created_at?: string
          created_by?: string | null
          data_json?: Json
          id?: string
          is_active?: boolean
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "contract_versions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_versions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "employment_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_signatures: {
        Row: {
          company_id: string
          created_at: string | null
          document_id: string | null
          id: string
          ip_address: string | null
          is_valid: boolean | null
          judgment_id: string | null
          signature_data: string
          signature_hash: string
          signed_by: string
          timestamp: string
          user_agent: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          ip_address?: string | null
          is_valid?: boolean | null
          judgment_id?: string | null
          signature_data: string
          signature_hash: string
          signed_by: string
          timestamp?: string
          user_agent?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          document_id?: string | null
          id?: string
          ip_address?: string | null
          is_valid?: boolean | null
          judgment_id?: string | null
          signature_data?: string
          signature_hash?: string
          signed_by?: string
          timestamp?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_signatures_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_signatures_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "medical_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_signatures_judgment_id_fkey"
            columns: ["judgment_id"]
            isOneToOne: false
            referencedRelation: "fitness_judgments"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          company_id: string
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          category: string
          company_id: string
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string
          company_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_events: {
        Row: {
          company_id: string
          created_at: string
          entity_id: string
          entity_type: string
          event_type: string
          id: string
          payload: Json | null
          user_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          entity_id: string
          entity_type: string
          event_type: string
          id?: string
          payload?: Json | null
          user_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          event_type?: string
          id?: string
          payload?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "domain_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      dvr_risks: {
        Row: {
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          risk_category: string
          risk_code: string
          risk_name: string
          severity_level: string | null
          suggested_protocols: Json | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          risk_category: string
          risk_code: string
          risk_name: string
          severity_level?: string | null
          suggested_protocols?: Json | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          risk_category?: string
          risk_code?: string
          risk_name?: string
          severity_level?: string | null
          suggested_protocols?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dvr_risks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      education_records: {
        Row: {
          company_id: string
          created_at: string | null
          date: string | null
          document_url: string | null
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
          document_url?: string | null
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
          document_url?: string | null
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
      email_logs: {
        Row: {
          company_id: string
          error_message: string | null
          full_log: Json | null
          id: string
          recipient_email: string
          sent_at: string
          status: string
          subject: string
          template_type: string | null
        }
        Insert: {
          company_id: string
          error_message?: string | null
          full_log?: Json | null
          id?: string
          recipient_email: string
          sent_at?: string
          status: string
          subject: string
          template_type?: string | null
        }
        Update: {
          company_id?: string
          error_message?: string | null
          full_log?: Json | null
          id?: string
          recipient_email?: string
          sent_at?: string
          status?: string
          subject?: string
          template_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      email_settings: {
        Row: {
          created_at: string | null
          from_email: string
          from_name: string
          id: string
          smtp_host: string
          smtp_port: number
          smtp_secure: boolean | null
          smtp_user: string
          updated_at: string | null
          use_custom_smtp: boolean | null
        }
        Insert: {
          created_at?: string | null
          from_email: string
          from_name?: string
          id?: string
          smtp_host: string
          smtp_port: number
          smtp_secure?: boolean | null
          smtp_user: string
          updated_at?: string | null
          use_custom_smtp?: boolean | null
        }
        Update: {
          created_at?: string | null
          from_email?: string
          from_name?: string
          id?: string
          smtp_host?: string
          smtp_port?: number
          smtp_secure?: boolean | null
          smtp_user?: string
          updated_at?: string | null
          use_custom_smtp?: boolean | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          company_id: string
          created_at: string | null
          html_body: string
          id: string
          is_active: boolean | null
          name: string
          sender_email: string | null
          sender_name: string
          subject: string
          template_type: Database["public"]["Enums"]["email_template_type"]
          text_body: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          html_body: string
          id?: string
          is_active?: boolean | null
          name: string
          sender_email?: string | null
          sender_name?: string
          subject: string
          template_type: Database["public"]["Enums"]["email_template_type"]
          text_body?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          html_body?: string
          id?: string
          is_active?: boolean | null
          name?: string
          sender_email?: string | null
          sender_name?: string
          subject?: string
          template_type?: Database["public"]["Enums"]["email_template_type"]
          text_body?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          base_salary: number
          birth_date: string | null
          ccnl_contract_id: string | null
          city: string | null
          company_id: string
          contract_type: Database["public"]["Enums"]["contract_type"]
          country: string | null
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
          postal_code: string | null
          province: string | null
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
          birth_date?: string | null
          ccnl_contract_id?: string | null
          city?: string | null
          company_id: string
          contract_type: Database["public"]["Enums"]["contract_type"]
          country?: string | null
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
          postal_code?: string | null
          province?: string | null
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
          birth_date?: string | null
          ccnl_contract_id?: string | null
          city?: string | null
          company_id?: string
          contract_type?: Database["public"]["Enums"]["contract_type"]
          country?: string | null
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
          postal_code?: string | null
          province?: string | null
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
            foreignKeyName: "employees_ccnl_contract_id_fkey"
            columns: ["ccnl_contract_id"]
            isOneToOne: false
            referencedRelation: "ccnl_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      employment_contracts: {
        Row: {
          additional_clauses: string | null
          base_salary: number
          benefits: string | null
          company_id: string
          contract_name: string
          contract_type: string
          created_at: string
          created_by: string | null
          employee_id: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          is_template: boolean | null
          job_description: string | null
          job_title: string | null
          notice_period_days: number | null
          start_date: string
          trial_period_days: number | null
          updated_at: string
          work_location: string | null
          working_hours: number
        }
        Insert: {
          additional_clauses?: string | null
          base_salary: number
          benefits?: string | null
          company_id: string
          contract_name: string
          contract_type: string
          created_at?: string
          created_by?: string | null
          employee_id?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_template?: boolean | null
          job_description?: string | null
          job_title?: string | null
          notice_period_days?: number | null
          start_date: string
          trial_period_days?: number | null
          updated_at?: string
          work_location?: string | null
          working_hours?: number
        }
        Update: {
          additional_clauses?: string | null
          base_salary?: number
          benefits?: string | null
          company_id?: string
          contract_name?: string
          contract_type?: string
          created_at?: string
          created_by?: string | null
          employee_id?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_template?: boolean | null
          job_description?: string | null
          job_title?: string | null
          notice_period_days?: number | null
          start_date?: string
          trial_period_days?: number | null
          updated_at?: string
          work_location?: string | null
          working_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "employment_contracts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      fitness_judgments: {
        Row: {
          company_id: string
          created_at: string | null
          document_url: string | null
          employee_id: string
          expiry_date: string | null
          id: string
          judgment_date: string
          judgment_type: string
          limitations: string | null
          notes: string | null
          prescriptions: string | null
          updated_at: string | null
          visit_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          document_url?: string | null
          employee_id: string
          expiry_date?: string | null
          id?: string
          judgment_date: string
          judgment_type: string
          limitations?: string | null
          notes?: string | null
          prescriptions?: string | null
          updated_at?: string | null
          visit_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          document_url?: string | null
          employee_id?: string
          expiry_date?: string | null
          id?: string
          judgment_date?: string
          judgment_type?: string
          limitations?: string | null
          notes?: string | null
          prescriptions?: string | null
          updated_at?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fitness_judgments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fitness_judgments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fitness_judgments_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "medical_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      ftp_upload_logs: {
        Row: {
          company_id: string
          error_message: string | null
          file_category: string
          file_name: string
          file_size: number | null
          id: string
          upload_status: string
          uploaded_at: string
        }
        Insert: {
          company_id: string
          error_message?: string | null
          file_category: string
          file_name: string
          file_size?: number | null
          id?: string
          upload_status: string
          uploaded_at?: string
        }
        Update: {
          company_id?: string
          error_message?: string | null
          file_category?: string
          file_name?: string
          file_size?: number | null
          id?: string
          upload_status?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ftp_upload_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_news_sources: {
        Row: {
          created_at: string | null
          description: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          id: string
          is_active: boolean | null
          mime_type: string | null
          name: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          name: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          mime_type?: string | null
          name?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      job_role_protocols: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          job_role: string
          protocol_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          job_role: string
          protocol_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          job_role?: string
          protocol_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_role_protocols_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_role_protocols_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "medical_protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_convocations: {
        Row: {
          company_id: string
          convocation_date: string | null
          created_at: string | null
          employee_id: string
          id: string
          message_content: string | null
          notification_type: string
          sent_at: string | null
          status: string
          visit_id: string
        }
        Insert: {
          company_id: string
          convocation_date?: string | null
          created_at?: string | null
          employee_id: string
          id?: string
          message_content?: string | null
          notification_type: string
          sent_at?: string | null
          status?: string
          visit_id: string
        }
        Update: {
          company_id?: string
          convocation_date?: string | null
          created_at?: string | null
          employee_id?: string
          id?: string
          message_content?: string | null
          notification_type?: string
          sent_at?: string | null
          status?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_convocations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_convocations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_convocations_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "medical_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_documents: {
        Row: {
          company_id: string
          created_at: string | null
          document_type: string
          employee_id: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          medical_record_id: string | null
          mime_type: string | null
          notes: string | null
          updated_at: string | null
          uploaded_by: string | null
          visit_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          document_type: string
          employee_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          medical_record_id?: string | null
          mime_type?: string | null
          notes?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          visit_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          document_type?: string
          employee_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          medical_record_id?: string | null
          mime_type?: string | null
          notes?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_documents_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_documents_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "medical_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_protocols: {
        Row: {
          allegato_3b_mapping: Json | null
          company_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          reference_law: string | null
          risk_assessment: string | null
          updated_at: string | null
        }
        Insert: {
          allegato_3b_mapping?: Json | null
          company_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          reference_law?: string | null
          risk_assessment?: string | null
          updated_at?: string | null
        }
        Update: {
          allegato_3b_mapping?: Json | null
          company_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          reference_law?: string | null
          risk_assessment?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_protocols_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          closed_at: string | null
          company_id: string
          created_at: string | null
          employee_id: string
          family_history: string | null
          id: string
          notes: string | null
          opened_at: string | null
          personal_history: string | null
          protocol_id: string | null
          recent_pathology: string | null
          remote_pathology: string | null
          risk_profile: Json | null
          status: string
          updated_at: string | null
          work_history: string | null
        }
        Insert: {
          closed_at?: string | null
          company_id: string
          created_at?: string | null
          employee_id: string
          family_history?: string | null
          id?: string
          notes?: string | null
          opened_at?: string | null
          personal_history?: string | null
          protocol_id?: string | null
          recent_pathology?: string | null
          remote_pathology?: string | null
          risk_profile?: Json | null
          status?: string
          updated_at?: string | null
          work_history?: string | null
        }
        Update: {
          closed_at?: string | null
          company_id?: string
          created_at?: string | null
          employee_id?: string
          family_history?: string | null
          id?: string
          notes?: string | null
          opened_at?: string | null
          personal_history?: string | null
          protocol_id?: string | null
          recent_pathology?: string | null
          remote_pathology?: string | null
          risk_profile?: Json | null
          status?: string
          updated_at?: string | null
          work_history?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "medical_protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_visits: {
        Row: {
          additional_tests: Json | null
          company_id: string
          completed_date: string | null
          created_at: string | null
          doctor_name: string | null
          employee_id: string
          id: string
          medical_record_id: string | null
          notes: string | null
          objective_examination: string | null
          scheduled_date: string
          status: string
          target_organs: string | null
          updated_at: string | null
          visit_type: string
        }
        Insert: {
          additional_tests?: Json | null
          company_id: string
          completed_date?: string | null
          created_at?: string | null
          doctor_name?: string | null
          employee_id: string
          id?: string
          medical_record_id?: string | null
          notes?: string | null
          objective_examination?: string | null
          scheduled_date: string
          status?: string
          target_organs?: string | null
          updated_at?: string | null
          visit_type: string
        }
        Update: {
          additional_tests?: Json | null
          company_id?: string
          completed_date?: string | null
          created_at?: string | null
          doctor_name?: string | null
          employee_id?: string
          id?: string
          medical_record_id?: string | null
          notes?: string | null
          objective_examination?: string | null
          scheduled_date?: string
          status?: string
          target_organs?: string | null
          updated_at?: string | null
          visit_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_visits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_visits_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_visits_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          company_id: string
          created_at: string | null
          days_before_expiry: number
          email_error: string | null
          email_recipient: string | null
          email_sent: boolean | null
          email_status: string | null
          employee_id: string | null
          id: string
          message_content: string | null
          notification_date: string | null
          notification_type: string
          reference_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          days_before_expiry: number
          email_error?: string | null
          email_recipient?: string | null
          email_sent?: boolean | null
          email_status?: string | null
          employee_id?: string | null
          id?: string
          message_content?: string | null
          notification_date?: string | null
          notification_type: string
          reference_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          days_before_expiry?: number
          email_error?: string | null
          email_recipient?: string | null
          email_sent?: boolean | null
          email_status?: string | null
          employee_id?: string | null
          id?: string
          message_content?: string | null
          notification_date?: string | null
          notification_type?: string
          reference_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          company_id: string
          created_at: string | null
          days_before_expiry: number[]
          id: string
          is_active: boolean | null
          notification_type: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          days_before_expiry?: number[]
          id?: string
          is_active?: boolean | null
          notification_type: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          days_before_expiry?: number[]
          id?: string
          is_active?: boolean | null
          notification_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_company_id_fkey"
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
          ccnl_version_id: string | null
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
          payroll_settings_version_id: string | null
          pdf_url: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["payroll_status"] | null
          updated_at: string | null
          year: number
        }
        Insert: {
          base_salary: number
          bonuses?: number | null
          ccnl_version_id?: string | null
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
          payroll_settings_version_id?: string | null
          pdf_url?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["payroll_status"] | null
          updated_at?: string | null
          year: number
        }
        Update: {
          base_salary?: number
          bonuses?: number | null
          ccnl_version_id?: string | null
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
          payroll_settings_version_id?: string | null
          pdf_url?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["payroll_status"] | null
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_records_ccnl_version_id_fkey"
            columns: ["ccnl_version_id"]
            isOneToOne: false
            referencedRelation: "ccnl_versions"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "payroll_records_payroll_settings_version_id_fkey"
            columns: ["payroll_settings_version_id"]
            isOneToOne: false
            referencedRelation: "payroll_settings_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_settings: {
        Row: {
          company_id: string
          created_at: string | null
          deduction_per_child: number
          id: string
          inail_rate: number
          inps_employee_rate: number
          inps_employer_rate: number
          irpef_brackets: Json
          municipal_tax_rate: number
          regional_tax_rate: number
          tfr_rate: number
          updated_at: string | null
          work_deductions: Json
        }
        Insert: {
          company_id: string
          created_at?: string | null
          deduction_per_child?: number
          id?: string
          inail_rate?: number
          inps_employee_rate?: number
          inps_employer_rate?: number
          irpef_brackets?: Json
          municipal_tax_rate?: number
          regional_tax_rate?: number
          tfr_rate?: number
          updated_at?: string | null
          work_deductions?: Json
        }
        Update: {
          company_id?: string
          created_at?: string | null
          deduction_per_child?: number
          id?: string
          inail_rate?: number
          inps_employee_rate?: number
          inps_employer_rate?: number
          irpef_brackets?: Json
          municipal_tax_rate?: number
          regional_tax_rate?: number
          tfr_rate?: number
          updated_at?: string | null
          work_deductions?: Json
        }
        Relationships: [
          {
            foreignKeyName: "payroll_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_settings_versions: {
        Row: {
          change_summary: string | null
          company_id: string
          created_at: string
          created_by: string | null
          data_json: Json
          id: string
          is_active: boolean
          payroll_settings_id: string
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          data_json: Json
          id?: string
          is_active?: boolean
          payroll_settings_id: string
          version_number?: number
        }
        Update: {
          change_summary?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          data_json?: Json
          id?: string
          is_active?: boolean
          payroll_settings_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_settings_versions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_settings_versions_payroll_settings_id_fkey"
            columns: ["payroll_settings_id"]
            isOneToOne: false
            referencedRelation: "payroll_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_access_logs: {
        Row: {
          accessed_at: string
          company_id: string | null
          company_name: string
          id: string
          ip_address: string
          user_agent: string | null
          user_id: string | null
          user_name: string
        }
        Insert: {
          accessed_at?: string
          company_id?: string | null
          company_name: string
          id?: string
          ip_address: string
          user_agent?: string | null
          user_id?: string | null
          user_name: string
        }
        Update: {
          accessed_at?: string
          company_id?: string | null
          company_name?: string
          id?: string
          ip_address?: string
          user_agent?: string | null
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_access_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      presence_records: {
        Row: {
          allowances: number | null
          bilateral_entity_amount: number | null
          company_id: string
          created_at: string | null
          deductions: number | null
          employee_id: string
          exclude_weekends: boolean | null
          id: string
          is_validated: boolean | null
          mandatory_maternity_days: number | null
          maternity_code_ma1: boolean | null
          month: number
          night_holiday_hours: number | null
          other_absences: number | null
          overtime_hours: number | null
          parental_leave_pg4_days: number | null
          parental_leave_pg5_days: number | null
          sick_days: number | null
          updated_at: string | null
          vacation_days: number | null
          validated_at: string | null
          validated_by: string | null
          wage_integration: number | null
          working_days: number | null
          year: number
        }
        Insert: {
          allowances?: number | null
          bilateral_entity_amount?: number | null
          company_id: string
          created_at?: string | null
          deductions?: number | null
          employee_id: string
          exclude_weekends?: boolean | null
          id?: string
          is_validated?: boolean | null
          mandatory_maternity_days?: number | null
          maternity_code_ma1?: boolean | null
          month: number
          night_holiday_hours?: number | null
          other_absences?: number | null
          overtime_hours?: number | null
          parental_leave_pg4_days?: number | null
          parental_leave_pg5_days?: number | null
          sick_days?: number | null
          updated_at?: string | null
          vacation_days?: number | null
          validated_at?: string | null
          validated_by?: string | null
          wage_integration?: number | null
          working_days?: number | null
          year: number
        }
        Update: {
          allowances?: number | null
          bilateral_entity_amount?: number | null
          company_id?: string
          created_at?: string | null
          deductions?: number | null
          employee_id?: string
          exclude_weekends?: boolean | null
          id?: string
          is_validated?: boolean | null
          mandatory_maternity_days?: number | null
          maternity_code_ma1?: boolean | null
          month?: number
          night_holiday_hours?: number | null
          other_absences?: number | null
          overtime_hours?: number | null
          parental_leave_pg4_days?: number | null
          parental_leave_pg5_days?: number | null
          sick_days?: number | null
          updated_at?: string | null
          vacation_days?: number | null
          validated_at?: string | null
          validated_by?: string | null
          wage_integration?: number | null
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
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: string | null
          is_active: boolean | null
          last_activity_at: string | null
          location_info: Json | null
          refresh_token_hash: string | null
          revoked_at: string | null
          revoked_reason: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity_at?: string | null
          location_info?: Json | null
          refresh_token_hash?: string | null
          revoked_at?: string | null
          revoked_reason?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity_at?: string | null
          location_info?: Json | null
          refresh_token_hash?: string | null
          revoked_at?: string | null
          revoked_reason?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vaccinations: {
        Row: {
          administration_date: string
          batch_number: string | null
          company_id: string
          created_at: string | null
          employee_id: string
          expiry_date: string | null
          id: string
          medical_record_id: string | null
          notes: string | null
          updated_at: string | null
          vaccine_name: string
        }
        Insert: {
          administration_date: string
          batch_number?: string | null
          company_id: string
          created_at?: string | null
          employee_id: string
          expiry_date?: string | null
          id?: string
          medical_record_id?: string | null
          notes?: string | null
          updated_at?: string | null
          vaccine_name: string
        }
        Update: {
          administration_date?: string
          batch_number?: string | null
          company_id?: string
          created_at?: string | null
          employee_id?: string
          expiry_date?: string | null
          id?: string
          medical_record_id?: string | null
          notes?: string | null
          updated_at?: string | null
          vaccine_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccinations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccinations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccinations_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "medical_records"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_checklists: {
        Row: {
          checklist_items: Json
          company_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          employee_id: string
          id: string
          reminder_sent: boolean | null
          reminder_sent_at: string | null
          updated_at: string | null
          visit_id: string
        }
        Insert: {
          checklist_items?: Json
          company_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          employee_id: string
          id?: string
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          updated_at?: string | null
          visit_id: string
        }
        Update: {
          checklist_items?: Json
          company_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          employee_id?: string
          id?: string
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          updated_at?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_checklists_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_checklists_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_checklists_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "medical_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_confirmations: {
        Row: {
          company_id: string
          confirmation_token: string
          confirmed_at: string | null
          created_at: string | null
          email_sent: boolean | null
          email_sent_at: string | null
          employee_id: string
          id: string
          status: string
          updated_at: string | null
          visit_id: string
        }
        Insert: {
          company_id: string
          confirmation_token?: string
          confirmed_at?: string | null
          created_at?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          employee_id: string
          id?: string
          status?: string
          updated_at?: string | null
          visit_id: string
        }
        Update: {
          company_id?: string
          confirmation_token?: string
          confirmed_at?: string | null
          created_at?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          employee_id?: string
          id?: string
          status?: string
          updated_at?: string | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_confirmations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_confirmations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_confirmations_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "medical_visits"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_sessions: { Args: never; Returns: number }
      create_company_for_user: {
        Args: {
          _company_email: string
          _company_name: string
          _user_id: string
        }
        Returns: string
      }
      get_medical_timeline: {
        Args: { p_company_id: string; p_employee_id: string }
        Returns: {
          description: string
          event_date: string
          event_type: string
          id: string
          is_future: boolean
          metadata: Json
          status: string
          title: string
        }[]
      }
      get_user_company: { Args: { _user_id: string }; Returns: string }
      has_role_in_company: {
        Args: {
          _company_id: string
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_superadmin: { Args: { _user_id: string }; Returns: boolean }
      update_session_activity: {
        Args: { p_session_token: string }
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
      email_template_type:
        | "reset_password"
        | "payroll_delivery"
        | "general_communication"
        | "welcome"
        | "notification"
      payroll_status: "bozza" | "generato" | "inviato" | "confermato"
      user_role:
        | "admin"
        | "hr_manager"
        | "employee"
        | "superadmin"
        | "admin_sub_azienda"
        | "medical_officer"
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
      email_template_type: [
        "reset_password",
        "payroll_delivery",
        "general_communication",
        "welcome",
        "notification",
      ],
      payroll_status: ["bozza", "generato", "inviato", "confermato"],
      user_role: [
        "admin",
        "hr_manager",
        "employee",
        "superadmin",
        "admin_sub_azienda",
        "medical_officer",
      ],
    },
  },
} as const
