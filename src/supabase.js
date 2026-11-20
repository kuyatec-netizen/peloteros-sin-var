
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://cyxqrjibvqwpdyicjzjy.supabase.co'

const SUPABASE_ANON_KEY = 'sb_publishable_jj6yhrtIF6Ci2dsd0IEsZA_MmwoW4w-'

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)
