/*
  # Yoga Institute Student Management System Database Schema

  ## Overview
  This migration creates the complete database structure for managing yoga institute students and batches,
  including payment tracking and automated reminder systems.

  ## New Tables

  ### 1. `batches`
  Stores batch information including timing and schedule
  - `id` (uuid, primary key) - Unique identifier for each batch
  - `name` (text) - Name of the batch
  - `timing` (text) - Batch timing (e.g., "6:00 AM - 7:00 AM")
  - `weekly_days` (text[]) - Array of days when batch runs (e.g., ["Monday", "Wednesday", "Friday"])
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `students`
  Stores comprehensive student information and payment details
  - `id` (uuid, primary key) - Unique identifier for each student
  - `batch_id` (uuid, foreign key) - References batches table
  - `name` (text) - Student's full name
  - `whatsapp_number` (text) - WhatsApp contact number
  - `admission_date` (date) - Date of admission
  - `due_date` (integer) - Day of month when payment is due (1-31)
  - `fees_amount` (numeric) - Monthly fees amount
  - `payment_status` (text) - Current payment status: 'paid' or 'unpaid'
  - `payment_bank` (text) - Bank used for payment
  - `last_payment_date` (timestamptz) - Timestamp of last payment
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `payment_history`
  Tracks all payment transactions for audit and history
  - `id` (uuid, primary key) - Unique identifier for each payment record
  - `student_id` (uuid, foreign key) - References students table
  - `payment_date` (timestamptz) - Date when payment was made
  - `amount` (numeric) - Payment amount
  - `status` (text) - Payment status
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security

  1. Row Level Security (RLS) Enabled
     - All tables have RLS enabled for data protection
     
  2. Policies Created
     - Authenticated users can perform all operations on batches
     - Authenticated users can perform all operations on students
     - Authenticated users can perform all operations on payment_history
     - Public read access for batches and students (for dashboard display)

  ## Indexes
  - Index on students.batch_id for faster batch-student queries
  - Index on students.payment_status for payment filtering
  - Index on payment_history.student_id for payment history retrieval

  ## Important Notes
  - Due date is stored as day of month (1-31) based on admission date
  - Payment status defaults to 'unpaid' for new students
  - Triggers automatically update updated_at timestamps
  - Foreign key constraints ensure data integrity
*/

-- Create batches table
CREATE TABLE IF NOT EXISTS batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  timing text NOT NULL,
  schedule jsonb DEFAULT '[]'::jsonb,
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid REFERENCES batches(id) ON DELETE SET NULL,
  name text NOT NULL,
  whatsapp_number text NOT NULL,
  admission_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date integer NOT NULL CHECK (due_date >= 1 AND due_date <= 31),
  fees_amount numeric(10, 2) NOT NULL,
  payment_status text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid')),
  payment_bank text DEFAULT '',
  last_payment_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  receipt_provided boolean DEFAULT false,
);

-- Create payment history table
CREATE TABLE IF NOT EXISTS payment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  payment_date timestamptz DEFAULT now(),
  amount numeric(10, 2) NOT NULL,
  status text NOT NULL DEFAULT 'paid',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_batch_id ON students(batch_id);
CREATE INDEX IF NOT EXISTS idx_students_payment_status ON students(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_history_student_id ON payment_history(student_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
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

-- Enable Row Level Security
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Create policies for batches
CREATE POLICY "Allow public read access to batches"
  ON batches FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert batches"
  ON batches FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update batches"
  ON batches FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete batches"
  ON batches FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for students
CREATE POLICY "Allow public read access to students"
  ON students FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert students"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update students"
  ON students FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete students"
  ON students FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for payment_history
CREATE POLICY "Allow public read access to payment_history"
  ON payment_history FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert payment_history"
  ON payment_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update payment_history"
  ON payment_history FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete payment_history"
  ON payment_history FOR DELETE
  TO authenticated
  USING (true);