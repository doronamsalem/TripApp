import React, { useState } from 'react'
import { useTrip } from '../context/TripContext'

export default function GroupsPanel() {
  const { groups, selectedGroup, setSelectedGroup, createGroup, joinGroup, loading } = useTrip()
  const [name, setName] = useState('')
  const [joinId, setJoinId] = useState('')

  const onCreate = async () => {
    if (!name) return alert('Provide a name')
    try {
      await createGroup(name)
      setName('')
    } catch (err: any) {
      alert(err.message || 'Failed to create group')
    }
  }

  const onJoin = async () => {
    if (!joinId) return
    try {
      await joinGroup(joinId)
      setJoinId('')
    } catch (err: any) {
      alert(err.message || 'Failed to join group')
    }
  }

  return (
    <div className="groups-panel">
      <div>
        <strong>Group:</strong>
        <select value={selectedGroup?.id ?? ''} onChange={e => {
          const g = groups.find((x:any)=>x.id === e.target.value)
          setSelectedGroup(g || null)
        }}>
          <option value="">-- none --</option>
          {groups.map((g:any) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      <div className="group-create">
        <input placeholder="New group name" value={name} onChange={e=>setName(e.target.value)} />
        <button onClick={onCreate}>Create</button>
      </div>

      <div className="group-join">
        <input placeholder="Group ID to join" value={joinId} onChange={e=>setJoinId(e.target.value)} />
        <button onClick={onJoin}>Join</button>
      </div>
    </div>
  )
}