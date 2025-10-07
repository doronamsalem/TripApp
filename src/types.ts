export type Currency = 'ILS' | 'USD' | 'EUR' | 'THB'
export type SplitType = 'HALF' | 'ALL_TO_A' | 'ALL_TO_B' | 'CUSTOM'

export interface Expense {
  id?: string
  user_id: string
  date: string
  category: string
  amount: number
  currency: Currency
  payer: 'A' | 'B'
  split_type: SplitType
  custom_pct_to_A?: number | null
  rate_override?: number | null
  amount_base_ILS: number
  share_A: number
  share_B: number
  paid_by_A: number
  paid_by_B: number
  owes_A: number
  owes_B: number
  note?: string | null
  link?: string | null
  created_at?: string
}

export interface ItineraryItem {
  id?: string
  user_id: string
  type: 'Flight' | 'Hotel' | 'Activity'
  title: string
  date: string
  start_time: string
  end_time?: string | null
  location: string
  notes?: string | null
  link?: string | null
  created_at?: string
}

export interface LinkItem {
  id?: string
  user_id: string
  type: 'Flight' | 'Hotel' | 'Other'
  name: string
  url: string
  status: 'Considering' | 'Booked' | 'Cancelled'
  notes?: string | null
  created_at?: string
}
