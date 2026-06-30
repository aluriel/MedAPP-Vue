import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://vlrwqgymhugmqfkcnbmf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZscndxZ3ltaHVnbXFma2NuYm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NjIzNDksImV4cCI6MjA5ODAzODM0OX0.ApW7Dritbg86xLTFCR09En7eFHHZ2vIE7wcQNZnrruw'
);
