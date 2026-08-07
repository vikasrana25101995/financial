'use server';

import { pool } from './db-pool';
import { getAuthenticatedUserId } from './auth-actions';

// Helper to format dates to YYYY-MM-DD
function formatDate(date: any): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

// Helper to convert DB rows to matching types
function castNumber(val: any): number {
  return val !== null && val !== undefined ? parseFloat(val) : 0;
}

// Fallback user ID if not authenticated (should not happen in production but useful for fallback)
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';

async function getUserId(): Promise<string> {
  const userId = await getAuthenticatedUserId();
  return userId || MOCK_USER_ID;
}

// --- Profile ---
export async function getProfile() {
  const userId = await getUserId();
  const res = await pool.query(
    'SELECT id, full_name, avatar_url, currency FROM public.profiles WHERE id = $1',
    [userId]
  );
  if (res.rows.length === 0) {
    // If profile doesn't exist, create a default one
    const insertRes = await pool.query(
      'INSERT INTO public.profiles (id, full_name, avatar_url, currency) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, 'User', '', 'USD']
    );
    return {
      id: insertRes.rows[0].id,
      full_name: insertRes.rows[0].full_name,
      avatar_url: insertRes.rows[0].avatar_url,
      currency: insertRes.rows[0].currency,
    };
  }
  return {
    id: res.rows[0].id,
    full_name: res.rows[0].full_name,
    avatar_url: res.rows[0].avatar_url,
    currency: res.rows[0].currency,
  };
}

export async function updateProfile(profile: any) {
  const userId = await getUserId();
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (profile.full_name !== undefined) {
    fields.push(`full_name = $${idx++}`);
    values.push(profile.full_name);
  }
  if (profile.avatar_url !== undefined) {
    fields.push(`avatar_url = $${idx++}`);
    values.push(profile.avatar_url);
  }
  if (profile.currency !== undefined) {
    fields.push(`currency = $${idx++}`);
    values.push(profile.currency);
  }

  if (fields.length === 0) return getProfile();

  values.push(userId);
  const query = `UPDATE public.profiles SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`;
  const res = await pool.query(query, values);
  return {
    id: res.rows[0].id,
    full_name: res.rows[0].full_name,
    avatar_url: res.rows[0].avatar_url,
    currency: res.rows[0].currency,
  };
}

// --- Incomes ---
export async function getIncomes() {
  const userId = await getUserId();
  const res = await pool.query(
    'SELECT id, user_id, title, amount, category, date, notes, payment_method FROM public.income WHERE user_id = $1 ORDER BY date DESC',
    [userId]
  );
  return res.rows.map(row => ({
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    amount: castNumber(row.amount),
    category: row.category,
    date: formatDate(row.date),
    notes: row.notes || '',
    payment_method: row.payment_method,
  }));
}

export async function addIncome(income: any) {
  const userId = await getUserId();
  const res = await pool.query(
    `INSERT INTO public.income (user_id, title, amount, category, date, notes, payment_method)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, user_id, title, amount, category, date, notes, payment_method`,
    [
      userId,
      income.title,
      income.amount,
      income.category,
      income.date || new Date(),
      income.notes || '',
      income.payment_method,
    ]
  );
  const row = res.rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    amount: castNumber(row.amount),
    category: row.category,
    date: formatDate(row.date),
    notes: row.notes || '',
    payment_method: row.payment_method,
  };
}

export async function deleteIncome(id: string) {
  const userId = await getUserId();
  const res = await pool.query('DELETE FROM public.income WHERE id = $1 AND user_id = $2', [id, userId]);
  return (res.rowCount ?? 0) > 0;
}

async function checkAndProcessSubscriptionRenewalsInternal(userId: string) {
  if (!userId) return;
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const subRes = await pool.query(
      `SELECT id, service_name, monthly_cost, billing_cycle, renewal_date, category, payment_method
       FROM public.subscriptions 
       WHERE user_id = $1 AND renewal_date <= $2`,
      [userId, todayStr]
    );

    if (subRes.rows.length === 0) return;

    for (const sub of subRes.rows) {
      const renewalDateStr = formatDate(sub.renewal_date);
      const renewalDate = new Date(renewalDateStr);
      const today = new Date(todayStr);

      while (renewalDate <= today) {
        const occurrenceDateStr = renewalDate.toISOString().split('T')[0];
        await pool.query(
          `INSERT INTO public.expenses (user_id, name, amount, category, date, payment_method, notes, tags, is_recurring)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            userId,
            `Subscription: ${sub.service_name}`,
            castNumber(sub.monthly_cost),
            sub.category || 'Utilities',
            occurrenceDateStr,
            sub.payment_method || 'Other',
            `Auto-logged renewal for ${sub.service_name}.`,
            ['subscription', sub.service_name.toLowerCase()],
            false
          ]
        );

        if (sub.billing_cycle === 'Yearly') {
          renewalDate.setFullYear(renewalDate.getFullYear() + 1);
        } else {
          renewalDate.setMonth(renewalDate.getMonth() + 1);
        }
      }

      const nextRenewalStr = renewalDate.toISOString().split('T')[0];
      await pool.query(
        `UPDATE public.subscriptions 
         SET renewal_date = $1 
         WHERE id = $2 AND user_id = $3`,
        [nextRenewalStr, sub.id, userId]
      );
    }
  } catch (error) {
    console.error('Error in checkAndProcessSubscriptionRenewalsInternal:', error);
  }
}

// --- Expenses ---
export async function getExpenses() {
  const userId = await getUserId();
  try {
    await checkAndProcessSubscriptionRenewalsInternal(userId);
  } catch (ex) {
    console.error('Auto-renew check failed:', ex);
  }
  const res = await pool.query(
    `SELECT e.id, e.user_id, e.name, e.amount, e.category, e.date, e.payment_method, e.merchant, e.notes, e.receipt_url, e.tags, e.is_recurring, e.recurring_interval,
            i.type as investment_type, i.current_value as current_value
     FROM public.expenses e
     LEFT JOIN public.investments i ON e.id = i.id
     WHERE e.user_id = $1 ORDER BY e.date DESC`,
    [userId]
  );
  return res.rows.map(row => ({
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    amount: castNumber(row.amount),
    category: row.category,
    date: formatDate(row.date),
    payment_method: row.payment_method,
    merchant: row.merchant || '',
    notes: row.notes || '',
    receipt_url: row.receipt_url || '',
    tags: row.tags || [],
    is_recurring: row.is_recurring,
    recurring_interval: row.recurring_interval || '',
    investment_type: row.investment_type || '',
    current_value: row.current_value !== null && row.current_value !== undefined ? castNumber(row.current_value) : undefined,
  }));
}

export async function addExpense(expense: any) {
  const userId = await getUserId();
  const { investment_type, current_value, ...expenseFields } = expense;

  const res = await pool.query(
    `INSERT INTO public.expenses (user_id, name, amount, category, date, payment_method, merchant, notes, receipt_url, tags, is_recurring, recurring_interval)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING id, user_id, name, amount, category, date, payment_method, merchant, notes, receipt_url, tags, is_recurring, recurring_interval`,
    [
      userId,
      expenseFields.name,
      expenseFields.amount,
      expenseFields.category,
      expenseFields.date || new Date(),
      expenseFields.payment_method,
      expenseFields.merchant || '',
      expenseFields.notes || '',
      expenseFields.receipt_url || '',
      expenseFields.tags || [],
      expenseFields.is_recurring || false,
      expenseFields.recurring_interval || '',
    ]
  );
  const row = res.rows[0];

  // Handle investment synchronization
  if (row.category === 'Investment') {
    const invType = investment_type || 'Stock';
    const currVal = current_value !== undefined && current_value !== null ? current_value : row.amount;
    await pool.query(
      `INSERT INTO public.investments (id, user_id, name, type, invested_amount, current_value, purchase_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         type = EXCLUDED.type,
         invested_amount = EXCLUDED.invested_amount,
         current_value = EXCLUDED.current_value,
         purchase_date = EXCLUDED.purchase_date`,
      [
        row.id,
        userId,
        row.name,
        invType,
        row.amount,
        currVal,
        row.date
      ]
    );
  }

  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    amount: castNumber(row.amount),
    category: row.category,
    date: formatDate(row.date),
    payment_method: row.payment_method,
    merchant: row.merchant || '',
    notes: row.notes || '',
    receipt_url: row.receipt_url || '',
    tags: row.tags || [],
    is_recurring: row.is_recurring,
    recurring_interval: row.recurring_interval || '',
    investment_type: investment_type || '',
    current_value: current_value !== undefined && current_value !== null ? castNumber(current_value) : undefined,
  };
}

export async function deleteExpense(id: string) {
  const userId = await getUserId();
  await pool.query('DELETE FROM public.investments WHERE id = $1 AND user_id = $2', [id, userId]);
  const res = await pool.query('DELETE FROM public.expenses WHERE id = $1 AND user_id = $2', [id, userId]);
  return (res.rowCount ?? 0) > 0;
}

export async function updateExpense(id: string, expense: any) {
  const userId = await getUserId();
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  // Separate investment-specific fields
  const { investment_type, current_value, ...expenseFields } = expense;

  for (const [key, value] of Object.entries(expenseFields)) {
    if (value !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }
  }

  let row;
  if (fields.length === 0) {
    const fetchRes = await pool.query('SELECT * FROM public.expenses WHERE id = $1 AND user_id = $2', [id, userId]);
    row = fetchRes.rows[0];
  } else {
    values.push(id, userId);
    const query = `UPDATE public.expenses SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`;
    const res = await pool.query(query, values);
    if (res.rows.length === 0) {
      throw new Error('Expense not found or unauthorized');
    }
    row = res.rows[0];
  }

  // Handle investment synchronization
  let finalInvestmentType = investment_type || '';
  let finalCurrentValue = current_value;

  if (row.category === 'Investment') {
    const invType = investment_type || 'Stock';
    let currVal = current_value;
    if (currVal === undefined || currVal === null) {
      const existingInv = await pool.query('SELECT type, current_value FROM public.investments WHERE id = $1', [row.id]);
      if (existingInv.rows.length > 0) {
        currVal = castNumber(existingInv.rows[0].current_value);
        if (!investment_type) {
          finalInvestmentType = existingInv.rows[0].type;
        }
      } else {
        currVal = row.amount;
      }
    }
    finalCurrentValue = currVal;

    await pool.query(
      `INSERT INTO public.investments (id, user_id, name, type, invested_amount, current_value, purchase_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         type = EXCLUDED.type,
         invested_amount = EXCLUDED.invested_amount,
         current_value = EXCLUDED.current_value,
         purchase_date = EXCLUDED.purchase_date`,
      [
        row.id,
        userId,
        row.name,
        investment_type || finalInvestmentType || 'Stock',
        row.amount,
        currVal,
        row.date
      ]
    );
  } else {
    await pool.query('DELETE FROM public.investments WHERE id = $1 AND user_id = $2', [id, userId]);
  }

  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    amount: castNumber(row.amount),
    category: row.category,
    date: formatDate(row.date),
    payment_method: row.payment_method,
    merchant: row.merchant || '',
    notes: row.notes || '',
    receipt_url: row.receipt_url || '',
    tags: row.tags || [],
    is_recurring: row.is_recurring,
    recurring_interval: row.recurring_interval || '',
    investment_type: investment_type || finalInvestmentType,
    current_value: finalCurrentValue !== undefined && finalCurrentValue !== null ? castNumber(finalCurrentValue) : undefined,
  };
}

// --- EMIs ---
export async function getEmis() {
  const userId = await getUserId();
  const res = await pool.query(
    `SELECT id, user_id, loan_name, bank, principal_amount, interest_rate, monthly_emi, remaining_balance, start_date, end_date, due_date, auto_reminder, status
     FROM public.emis WHERE user_id = $1 ORDER BY loan_name ASC`,
    [userId]
  );
  return res.rows.map(row => ({
    id: row.id,
    user_id: row.user_id,
    loan_name: row.loan_name,
    bank: row.bank,
    principal_amount: castNumber(row.principal_amount),
    interest_rate: castNumber(row.interest_rate),
    monthly_emi: castNumber(row.monthly_emi),
    remaining_balance: castNumber(row.remaining_balance),
    start_date: formatDate(row.start_date),
    end_date: formatDate(row.end_date),
    due_date: row.due_date,
    auto_reminder: row.auto_reminder,
    status: row.status,
  }));
}

export async function addEmi(emi: any) {
  const userId = await getUserId();
  const res = await pool.query(
    `INSERT INTO public.emis (user_id, loan_name, bank, principal_amount, interest_rate, monthly_emi, remaining_balance, start_date, end_date, due_date, auto_reminder, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING id, user_id, loan_name, bank, principal_amount, interest_rate, monthly_emi, remaining_balance, start_date, end_date, due_date, auto_reminder, status`,
    [
      userId,
      emi.loan_name,
      emi.bank,
      emi.principal_amount,
      emi.interest_rate,
      emi.monthly_emi,
      emi.remaining_balance,
      emi.start_date,
      emi.end_date,
      emi.due_date,
      emi.auto_reminder || false,
      emi.status || 'Active',
    ]
  );
  const row = res.rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    loan_name: row.loan_name,
    bank: row.bank,
    principal_amount: castNumber(row.principal_amount),
    interest_rate: castNumber(row.interest_rate),
    monthly_emi: castNumber(row.monthly_emi),
    remaining_balance: castNumber(row.remaining_balance),
    start_date: formatDate(row.start_date),
    end_date: formatDate(row.end_date),
    due_date: row.due_date,
    auto_reminder: row.auto_reminder,
    status: row.status,
  };
}

export async function updateEmi(id: string, emi: any) {
  const userId = await getUserId();
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(emi)) {
    if (value !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    const fetchRes = await pool.query('SELECT * FROM public.emis WHERE id = $1 AND user_id = $2', [id, userId]);
    return fetchRes.rows[0];
  }

  values.push(id, userId);
  const query = `UPDATE public.emis SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`;
  const res = await pool.query(query, values);
  const row = res.rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    loan_name: row.loan_name,
    bank: row.bank,
    principal_amount: castNumber(row.principal_amount),
    interest_rate: castNumber(row.interest_rate),
    monthly_emi: castNumber(row.monthly_emi),
    remaining_balance: castNumber(row.remaining_balance),
    start_date: formatDate(row.start_date),
    end_date: formatDate(row.end_date),
    due_date: row.due_date,
    auto_reminder: row.auto_reminder,
    status: row.status,
  };
}

export async function deleteEmi(id: string) {
  const userId = await getUserId();
  const res = await pool.query('DELETE FROM public.emis WHERE id = $1 AND user_id = $2', [id, userId]);
  return (res.rowCount ?? 0) > 0;
}

// --- Subscriptions ---
export async function getSubscriptions() {
  const userId = await getUserId();
  const res = await pool.query(
    `SELECT id, user_id, service_name, monthly_cost, billing_cycle, renewal_date, auto_renew, category, payment_method
     FROM public.subscriptions WHERE user_id = $1 ORDER BY service_name ASC`,
    [userId]
  );
  return res.rows.map(row => ({
    id: row.id,
    user_id: row.user_id,
    service_name: row.service_name,
    monthly_cost: castNumber(row.monthly_cost),
    billing_cycle: row.billing_cycle,
    renewal_date: formatDate(row.renewal_date),
    auto_renew: row.auto_renew,
    category: row.category,
    payment_method: row.payment_method,
  }));
}

export async function addSubscription(sub: any) {
  const userId = await getUserId();
  const res = await pool.query(
    `INSERT INTO public.subscriptions (user_id, service_name, monthly_cost, billing_cycle, renewal_date, auto_renew, category, payment_method)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, user_id, service_name, monthly_cost, billing_cycle, renewal_date, auto_renew, category, payment_method`,
    [
      userId,
      sub.service_name,
      sub.monthly_cost,
      sub.billing_cycle || 'Monthly',
      sub.renewal_date,
      sub.auto_renew !== undefined ? sub.auto_renew : true,
      sub.category,
      sub.payment_method,
    ]
  );
  const row = res.rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    service_name: row.service_name,
    monthly_cost: castNumber(row.monthly_cost),
    billing_cycle: row.billing_cycle,
    renewal_date: formatDate(row.renewal_date),
    auto_renew: row.auto_renew,
    category: row.category,
    payment_method: row.payment_method,
  };
}

export async function deleteSubscription(id: string) {
  const userId = await getUserId();
  const res = await pool.query('DELETE FROM public.subscriptions WHERE id = $1 AND user_id = $2', [id, userId]);
  return (res.rowCount ?? 0) > 0;
}

export async function updateSubscription(id: string, sub: any) {
  const userId = await getUserId();
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(sub)) {
    if (value !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    const fetchRes = await pool.query('SELECT * FROM public.subscriptions WHERE id = $1 AND user_id = $2', [id, userId]);
    return fetchRes.rows[0];
  }

  values.push(id, userId);
  const query = `UPDATE public.subscriptions SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`;
  const res = await pool.query(query, values);
  
  if (res.rows.length === 0) {
    throw new Error('Subscription not found or unauthorized');
  }
  
  const row = res.rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    service_name: row.service_name,
    monthly_cost: castNumber(row.monthly_cost),
    billing_cycle: row.billing_cycle,
    renewal_date: formatDate(row.renewal_date),
    auto_renew: row.auto_renew,
    category: row.category,
    payment_method: row.payment_method,
  };
}

// --- Budgets ---
export async function getBudgets() {
  const userId = await getUserId();
  const res = await pool.query(
    'SELECT id, user_id, category, monthly_limit, alert_threshold FROM public.budgets WHERE user_id = $1',
    [userId]
  );
  return res.rows.map(row => ({
    id: row.id,
    user_id: row.user_id,
    category: row.category,
    monthly_limit: castNumber(row.monthly_limit),
    alert_threshold: row.alert_threshold,
  }));
}

export async function addBudget(budget: any) {
  const userId = await getUserId();
  const res = await pool.query(
    `INSERT INTO public.budgets (user_id, category, monthly_limit, alert_threshold)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, category) DO UPDATE
     SET monthly_limit = EXCLUDED.monthly_limit, alert_threshold = EXCLUDED.alert_threshold
     RETURNING id, user_id, category, monthly_limit, alert_threshold`,
    [
      userId,
      budget.category,
      budget.monthly_limit,
      budget.alert_threshold !== undefined ? budget.alert_threshold : 80,
    ]
  );
  const row = res.rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    category: row.category,
    monthly_limit: castNumber(row.monthly_limit),
    alert_threshold: row.alert_threshold,
  };
}

export async function updateBudget(id: string, budget: any) {
  const userId = await getUserId();
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(budget)) {
    if (value !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    const fetchRes = await pool.query('SELECT * FROM public.budgets WHERE id = $1 AND user_id = $2', [id, userId]);
    return fetchRes.rows[0];
  }

  values.push(id, userId);
  const query = `UPDATE public.budgets SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`;
  const res = await pool.query(query, values);
  const row = res.rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    category: row.category,
    monthly_limit: castNumber(row.monthly_limit),
    alert_threshold: row.alert_threshold,
  };
}

// --- Savings Goals ---
export async function getSavingsGoals() {
  const userId = await getUserId();
  const res = await pool.query(
    'SELECT id, user_id, name, target_amount, current_saved, target_date, notes FROM public.savings_goals WHERE user_id = $1 ORDER BY target_date ASC',
    [userId]
  );
  return res.rows.map(row => ({
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    target_amount: castNumber(row.target_amount),
    current_saved: castNumber(row.current_saved),
    target_date: formatDate(row.target_date),
    notes: row.notes || '',
  }));
}

export async function addSavingsGoal(goal: any) {
  const userId = await getUserId();
  const res = await pool.query(
    `INSERT INTO public.savings_goals (user_id, name, target_amount, current_saved, target_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_id, name, target_amount, current_saved, target_date, notes`,
    [
      userId,
      goal.name,
      goal.target_amount,
      goal.current_saved || 0,
      goal.target_date,
      goal.notes || '',
    ]
  );
  const row = res.rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    target_amount: castNumber(row.target_amount),
    current_saved: castNumber(row.current_saved),
    target_date: formatDate(row.target_date),
    notes: row.notes || '',
  };
}

export async function updateSavingsGoal(id: string, goal: any) {
  const userId = await getUserId();
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(goal)) {
    if (value !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    const fetchRes = await pool.query('SELECT * FROM public.savings_goals WHERE id = $1 AND user_id = $2', [id, userId]);
    return fetchRes.rows[0];
  }

  values.push(id, userId);
  const query = `UPDATE public.savings_goals SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`;
  const res = await pool.query(query, values);
  const row = res.rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    target_amount: castNumber(row.target_amount),
    current_saved: castNumber(row.current_saved),
    target_date: formatDate(row.target_date),
    notes: row.notes || '',
  };
}

export async function deleteSavingsGoal(id: string) {
  const userId = await getUserId();
  const res = await pool.query('DELETE FROM public.savings_goals WHERE id = $1 AND user_id = $2', [id, userId]);
  return (res.rowCount ?? 0) > 0;
}

// --- Investments ---
export async function getInvestments() {
  const userId = await getUserId();
  const res = await pool.query(
    'SELECT id, user_id, name, type, invested_amount, current_value, purchase_date FROM public.investments WHERE user_id = $1 ORDER BY purchase_date DESC',
    [userId]
  );
  return res.rows.map(row => ({
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    type: row.type,
    invested_amount: castNumber(row.invested_amount),
    current_value: castNumber(row.current_value),
    purchase_date: row.purchase_date ? formatDate(row.purchase_date) : '',
  }));
}

export async function addInvestment(inv: any) {
  const userId = await getUserId();
  const res = await pool.query(
    `INSERT INTO public.investments (user_id, name, type, invested_amount, current_value, purchase_date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_id, name, type, invested_amount, current_value, purchase_date`,
    [
      userId,
      inv.name,
      inv.type,
      inv.invested_amount,
      inv.current_value,
      inv.purchase_date || null,
    ]
  );
  const row = res.rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    type: row.type,
    invested_amount: castNumber(row.invested_amount),
    current_value: castNumber(row.current_value),
    purchase_date: row.purchase_date ? formatDate(row.purchase_date) : '',
  };
}

export async function deleteInvestment(id: string) {
  const userId = await getUserId();
  const res = await pool.query('DELETE FROM public.investments WHERE id = $1 AND user_id = $2', [id, userId]);
  return (res.rowCount ?? 0) > 0;
}

// --- Debts ---
export async function getDebts() {
  const userId = await getUserId();
  const res = await pool.query(
    'SELECT id, user_id, name, type, total_amount, interest_rate, monthly_payment, remaining_amount FROM public.debts WHERE user_id = $1 ORDER BY name ASC',
    [userId]
  );
  return res.rows.map(row => ({
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    type: row.type,
    total_amount: castNumber(row.total_amount),
    interest_rate: castNumber(row.interest_rate),
    monthly_payment: castNumber(row.monthly_payment),
    remaining_amount: castNumber(row.remaining_amount),
  }));
}

export async function addDebt(debt: any) {
  const userId = await getUserId();
  const res = await pool.query(
    `INSERT INTO public.debts (user_id, name, type, total_amount, interest_rate, monthly_payment, remaining_amount)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, user_id, name, type, total_amount, interest_rate, monthly_payment, remaining_amount`,
    [
      userId,
      debt.name,
      debt.type,
      debt.total_amount,
      debt.interest_rate || 0,
      debt.monthly_payment || 0,
      debt.remaining_amount,
    ]
  );
  const row = res.rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    type: row.type,
    total_amount: castNumber(row.total_amount),
    interest_rate: castNumber(row.interest_rate),
    monthly_payment: castNumber(row.monthly_payment),
    remaining_amount: castNumber(row.remaining_amount),
  };
}

export async function updateDebt(id: string, debt: any) {
  const userId = await getUserId();
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(debt)) {
    if (value !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    const fetchRes = await pool.query('SELECT * FROM public.debts WHERE id = $1 AND user_id = $2', [id, userId]);
    return fetchRes.rows[0];
  }

  values.push(id, userId);
  const query = `UPDATE public.debts SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`;
  const res = await pool.query(query, values);
  const row = res.rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    type: row.type,
    total_amount: castNumber(row.total_amount),
    interest_rate: castNumber(row.interest_rate),
    monthly_payment: castNumber(row.monthly_payment),
    remaining_amount: castNumber(row.remaining_amount),
  };
}

export async function deleteDebt(id: string) {
  const userId = await getUserId();
  const res = await pool.query('DELETE FROM public.debts WHERE id = $1 AND user_id = $2', [id, userId]);
  return (res.rowCount ?? 0) > 0;
}

// --- Bills ---
export async function getBills() {
  const userId = await getUserId();
  const res = await pool.query(
    'SELECT id, user_id, name, category, amount, due_date, status FROM public.bills WHERE user_id = $1 ORDER BY due_date ASC',
    [userId]
  );
  return res.rows.map(row => ({
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    category: row.category,
    amount: castNumber(row.amount),
    due_date: formatDate(row.due_date),
    status: row.status,
  }));
}

export async function addBill(bill: any) {
  const userId = await getUserId();
  const res = await pool.query(
    `INSERT INTO public.bills (user_id, name, category, amount, due_date, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_id, name, category, amount, due_date, status`,
    [
      userId,
      bill.name,
      bill.category,
      bill.amount,
      bill.due_date,
      bill.status || 'Unpaid',
    ]
  );
  const row = res.rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    category: row.category,
    amount: castNumber(row.amount),
    due_date: formatDate(row.due_date),
    status: row.status,
  };
}

export async function updateBill(id: string, bill: any) {
  const userId = await getUserId();
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(bill)) {
    if (value !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    const fetchRes = await pool.query('SELECT * FROM public.bills WHERE id = $1 AND user_id = $2', [id, userId]);
    return fetchRes.rows[0];
  }

  values.push(id, userId);
  const query = `UPDATE public.bills SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`;
  const res = await pool.query(query, values);
  const row = res.rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    category: row.category,
    amount: castNumber(row.amount),
    due_date: formatDate(row.due_date),
    status: row.status,
  };
}

export async function deleteBill(id: string) {
  const userId = await getUserId();
  const res = await pool.query('DELETE FROM public.bills WHERE id = $1 AND user_id = $2', [id, userId]);
  return (res.rowCount ?? 0) > 0;
}

// --- Savings Allocations (50/30/20 Rule) ---
export async function getAllocations() {
  const userId = await getUserId();
  
  // Dynamically ensure table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.allocations (
      user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
      essentials_pct INT DEFAULT 50 CHECK (essentials_pct >= 0 AND essentials_pct <= 100),
      wants_pct INT DEFAULT 30 CHECK (wants_pct >= 0 AND wants_pct <= 100),
      savings_pct INT DEFAULT 20 CHECK (savings_pct >= 0 AND savings_pct <= 100)
    )
  `);

  const res = await pool.query('SELECT * FROM public.allocations WHERE user_id = $1', [userId]);
  if (res.rows.length === 0) {
    const insertRes = await pool.query(
      'INSERT INTO public.allocations (user_id, essentials_pct, wants_pct, savings_pct) VALUES ($1, 50, 30, 20) RETURNING *',
      [userId]
    );
    return insertRes.rows[0];
  }
  return res.rows[0];
}

export async function updateAllocations(pcts: { essentials_pct: number; wants_pct: number; savings_pct: number }) {
  const userId = await getUserId();
  const sum = pcts.essentials_pct + pcts.wants_pct + pcts.savings_pct;
  if (sum !== 100) {
    throw new Error('Allocation percentages must sum to exactly 100%');
  }

  // Ensure table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.allocations (
      user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
      essentials_pct INT DEFAULT 50 CHECK (essentials_pct >= 0 AND essentials_pct <= 100),
      wants_pct INT DEFAULT 30 CHECK (wants_pct >= 0 AND wants_pct <= 100),
      savings_pct INT DEFAULT 20 CHECK (savings_pct >= 0 AND savings_pct <= 100)
    )
  `);

  const res = await pool.query(
    `INSERT INTO public.allocations (user_id, essentials_pct, wants_pct, savings_pct)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id)
     DO UPDATE SET essentials_pct = $2, wants_pct = $3, savings_pct = $4
     RETURNING *`,
    [userId, pcts.essentials_pct, pcts.wants_pct, pcts.savings_pct]
  );
  return res.rows[0];
}
