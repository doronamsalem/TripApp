import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

type Group = { id: string; name: string; created_by: string }

const TripContext = createContext<any>(null)

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const user = (await supabase.auth.getUser()).data.user
      if (!user) { setGroups([]); setLoading(false); return }
      // fetch groups the user belongs to
      const { data, error } = await supabase
        .from('group_members')
        .select('group(id,name,created_by)')
        .eq('user_id', user.id)
      if (!error && data) {
        const gs = data.map((r: any) => r.group)
        setGroups(gs)
        if (gs.length > 0 && !selectedGroup) setSelectedGroup(gs[0])
      }
      setLoading(false)
    }
    load()
    const sub = supabase
      .channel('public:group_members')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members' }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [])

  async function createGroup(name: string) {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Not signed in')
    const { data, error } = await supabase.from('groups').insert({ name, created_by: user.id }).select().single()
    if (error) throw error
    // add membership
    await supabase.from('group_members').insert({ group_id: data.id, user_id: user.id, role: 'owner' })
    setGroups(prev => [...prev, data])
    setSelectedGroup(data)
    return data
  }

  async function joinGroup(groupId: string) {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Not signed in')
    await supabase.from('group_members').upsert({ group_id: groupId, user_id: user.id, role: 'member' })
    // reload handled by subscription
  }

  return (
    <TripContext.Provider value={{ groups, selectedGroup, setSelectedGroup, createGroup, joinGroup, loading }}>
      {children}
    </TripContext.Provider>
  )
}

export const useTrip = () => useContext(TripContext)
export default TripContext