import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ujyejpllqkmsuqbtxifk.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqeWVqcGxscWttc3VxYnR4aWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNTkzMzYsImV4cCI6MjEwNzczNTMzNn0.X9FWX3Vzq6ITntVeCVBTLypJ_fOWw99c9VIQ4WQ2IZI'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
