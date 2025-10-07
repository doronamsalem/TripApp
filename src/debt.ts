import type { Expense } from './types'

export function summarizeDebts(expenses: Expense[]) {
  // owes_A positive => A owes; negative => A is owed
  const netA = expenses.reduce((s, e) => s + e.owes_A, 0)
  const netB = expenses.reduce((s, e) => s + e.owes_B, 0)
  return { netA, netB }
}

export function computeShares(amountILS:number, split_type: 'HALF'|'ALL_TO_A'|'ALL_TO_B'|'CUSTOM', custom_pct_to_A?: number|null) {
  let shareA = 0, shareB = 0
  if (split_type === 'HALF') { shareA = amountILS/2; shareB = amountILS/2 }
  else if (split_type === 'ALL_TO_A') { shareA = amountILS; shareB = 0 }
  else if (split_type === 'ALL_TO_B') { shareA = 0; shareB = amountILS }
  else { // CUSTOM
    const p = Math.max(0, Math.min(100, custom_pct_to_A ?? 50))
    shareA = amountILS * (p/100)
    shareB = amountILS - shareA
  }
  return { shareA, shareB }
}

export function computeExpenseDerived(amount:number, rate:number, payer:'A'|'B', split_type: 'HALF'|'ALL_TO_A'|'ALL_TO_B'|'CUSTOM', custom_pct_to_A?: number|null) {
  const amountILS = amount * rate
  const { shareA, shareB } = computeShares(amountILS, split_type, custom_pct_to_A)
  const paidA = payer === 'A' ? amountILS : 0
  const paidB = payer === 'B' ? amountILS : 0
  const owes_A = shareA - paidA
  const owes_B = shareB - paidB
  return { amountILS, shareA, shareB, paidA, paidB, owes_A, owes_B }
}
