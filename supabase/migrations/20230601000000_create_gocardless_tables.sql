
-- Create tables for GoCardless integration

-- Table for storing GoCardless requisitions
CREATE TABLE IF NOT EXISTS gocardless_requisitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL,
  requisition_id TEXT NOT NULL,
  institution_id TEXT NOT NULL,
  reference TEXT,
  status TEXT NOT NULL,
  UNIQUE(requisition_id)
);

-- Table for storing GoCardless accounts
CREATE TABLE IF NOT EXISTS gocardless_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL,
  account_id TEXT NOT NULL,
  requisition_id TEXT NOT NULL,
  institution_id TEXT NOT NULL,
  institution_name TEXT,
  name TEXT,
  iban TEXT,
  bban TEXT,
  bic TEXT,
  currency TEXT,
  balance NUMERIC,
  status TEXT DEFAULT 'active',
  UNIQUE(account_id)
);

-- Add comment explaining tables
COMMENT ON TABLE gocardless_requisitions IS 'Stores GoCardless requisitions created by users';
COMMENT ON TABLE gocardless_accounts IS 'Stores bank accounts retrieved from GoCardless';
