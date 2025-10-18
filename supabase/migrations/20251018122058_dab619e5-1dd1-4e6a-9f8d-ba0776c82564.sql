-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'hr_manager', 'employee');

-- Create enum for contract types
CREATE TYPE contract_type AS ENUM ('indeterminato', 'determinato', 'part_time', 'consulente');

-- Create enum for absence types
CREATE TYPE absence_type AS ENUM ('ferie', 'malattia', 'permesso', 'congedo_parentale');

-- Create enum for payroll status
CREATE TYPE payroll_status AS ENUM ('bozza', 'generato', 'inviato', 'confermato');

-- Companies table (multi-tenant)
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  vat_number TEXT UNIQUE,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, company_id, role)
);

-- Employees table
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  tax_code TEXT NOT NULL,
  contract_type contract_type NOT NULL,
  base_salary DECIMAL(10, 2) NOT NULL,
  hire_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Presence records table
CREATE TABLE public.presence_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  working_days INTEGER DEFAULT 0,
  vacation_days INTEGER DEFAULT 0,
  sick_days INTEGER DEFAULT 0,
  other_absences INTEGER DEFAULT 0,
  overtime_hours DECIMAL(5, 2) DEFAULT 0,
  is_validated BOOLEAN DEFAULT FALSE,
  validated_by UUID REFERENCES auth.users(id),
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, month, year)
);

-- Payroll records table
CREATE TABLE public.payroll_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  base_salary DECIMAL(10, 2) NOT NULL,
  bonuses DECIMAL(10, 2) DEFAULT 0,
  overtime_pay DECIMAL(10, 2) DEFAULT 0,
  gross_total DECIMAL(10, 2) NOT NULL,
  inps_contribution DECIMAL(10, 2) NOT NULL,
  irpef_tax DECIMAL(10, 2) NOT NULL,
  net_salary DECIMAL(10, 2) NOT NULL,
  status payroll_status DEFAULT 'bozza',
  pdf_url TEXT,
  sent_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, month, year)
);

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presence_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role_in_company(_user_id UUID, _company_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND company_id = _company_id
      AND role = _role
  )
$$;

-- Create security definer function to get user's company
CREATE OR REPLACE FUNCTION public.get_user_company(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id
  FROM public.profiles
  WHERE id = _user_id
  LIMIT 1
$$;

-- RLS Policies for companies
CREATE POLICY "Users can view their own company"
  ON public.companies FOR SELECT
  USING (id = public.get_user_company(auth.uid()));

CREATE POLICY "Admins can update their company"
  ON public.companies FOR UPDATE
  USING (public.has_role_in_company(auth.uid(), id, 'admin') OR public.has_role_in_company(auth.uid(), id, 'hr_manager'));

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles in their company"
  ON public.profiles FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- RLS Policies for user_roles
CREATE POLICY "Users can view roles in their company"
  ON public.user_roles FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role_in_company(auth.uid(), company_id, 'admin'));

-- RLS Policies for employees
CREATE POLICY "Users can view employees in their company"
  ON public.employees FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "HR can manage employees"
  ON public.employees FOR ALL
  USING (public.has_role_in_company(auth.uid(), company_id, 'admin') OR public.has_role_in_company(auth.uid(), company_id, 'hr_manager'));

-- RLS Policies for presence_records
CREATE POLICY "Users can view presence in their company"
  ON public.presence_records FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "HR can manage presence records"
  ON public.presence_records FOR ALL
  USING (public.has_role_in_company(auth.uid(), company_id, 'admin') OR public.has_role_in_company(auth.uid(), company_id, 'hr_manager'));

-- RLS Policies for payroll_records
CREATE POLICY "Users can view payroll in their company"
  ON public.payroll_records FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "HR can manage payroll records"
  ON public.payroll_records FOR ALL
  USING (public.has_role_in_company(auth.uid(), company_id, 'admin') OR public.has_role_in_company(auth.uid(), company_id, 'hr_manager'));

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_presence_records_updated_at BEFORE UPDATE ON public.presence_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_records_updated_at BEFORE UPDATE ON public.payroll_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utente'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();