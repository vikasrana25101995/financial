-- Seed data for testing
-- Note: Assuming a test user UUID '00000000-0000-0000-0000-000000000000' for local simulation.

-- 1. Insert Profile
INSERT INTO public.profiles (id, full_name, avatar_url, currency)
VALUES ('00000000-0000-0000-0000-000000000000', 'John Doe', 'https://api.dicebear.com/7.x/adventurer/svg?seed=John', 'USD')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, currency = EXCLUDED.currency;

-- 2. Insert Income
INSERT INTO public.income (id, user_id, title, amount, category, date, notes, payment_method)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Tech Corp Monthly Salary', 5500.00, 'Salary', CURRENT_DATE - INTERVAL '10 days', 'Primary job', 'Bank Transfer'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Freelance Landing Page Dev', 1200.00, 'Freelancing', CURRENT_DATE - INTERVAL '5 days', 'Client website project', 'UPI'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Apartment Rental Income', 850.00, 'Rental Income', CURRENT_DATE - INTERVAL '20 days', 'Sublet room', 'Bank Transfer'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Quarterly Stock Dividend', 150.00, 'Dividends', CURRENT_DATE - INTERVAL '2 days', 'Index fund yield', 'Bank Transfer');

-- 3. Insert Expenses
INSERT INTO public.expenses (id, user_id, name, amount, category, date, payment_method, merchant, notes, receipt_url, tags, is_recurring, recurring_interval)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Monthly House Rent', 1500.00, 'Rent', CURRENT_DATE - INTERVAL '24 days', 'Bank Transfer', 'Metropolitan Housing', 'Rent payment', NULL, ARRAY['housing', 'essential'], TRUE, 'Monthly'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Supermarket Grocery Run', 142.50, 'Grocery', CURRENT_DATE - INTERVAL '1 days', 'Debit Card', 'WholeFoods', 'Weekly grocery shopping', NULL, ARRAY['food', 'grocery'], FALSE, NULL),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Starbucks Latte & Muffin', 8.75, 'Food', CURRENT_DATE, 'UPI', 'Starbucks', 'Afternoon coffee break', NULL, ARRAY['quick-spend', 'snack'], FALSE, NULL),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Weekly Gas Refill', 45.00, 'Fuel', CURRENT_DATE - INTERVAL '3 days', 'Credit Card', 'Shell', 'Car fuel tank refill', NULL, ARRAY['travel', 'essential'], FALSE, NULL),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Sushi Dinner with Friends', 78.00, 'Food', CURRENT_DATE - INTERVAL '4 days', 'Credit Card', 'Sushi House', 'Celebratory dinner', NULL, ARRAY['leisure', 'social'], FALSE, NULL),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Running Shoes Purchase', 120.00, 'Shopping', CURRENT_DATE - INTERVAL '7 days', 'Credit Card', 'Nike Store', 'Nike Pegasus 40', NULL, ARRAY['shopping', 'clothing'], FALSE, NULL),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Movie Night Tickets', 32.00, 'Entertainment', CURRENT_DATE - INTERVAL '6 days', 'Debit Card', 'AMC Theatres', 'Dune Part 2', NULL, ARRAY['leisure', 'entertainment'], FALSE, NULL),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Co-working Space Fee', 250.00, 'Miscellaneous', CURRENT_DATE - INTERVAL '15 days', 'Bank Transfer', 'WeWork', 'Day passes for freelancing work', NULL, ARRAY['freelance', 'work'], TRUE, 'Monthly');

-- 4. Insert EMIs
INSERT INTO public.emis (id, user_id, loan_name, bank, principal_amount, interest_rate, monthly_emi, remaining_balance, start_date, end_date, due_date, auto_reminder, status)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Car Loan', 'Chase Bank', 24000.00, 4.50, 450.00, 18500.00, CURRENT_DATE - INTERVAL '120 days', CURRENT_DATE + INTERVAL '1080 days', 5, TRUE, 'Active'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Education Loan', 'Sallie Mae', 35000.00, 6.20, 320.00, 28000.00, CURRENT_DATE - INTERVAL '365 days', CURRENT_DATE + INTERVAL '1800 days', 10, TRUE, 'Active');

-- 5. Insert Subscriptions
INSERT INTO public.subscriptions (id, user_id, service_name, monthly_cost, billing_cycle, renewal_date, auto_renew, category, payment_method)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Netflix Standard', 15.49, 'Monthly', CURRENT_DATE + INTERVAL '12 days', TRUE, 'Entertainment', 'Credit Card'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Spotify Premium', 10.99, 'Monthly', CURRENT_DATE + INTERVAL '6 days', TRUE, 'Entertainment', 'Debit Card'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'ChatGPT Plus', 20.00, 'Monthly', CURRENT_DATE + INTERVAL '18 days', TRUE, 'Software', 'Credit Card'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'AWS Free Tier Upgrade', 35.00, 'Monthly', CURRENT_DATE + INTERVAL '3 days', TRUE, 'Software', 'Credit Card'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Gold Gym Membership', 50.00, 'Monthly', CURRENT_DATE + INTERVAL '9 days', TRUE, 'Gym', 'Debit Card');

-- 6. Insert Budgets
INSERT INTO public.budgets (id, user_id, category, monthly_limit, alert_threshold)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Food', 500.00, 80),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Grocery', 400.00, 75),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Shopping', 300.00, 85),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Entertainment', 200.00, 90),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Fuel', 150.00, 80);

-- 7. Insert Savings Goals
INSERT INTO public.savings_goals (id, user_id, name, target_amount, current_saved, target_date, notes)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Emergency Fund', 10000.00, 6500.00, CURRENT_DATE + INTERVAL '180 days', '6 months of living expenses'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Europe Vacation', 4000.00, 1800.00, CURRENT_DATE + INTERVAL '240 days', '10 days trip around Italy & Spain'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Tesla Model 3 Down Payment', 15000.00, 3000.00, CURRENT_DATE + INTERVAL '500 days', 'Planning for next year');

-- 8. Insert Investments
INSERT INTO public.investments (id, user_id, name, type, invested_amount, current_value, purchase_date)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'S&P 500 Index Fund (VOO)', 'Stocks', 8000.00, 9150.00, CURRENT_DATE - INTERVAL '400 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Vanguard Total Bond Market (BND)', 'Mutual Funds', 3000.00, 2950.00, CURRENT_DATE - INTERVAL '250 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Bitcoin (BTC)', 'Crypto', 1500.00, 2400.00, CURRENT_DATE - INTERVAL '150 days'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Physical Gold Coin 1oz', 'Gold', 1900.00, 2150.00, CURRENT_DATE - INTERVAL '300 days');

-- 9. Insert Debts
INSERT INTO public.debts (id, user_id, name, type, total_amount, interest_rate, monthly_payment, remaining_amount)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Chase Sapphire Credit Card', 'Credit Card', 2400.00, 18.99, 150.00, 1400.00),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Lent to Alex', 'Friends & Family', -500.00, 0.00, 50.00, -350.00); -- Negative debt means money owed to user

-- 10. Insert Bills
INSERT INTO public.bills (id, user_id, name, category, amount, due_date, status)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Electricity Bill', 'Electricity', 85.40, CURRENT_DATE + INTERVAL '2 days', 'Unpaid'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Comcast Internet', 'Internet', 69.99, CURRENT_DATE + INTERVAL '5 days', 'Unpaid'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Water Utility', 'Water', 35.00, CURRENT_DATE - INTERVAL '1 days', 'Overdue'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'Gas Network', 'Gas', 40.00, CURRENT_DATE + INTERVAL '12 days', 'Paid');
