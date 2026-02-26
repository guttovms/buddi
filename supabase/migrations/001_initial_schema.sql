-- =============================================
-- OrçaRápido - Schema Inicial
-- =============================================

-- Perfis (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT,
  owner_name TEXT,
  phone TEXT,
  email TEXT,
  document TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  logo_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  mp_subscription_id TEXT,
  budgets_this_month INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Serviços pré-cadastrados
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT DEFAULT 'un',
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Clientes
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  document TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orçamentos
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  number SERIAL,
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'enviado', 'aprovado', 'recusado')),
  payment_conditions TEXT,
  validity_days INT DEFAULT 30,
  notes TEXT,
  total DECIMAL(10,2) DEFAULT 0,
  client_viewed_at TIMESTAMPTZ,
  client_approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Itens do orçamento
CREATE TABLE budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  description TEXT,
  unit TEXT DEFAULT 'un',
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  sort_order INT DEFAULT 0
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Services: users can CRUD their own services
CREATE POLICY "Users can view own services"
  ON services FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own services"
  ON services FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own services"
  ON services FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own services"
  ON services FOR DELETE
  USING (auth.uid() = user_id);

-- Clients: users can CRUD their own clients
CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE
  USING (auth.uid() = user_id);

-- Budgets: users can CRUD their own budgets, anyone can view by ID (for public page)
CREATE POLICY "Users can view own budgets"
  ON budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view budget by id"
  ON budgets FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own budgets"
  ON budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON budgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can update budget status"
  ON budgets FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own budgets"
  ON budgets FOR DELETE
  USING (auth.uid() = user_id);

-- Budget items: visible when budget is visible
CREATE POLICY "Users can view own budget items"
  ON budget_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM budgets WHERE budgets.id = budget_items.budget_id
    )
  );

CREATE POLICY "Users can insert budget items"
  ON budget_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM budgets WHERE budgets.id = budget_items.budget_id AND budgets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete budget items"
  ON budget_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM budgets WHERE budgets.id = budget_items.budget_id AND budgets.user_id = auth.uid()
    )
  );

-- =============================================
-- Trigger: auto-create profile on signup
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, owner_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'owner_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Indexes
-- =============================================

CREATE INDEX idx_services_user_id ON services(user_id);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_client_id ON budgets(client_id);
CREATE INDEX idx_budget_items_budget_id ON budget_items(budget_id);
