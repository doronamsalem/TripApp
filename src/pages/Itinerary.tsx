import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import type { ItineraryItem } from '../types'

export default function Itinerary() {
  const [items, setItems] = useState<ItineraryItem[]>([])
  const [form, setForm] = useState({
    type: 'Flight',
    title: '',
    date: new Date().toISOString().slice(0,10),
    start_time: '12:00',
    end_time: '',
    location: '',
    notes: '',
    link: ''
  })

  useEffect(() => { refresh() }, [])

  async function refresh() {
    const { data } = await supabase.from('itinerary').select('*').order('date', { ascending: true })
    setItems(data ?? [])
  }

  async function submit(e:any) {
    e.preventDefault()
    const payload = { ...form, end_time: form.end_time || null, notes: form.notes || null, link: form.link || null }
    const { error } = await supabase.from('itinerary').insert(payload)
    if (error) alert(error.message); else { await refresh(); alert('Saved!') }
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h2>Add Itinerary</h2>
        <form onSubmit={submit} className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label>Type</label>
            <select value={form.type} onChange={e=>setForm({...form, type:e.target.value as any})}>
              <option>Flight</option><option>Hotel</option><option>Activity</option>
            </select>
          </div>
          <div>
            <label>Date</label>
            <input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} required />
          </div>
          <div>
            <label>Start Time</label>
            <input type="time" value={form.start_time} onChange={e=>setForm({...form, start_time:e.target.value})} required />
          </div>
          <div>
            <label>End Time</label>
            <input type="time" value={form.end_time} onChange={e=>setForm({...form, end_time:e.target.value})} />
          </div>
          <div className="col-span-2">
            <label>Title</label>
            <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
          </div>
          <div className="col-span-2">
            <label>Location</label>
            <input value={form.location} onChange={e=>setForm({...form, location:e.target.value})} required />
          </div>
          <div className="col-span-2">
            <label>Notes</label>
            <input value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} />
          </div>
          <div className="col-span-2">
            <label>Link</label>
            <input value={form.link} onChange={e=>setForm({...form, link:e.target.value})} placeholder="https://..." />
          </div>
          <div className="col-span-2">
            <button type="submit">Save</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Planned Items</h2>
        <ul className="mt-3 space-y-2">
          {items.map(i => (
            <li key={i.id} className="border border-slate-800 rounded-xl p-3">
              <div className="font-medium">{i.title} <span className="text-slate-400">({i.type})</span></div>
              <div className="text-sm text-slate-300">{i.date} {i.start_time}{i.end_time?`–${i.end_time}`:''} @ {i.location}</div>
              {i.link ? <a className="link" target="_blank" href={i.link}>Open link</a> : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
