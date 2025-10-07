import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import type { Expense, Currency, SplitType } from '../types'
import { getRateToILS } from '../api/rates'
import { computeExpenseDerived } from '../debt'
import { fmtILS } from '../utils'

export default function Expenses() {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0,10),
    category: '',
    amount: 0,
    currency: 'ILS' as Currency,
    payer: 'A' as 'A'|'B',
    split_type: 'HALF' as SplitType,
    custom_pct_to_A: 50,
    rate_override: '' as string,
    note: '',
    link: ''
  })
  const [items, setItems] = useState<Expense[]>([])

  const showCustom = form.split_type === 'CUSTOM'

  useEffect(() => { refresh() }, [])

  async function refresh() {
    const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false }).limit(200)
    setItems(data ?? [])
  }

  async function submit(e:any) {
    e.preventDefault()
    const liveRate = await getRateToILS(form.currency)
    const rate = form.rate_override ? parseFloat(form.rate_override) : liveRate
    const d = computeExpenseDerived(form.amount, rate, form.payer, form.split_type, showCustom ? form.custom_pct_to_A : undefined)
    const payload = {
      date: form.date,
      category: form.category || 'General',
      amount: form.amount,
      currency: form.currency,
      payer: form.payer,
      split_type: form.split_type,
      custom_pct_to_A: showCustom ? form.custom_pct_to_A : null,
      rate_override: form.rate_override ? parseFloat(form.rate_override) : null,
      amount_base_ILS: d.amountILS,
      share_A: d.shareA,
      share_B: d.shareB,
      paid_by_A: d.paidA,
      paid_by_B: d.paidB,
      owes_A: d.owes_A,
      owes_B: d.owes_B,
      note: form.note || null,
      link: form.link || null
    }
    const { error } = await supabase.from('expenses').insert(payload)
    if (error) alert(error.message)
    else { await refresh(); alert('Saved!') }
  }

  const totals = useMemo(() => {
    const sumILS = items.reduce((s, i) => s + i.amount_base_ILS, 0)
    const sumA = items.reduce((s, i) => s + i.owes_A, 0)
    const sumB = items.reduce((s, i) => s + i.owes_B, 0)
    return { sumILS, sumA, sumB }
  }, [items])

  return (
    <div className="space-y-4">
      <div className="card">
        <h2>Add Expense</h2>
        <form onSubmit={submit} className="grid grid-cols-2 gap-3 mt-3">
          <div className="col-span-2">
            <label>Date</label>
            <input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} required />
          </div>
          <div className="col-span-2">
            <label>Category</label>
            <input value={form.category} onChange={e=>setForm({...form, category:e.target.value})} placeholder="Food, Taxi, ..." />
          </div>
          <div>
            <label>Amount</label>
            <input type="number" step="0.01" value={form.amount} onChange={e=>setForm({...form, amount:parseFloat(e.target.value)})} required />
          </div>
          <div>
            <label>Currency</label>
            <select value={form.currency} onChange={e=>setForm({...form, currency:e.target.value as any})}>
              <option>ILS</option><option>USD</option><option>EUR</option><option>THB</option>
            </select>
          </div>
          <div>
            <label>Payer</label>
            <select value={form.payer} onChange={e=>setForm({...form, payer:e.target.value as any})}>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>
          <div>
            <label>Split Type</label>
            <select value={form.split_type} onChange={e=>setForm({...form, split_type:e.target.value as any})}>
              <option value="HALF">Half-Half</option>
              <option value="ALL_TO_A">All to A</option>
              <option value="ALL_TO_B">All to B</option>
              <option value="CUSTOM">Custom Percentage</option>
            </select>
          </div>
          {showCustom && (
            <div className="col-span-2">
              <label>Custom % to A</label>
              <input type="number" min="0" max="100" value={form.custom_pct_to_A} onChange={e=>setForm({...form, custom_pct_to_A:parseFloat(e.target.value)})} />
            </div>
          )}
          <div className="col-span-2">
            <label>Rate override (to ILS) – optional</label>
            <input type="number" step="0.0001" value={form.rate_override} onChange={e=>setForm({...form, rate_override:e.target.value})} placeholder="Leave blank to use live rate" />
          </div>
          <div className="col-span-2">
            <label>Note</label>
            <input value={form.note} onChange={e=>setForm({...form, note:e.target.value})} placeholder="optional" />
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
        <h2>Expenses</h2>
        <div className="mt-2 text-sm text-slate-300">Total: {fmtILS(totals.sumILS)} | Net A: {fmtILS(totals.sumA)} | Net B: {fmtILS(totals.sumB)}</div>
        <ul className="mt-3 space-y-2">
          {items.map(i => (
            <li key={i.id} className="border border-slate-800 rounded-xl p-3">
              <div className="font-medium">{i.category} — {i.date}</div>
              <div className="text-sm text-slate-300">{i.amount} {i.currency} • payer {i.payer} • {fmtILS(i.amount_base_ILS)}</div>
              {i.note ? <div className="text-sm">{i.note}</div> : null}
              {i.link ? <a className="link" target="_blank" href={i.link}>Open link</a> : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
