import { supabase } from './supabaseClient';

// Get current user (helper)
export const getUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
};

// ----- PAYCHECKS -----
export const insertPaycheck = async (entry) => {
  const user = await getUser();
  if (!user) return;

  return await supabase.from('paychecks').insert([{ ...entry, user_id: user.id }]);
};

export const fetchPaychecks = async () => {
  const user = await getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('paychecks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return data;
};

// ----- TIMESHEETS -----
export const saveTimesheet = async (weekStartDate, weekData) => {
  const user = await getUser();
  if (!user) return;

  // Upsert (insert or update)
  return await supabase.from('timesheets').upsert([
    {
      user_id: user.id,
      week_start_date: weekStartDate,
      week_data: weekData,
    }
  ]);
};

export const fetchTimesheetByWeek = async (weekStartDate) => {
  const user = await getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('timesheets')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_start_date', weekStartDate)
    .single();

  return data;
};

// ----- BUDGET -----
export const saveBudget = async (budgetData) => {
  const user = await getUser();
  if (!user) return;

  return await supabase.from('budgets').upsert([
    {
      user_id: user.id,
      budget_data: budgetData,
    }
  ]);
};

export const fetchBudget = async () => {
  const user = await getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  return data;
};

// ----- SAVINGS GOAL -----
export const saveSavingsGoal = async (goalData) => {
  const user = await getUser();
  if (!user) return;

  return await supabase.from('savings_goals').upsert([
    {
      user_id: user.id,
      ...goalData,
    }
  ]);
};

export const fetchSavingsGoal = async () => {
  const user = await getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  return data;
};
