import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Booking {
  id: string
  seat_number: number
  student_name: string
  college_reg_no: string
  gender: 'male' | 'female'
  sport: 'cricket' | 'volleyball' | 'basketball' | 'football' | 'faculty'
  created_at: string
}

export interface Seat {
  seat_number: number
  is_booked: boolean
  booking?: Booking
}
