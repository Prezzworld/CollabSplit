CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(30) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id),
  project_name VARCHAR(255) NOT NULL,
  project_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(50) NOT NULL,
  percentage NUMERIC(5, 2) NOT NULL,
  bank_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (project_id, user_id)
);

CREATE TABLE payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  token VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_link_id UUID NOT NULL REFERENCES payment_links(id),
  amount NUMERIC(18, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  reference_id VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id),
  user_id UUID NOT NULL REFERENCES users(id),
  amount NUMERIC(18, 2) NOT NULL,
  percentage NUMERIC(5, 2) NOT NULL,
  bank_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  reference_id VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (payment_id, user_id)
);

ALTER TABLE project_members ADD CONSTRAINT percentage_range CHECK (percentage > 0 AND percentage <= 100);

CREATE TABLE countries (
  iso_code CHAR(2) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

INSERT INTO countries (iso_code, name)
VALUES
  ('DZ', 'Algeria'),
  ('AO', 'Angola'),
  ('BJ', 'Benin'),
  ('BW', 'Botswana'),
  ('BF', 'Burkina Faso'),
  ('BI', 'Burundi'),
  ('CV', 'Cabo Verde'),
  ('CM', 'Cameroon'),
  ('CF', 'Central African Republic'),
  ('TD', 'Chad'),
  ('KM', 'Comoros'),
  ('CG', 'Republic of the Congo'),
  ('CI', 'Côte d''Ivoire'),
  ('CD', 'Democratic Republic of the Congo'),
  ('DJ', 'Djibouti'),
  ('EG', 'Egypt'),
  ('GQ', 'Equatorial Guinea'),
  ('ER', 'Eritrea'),
  ('SZ', 'Eswatini'),
  ('ET', 'Ethiopia'),
  ('GA', 'Gabon'),
  ('GM', 'Gambia'),
  ('GH', 'Ghana'),
  ('GN', 'Guinea'),
  ('GW', 'Guinea-Bissau'),
  ('KE', 'Kenya'),
  ('LS', 'Lesotho'),
  ('LR', 'Liberia'),
  ('LY', 'Libya'),
  ('MG', 'Madagascar'),
  ('MW', 'Malawi'),
  ('ML', 'Mali'),
  ('MR', 'Mauritania'),
  ('MU', 'Mauritius'),
  ('MA', 'Morocco'),
  ('MZ', 'Mozambique'),
  ('NA', 'Namibia'),
  ('NE', 'Niger'),
  ('NG', 'Nigeria'),
  ('RW', 'Rwanda'),
  ('EH', 'Sahrawi Republic'),
  ('ST', 'São Tomé and Príncipe'),
  ('SN', 'Senegal'),
  ('SC', 'Seychelles'),
  ('SL', 'Sierra Leone'),
  ('SO', 'Somalia'),
  ('ZA', 'South Africa'),
  ('SS', 'South Sudan'),
  ('SD', 'Sudan'),
  ('TZ', 'Tanzania'),
  ('TG', 'Togo'),
  ('TN', 'Tunisia'),
  ('UG', 'Uganda'),
  ('ZM', 'Zambia'),
  ('ZW', 'Zimbabwe');

ALTER TABLE project_members
ADD COLUMN country CHAR(2) NOT NULL
REFERENCES countries(iso_code);


ALTER TABLE payouts
ADD COLUMN country CHAR(2) NOT NULL
REFERENCES countries(iso_code);

ALTER TABLE payment_links ADD CONSTRAINT payment_link_status_check CHECK (status IN ('active', 'inactive'));
ALTER TABLE payments ADD CONSTRAINT payment_status_check CHECK (status IN ('pending', 'successful', 'failed'));
ALTER TABLE payouts ADD CONSTRAINT payout_status_check CHECK (status IN ('pending', 'successful', 'failed'));
ALTER TABLE project_members ADD CONSTRAINT role_check CHECK (role IN ('owner', 'collaborator'));
ALTER TABLE projects ADD COLUMN status TEXT NOT NULL DEFAULT 'active', ADD CONSTRAINT status_check CHECK (status IN ('active', 'archived'));

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_members_updated_at
BEFORE UPDATE ON project_members
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payouts_updated_at
BEFORE UPDATE ON payouts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_links_updated_at
BEFORE UPDATE ON payment_links
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE payments ADD CONSTRAINT positive_amount CHECK (amount > 0);
ALTER TABLE payouts ADD CONSTRAINT positive_amount CHECK (amount > 0);

--one payment link per project
ALTER TABLE payment_links ADD CONSTRAINT unique_project_payment_link UNIQUE (project_id);

-- only one owner per project
CREATE UNIQUE INDEX unique_project_owner ON project_members (project_id) WHERE role = 'owner';

-- payout percentage check: sum of percentage shouldn't exceed 100 and below 0
ALTER TABLE payouts ADD CONSTRAINT payout_percentage_range CHECK (percentage > 0 AND percentage <= 100);

-- add bank codes payment provider will use to recognize banks
ALTER TABLE project_members ADD COLUMN bank_code VARCHAR(20);
ALTER TABLE payouts ADD COLUMN bank_code VARCHAR(20);

-- add currency column to payments, fees amount, payer details
ALTER TABLE payments ADD COLUMN currency CHAR(3) NOT NULL DEFAULT 'NGN';
ALTER TABLE payouts ADD COLUMN currency CHAR(3) NOT NULL DEFAULT 'NGN';
ALTER TABLE payments ADD COLUMN fees_amount NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (fees_amount >= 0);
ALTER TABLE payments ADD COLUMN payer_name TEXT;
ALTER TABLE payments ADD COLUMN payer_email TEXT;

-- Creating indexes for lookups
CREATE INDEX ON projects (owner_id);
CREATE INDEX ON project_members (user_id);
CREATE INDEX ON payments (payment_link_id);
CREATE INDEX ON payouts (user_id);