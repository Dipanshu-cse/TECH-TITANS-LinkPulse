import { createClient } from '@supabase/supabase-js'


const SUPABASE_URL = 'https://ujyejpllqkmsuqbtxifk.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_mDHRs87uAdOAPbpnDp9a_A__32QfV9b'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)