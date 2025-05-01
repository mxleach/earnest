// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vhfbstvcujzbfiodpkrn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZmJzdHZjdWp6YmZpb2Rwa3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNjU5NjgsImV4cCI6MjA2MTY0MTk2OH0.HlAYRUuxFEcenoY3bomri_o_FdUe76XtWSHP2LIwKIc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
