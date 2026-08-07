-- Create schema for Personal Finance Management App

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    currency TEXT DEFAULT 'USD' NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Allow users to update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Allow users to insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);


-- 2. Income Table
CREATE TABLE IF NOT EXISTS public.income (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    category TEXT NOT NULL, -- e.g., 'Salary', 'Freelancing', 'Rental', 'Dividends', 'Other'
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    payment_method TEXT NOT NULL, -- e.g., 'Bank Transfer', 'Cash', 'Cheque', 'UPI'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage own income"
    ON public.income FOR ALL
    USING (auth.uid() = user_id);


-- 3. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    category TEXT NOT NULL, -- e.g., 'Food', 'Grocery', 'Rent', 'Shopping', etc.
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL, -- e.g., 'Credit Card', 'Debit Card', 'Cash', 'UPI'
    merchant TEXT,
    notes TEXT,
    receipt_url TEXT,
    tags TEXT[], -- array of tags
    is_recurring BOOLEAN DEFAULT FALSE NOT NULL,
    recurring_interval TEXT, -- e.g., 'Daily', 'Weekly', 'Monthly', 'Yearly'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage own expenses"
    ON public.expenses FOR ALL
    USING (auth.uid() = user_id);


-- 4. EMIs Table
CREATE TABLE IF NOT EXISTS public.emis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    loan_name TEXT NOT NULL,
    bank TEXT NOT NULL,
    principal_amount NUMERIC(12,2) NOT NULL CHECK (principal_amount >= 0),
    interest_rate NUMERIC(5,2) NOT NULL CHECK (interest_rate >= 0),
    monthly_emi NUMERIC(12,2) NOT NULL CHECK (monthly_emi >= 0),
    remaining_balance NUMERIC(12,2) NOT NULL CHECK (remaining_balance >= 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    due_date INT NOT NULL CHECK (due_date >= 1 AND due_date <= 31),
    auto_reminder BOOLEAN DEFAULT TRUE NOT NULL,
    status TEXT DEFAULT 'Active' NOT NULL, -- e.g., 'Active', 'Paid'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.emis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage own EMIs"
    ON public.emis FOR ALL
    USING (auth.uid() = user_id);


-- 5. Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    service_name TEXT NOT NULL,
    monthly_cost NUMERIC(12,2) NOT NULL CHECK (monthly_cost >= 0),
    billing_cycle TEXT DEFAULT 'Monthly' NOT NULL, -- e.g., 'Monthly', 'Yearly'
    renewal_date DATE NOT NULL,
    auto_renew BOOLEAN DEFAULT TRUE NOT NULL,
    category TEXT NOT NULL, -- e.g., 'Entertainment', 'Utility', 'Software', 'Gym'
    payment_method TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage own subscriptions"
    ON public.subscriptions FOR ALL
    USING (auth.uid() = user_id);


-- 6. Budgets Table
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    monthly_limit NUMERIC(12,2) NOT NULL CHECK (monthly_limit >= 0),
    alert_threshold INT DEFAULT 80 NOT NULL CHECK (alert_threshold >= 1 AND alert_threshold <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, category)
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage own budgets"
    ON public.budgets FOR ALL
    USING (auth.uid() = user_id);


-- 7. Savings Goals Table
CREATE TABLE IF NOT EXISTS public.savings_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    target_amount NUMERIC(12,2) NOT NULL CHECK (target_amount >= 0),
    current_saved NUMERIC(12,2) DEFAULT 0.00 NOT NULL CHECK (current_saved >= 0),
    target_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage own savings goals"
    ON public.savings_goals FOR ALL
    USING (auth.uid() = user_id);


-- 8. Investments Table
CREATE TABLE IF NOT EXISTS public.investments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'Stocks', 'Mutual Funds', 'Fixed Deposit', 'Gold', 'Crypto', 'NPS', 'EPF'
    invested_amount NUMERIC(12,2) NOT NULL CHECK (invested_amount >= 0),
    current_value NUMERIC(12,2) NOT NULL CHECK (current_value >= 0),
    purchase_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage own investments"
    ON public.investments FOR ALL
    USING (auth.uid() = user_id);


-- 9. Debts Table
CREATE TABLE IF NOT EXISTS public.debts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., 'Credit Card', 'Personal Loan', 'Home Loan', 'Car Loan', 'Friends & Family'
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    interest_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (interest_rate >= 0),
    monthly_payment NUMERIC(12,2) NOT NULL CHECK (monthly_payment >= 0),
    remaining_amount NUMERIC(12,2) NOT NULL CHECK (remaining_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage own debts"
    ON public.debts FOR ALL
    USING (auth.uid() = user_id);


-- 10. Bills Table
CREATE TABLE IF NOT EXISTS public.bills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g., 'Electricity', 'Internet', 'Water', 'Gas', 'Mobile', 'Rent'
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'Unpaid' NOT NULL, -- e.g., 'Unpaid', 'Paid'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage own bills"
    ON public.bills FOR ALL
    USING (auth.uid() = user_id);

-- Create trigger to automatically insert a profile for new auth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, currency)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New User'),
        COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/adventurer/svg?seed=' || new.id),
        'USD'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
