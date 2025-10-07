import dayjs from 'dayjs'
export const fmtILS = (x:number) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 2 }).format(x)
export const nowIso = () => dayjs().toISOString()
export const combineDateTime = (d:string, t:string) => dayjs(`${d}T${t}`).toDate()
