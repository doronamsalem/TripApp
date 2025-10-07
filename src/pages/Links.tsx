import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import type { LinkItem } from '../types'

export default function Links() {
  const [items, setItems] = useState<LinkItem[]>([])
  const [form, setForm] = useState({
    type: 'Flight',
    name: '',
    url: '',
    status: 'Considering',
    notes: ''
  })

  useEffect(() => { refresh() }, [])

  async function refresh() {
    const { data } = await supabase.from('links').select('*').order('created_at', { ascending: false })
    setItems(data ?? [])
  }

  async function submit(e:any) {
    e.preventDefault()
    const payload = { ...form, notes: form.notes || null }
    const { error } = await supabase.from('links').insert(payload)
    if (error) alert(error.message); else { await refresh(); alert('Saved!') }
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h2>Add Link</h2>
        <form onSubmit={submit} className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label>Type</label>
            <select value={form.type} onChange={e=>setForm({...form, type:e.target.value as any})}>
              <option>Flight</option><option>Hotel</option><option>Other</option>
            </select>
          </div>
          <div>
            <label>Status</label>
            <select value={form.status} onChange={e=>setForm({...form, status:e.target.value as any})}>
              <option>Considering</option><option>Booked</option><option>Cancelled</option>
            </select>
          </div>
          <div className="col-span-2">
            <label>Name</label>
            <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
          </div>
          <div className="col-span-2">
            <label>URL</label>
            <input value={form.url} onChange={e=>setForm({...form, url:e.target.value})} placeholder="https://..." required />
          </div>
          <div className="col-span-2">
            <label>Notes</label>
            <input value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} />
          </div>
          <div className="col-span-2">
            <button type="submit">Save</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Saved Links</h2>
        <ul className="mt-3 space-y-2">
          {items.map(i => (
            <li key={i.id} className="border border-slate-800 rounded-xl p-3">
              <div className="font-medium"><a className="link" href={i.url} target="_blank">{i.name}</a> <span className="text-slate-400">({i.type} – {i.status})</span></div>
              {i.notes ? <div className="text-sm text-slate-300">{i.notes}</div> : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
