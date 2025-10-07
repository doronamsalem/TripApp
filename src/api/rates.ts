export async function getRateToILS(currency: 'ILS'|'USD'|'EUR'|'THB'): Promise<number> {
  if (currency === 'ILS') return 1
  // exchangerate.host free API
  // We ask for ILS as target
  const res = await fetch(`https://api.exchangerate.host/latest?base=${currency}&symbols=ILS`)
  if (!res.ok) throw new Error('Failed to fetch rate')
  const data = await res.json()
  const rate = data?.rates?.ILS
  if (!rate) throw new Error('No ILS rate')
  return rate
}
