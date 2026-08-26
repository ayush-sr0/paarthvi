import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mgfyxvfmauobuoxjpcsm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nZnl4dmZtYXVvYnVveGpwY3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2ODE5MDgsImV4cCI6MjEwMzI1NzkwOH0.HOSYR3CTQOQuq5c8vwUKxPU01D-0Yfldkm7BdAxTxwM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
