// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://hjyrlnbgidmckpxogmhz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqeXJsbmJnaWRtY2tweG9nbWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxNTg3MjksImV4cCI6MjA2MjczNDcyOX0.FSBAztAMSMedxMDbTTfebxLM5R6m2MXwc-svl1fnRNE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);