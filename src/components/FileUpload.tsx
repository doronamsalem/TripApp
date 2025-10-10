import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useTrip } from '../context/TripContext'

export default function FileUpload({ related_type, related_id }: { related_type: 'itinerary'|'expense'|'link', related_id: string }) {
  const [busy, setBusy] = useState(false)
  const { selectedGroup } = useTrip()

  const onFile = async (e: any) => {
    const file: File = e.target.files[0]
    if (!file || !selectedGroup) return alert('Select group and a file')
    setBusy(true)
    try {
      const path = `${selectedGroup.id}/${Date.now()}_${file.name}`
      const { error: upErr } = await supabase.storage.from('trip-attachments').upload(path, file)
      if (upErr) throw upErr
      const { data } = await supabase.storage.from('trip-attachments').getPublicUrl(path)
      // store metadata
      await supabase.from('attachments').insert({
        group_id: selectedGroup.id,
        related_type,
        related_id,
        filename: file.name,
        storage_path: path,
        public_url: data.publicUrl
      })
      alert('Uploaded')
    } catch (err: any) {
      alert(err.message || 'Upload failed')
    } finally { setBusy(false) }
  }

  return <input type="file" onChange={onFile} disabled={busy} />
}