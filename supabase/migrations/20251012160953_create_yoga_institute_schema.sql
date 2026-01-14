/*
  # Yoga Institute Student Management System Database Schema (Modified)

  ## Overview
  This migration creates the complete database structure based on the provided schema dump.
  It aligns with the code requiring `batches` (with JSON scheduling), `students`, and `profiles` linked to Auth.

  ## Tables
  1. `batches` - Stores class batches and JSON schedules.
  2. `profiles` - Extends Supabase Auth with verification status.
  3. `students` - Main student records with payment status tracking.
  4. `payment_history` - Transaction logs (Retained from original schema).
*/

-- 1. Helper Function for Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create batches table
CREATE TABLE IF NOT EXISTS public.batches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  schedule jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT batches_pkey PRIMARY KEY (id)
);

-- 3. Create profiles table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  email text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 4. Create students table
CREATE TABLE IF NOT EXISTS public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  batch_id uuid DEFAULT NULL, -- Fixed: changed from gen_random_uuid() to prevent FK errors
  name text NOT NULL,
  whatsapp_number text NOT NULL,
  admission_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date integer NOT NULL,
  fees_amount numeric NOT NULL,
  payment_status text NOT NULL DEFAULT 'unpaid',
  payment_bank text DEFAULT '',
  last_payment_date timestamptz,
  receipt_provided boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT students_pkey PRIMARY KEY (id),
  CONSTRAINT students_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL,
  CONSTRAINT students_due_date_check CHECK (due_date >= 1 AND due_date <= 31),
  CONSTRAINT students_payment_status_check CHECK (payment_status IN ('paid', 'unpaid'))
);

-- 5. Create payment_history table (Retained for consistency)
CREATE TABLE IF NOT EXISTS public.payment_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  payment_date timestamptz DEFAULT now(),
  amount numeric(10, 2) NOT NULL,
  status text NOT NULL DEFAULT 'paid',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT payment_history_pkey PRIMARY KEY (id)
);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_students_batch_id ON public.students USING btree (batch_id);
CREATE INDEX IF NOT EXISTS idx_students_payment_status ON public.students USING btree (payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_history_student_id ON public.payment_history USING btree (student_id);

-- 7. Triggers
DROP TRIGGER IF EXISTS update_batches_updated_at ON batches;
CREATE TRIGGER update_batches_updated_at
  BEFORE UPDATE ON batches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_students_updated_at ON students;
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Row Level Security (RLS)
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- 9. Policies

-- Profiles: Users can only see their own profile
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT TO authenticated 
  USING (auth.uid() = id);

-- Batches: Public read, Authenticated write
CREATE POLICY "Allow public read access to batches" 
  ON batches FOR SELECT TO public 
  USING (true);

CREATE POLICY "Allow authenticated users full access to batches" 
  ON batches FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

-- Students: Public read, Authenticated write
CREATE POLICY "Allow public read access to students" 
  ON students FOR SELECT TO public 
  USING (true);

CREATE POLICY "Allow authenticated users full access to students" 
  ON students FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

-- Payment History: Public read, Authenticated write
CREATE POLICY "Allow public read access to payment_history" 
  ON payment_history FOR SELECT TO public 
  USING (true);

CREATE POLICY "Allow authenticated users full access to payment_history" 
  ON payment_history FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);