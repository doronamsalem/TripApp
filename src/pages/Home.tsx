import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import type { Expense, ItineraryItem } from '../types'
import { summarizeDebts } from '../debt'
import { fmtILS, combineDateTime } from '../utils'

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [nextUp, setNextUp] = useState<ItineraryItem | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: e } = await supabase.from('expenses').select('*').order('date', { ascending: false }).limit(50)
      setExpenses(e ?? [])

      const { data: it } = await supabase.from('itinerary').select('*')
      const upcoming = (it ?? []).filter(i => combineDateTime(i.date, i.start_time) >= new Date())
      upcoming.sort((a,b) => +combineDateTime(a.date, a.start_time) - +combineDateTime(b.date, b.start_time))
      setNextUp(upcoming[0] ?? null)
    }
    load()
  }, [])

  const { netA, netB } = summarizeDebts(expenses)

  const debtBanner = (() => {
    if (Math.abs(netA) < 0.01) return "All settled up"
    if (netA > 0) return `A owes ${fmtILS(netA)} to B`
    return `B owes ${fmtILS(netB)} to A`
  })()

  return (
    <div className="space-y-4">
      <div className="card">
        <h2>Next Up</h2>
        {nextUp ? (
          <div className="mt-2">
            <div className="text-lg font-medium">{nextUp.title} <small>({nextUp.type})</small></div>
            <div className="text-slate-300">{nextUp.date} {nextUp.start_time} @ {nextUp.location}</div>
            {nextUp.link ? <a className="link" href={nextUp.link} target="_blank">Open details</a> : null}
          </div>
        ) : <div className="mt-2 text-slate-400">No upcoming items</div>}
      </div>

      <div className="card">
        <h2>Debt Summary</h2>
        <div className="mt-2 text-xl">{debtBanner}</div>
        <small className="block mt-1">Positive means owes; negative means is owed.</small>
      </div>

      <div className="card">
        <h2>Quick Actions</h2>
        <div className="mt-2 flex gap-2">
          <a className="link" href="/expenses">Add Expense</a>
          <a className="link" href="/itinerary">Add Itinerary</a>
          <a className="link" href="/links">Add Link</a>
        </div>
      </div>
    </div>
  )
}
