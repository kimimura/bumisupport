import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type City = {
  id: string
  name: string
  slug: string
  created_at: string
}

export type Business = {
  id: string
  company: string
  service_type: string
  owner: string | null
  verification: string | null
  location: string | null
  status: string | null
  tier: string | null
  price_range: string | null
  city_id: string | null
  created_at: string
}
