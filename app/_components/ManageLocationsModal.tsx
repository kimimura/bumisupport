'use client'

import { useState } from 'react'
import { supabase, type City } from '@/lib/supabase'

type Props = {
  cities: City[]
  onClose: () => void
  onChanged: () => void
}

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function ManageLocationsModal({ cities, onClose, onChanged }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editError, setEditError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ city: City; count: number } | null>(null)

  function startEdit(city: City) {
    setEditingId(city.id)
    setEditValue(city.name)
    setEditError(null)
  }

  async function saveEdit(city: City) {
    const name = editValue.trim()
    if (!name) return
    setEditError(null)
    const { error } = await supabase
      .from('cities')
      .update({ name, slug: toSlug(name) })
      .eq('id', city.id)
    if (error) {
      setEditError(error.message)
      return
    }
    setEditingId(null)
    onChanged()
  }

  async function requestDelete(city: City) {
    const { count } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('city_id', city.id)
    setConfirmDelete({ city, count: count ?? 0 })
  }

  async function doDelete(city: City) {
    await supabase.from('businesses').delete().eq('city_id', city.id)
    await supabase.from('cities').delete().eq('id', city.id)
    setConfirmDelete(null)
    onChanged()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white border border-gray-200 shadow-xl rounded-sm w-[380px] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-sm font-semibold text-gray-900">Manage Locations</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
        </div>

        {confirmDelete && (
          <div className="mx-5 mt-3 px-3 py-3 bg-red-50 border border-red-200 rounded-sm shrink-0">
            <p className="text-xs text-red-700 font-medium mb-2">
              {confirmDelete.count > 0
                ? `Removing "${confirmDelete.city.name}" will also delete ${confirmDelete.count} business ${confirmDelete.count === 1 ? 'entry' : 'entries'}. Continue?`
                : `Remove "${confirmDelete.city.name}"?`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => doDelete(confirmDelete.city)}
                className="text-xs px-3 py-1 bg-red-600 text-white rounded-sm hover:bg-red-700 transition-colors"
              >
                Yes, remove
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="text-xs px-3 py-1 border border-gray-300 text-gray-600 rounded-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto px-5 py-3">
          {cities.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">No locations yet.</p>
          ) : (
            <div className="space-y-1">
              {cities.map(city => (
                <div key={city.id} className="flex items-center gap-2 py-1">
                  {editingId === city.id ? (
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex gap-2 items-center">
                        <input
                          autoFocus
                          value={editValue}
                          onChange={e => { setEditValue(e.target.value); setEditError(null) }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveEdit(city)
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                          className="flex-1 border border-gray-300 px-2 py-0.5 text-sm rounded-sm focus:outline-none focus:border-gray-500"
                        />
                        <button
                          onClick={() => saveEdit(city)}
                          className="text-xs text-white bg-[#0f172a] px-2 py-0.5 rounded-sm hover:bg-[#1e293b] shrink-0"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditError(null) }}
                          className="text-xs text-gray-400 hover:text-gray-600 shrink-0"
                        >
                          ×
                        </button>
                      </div>
                      {editError && <p className="text-xs text-red-500">{editError}</p>}
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 text-sm text-gray-700">{city.name}</span>
                      <button
                        onClick={() => startEdit(city)}
                        className="text-xs text-gray-400 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-2 py-0.5 rounded-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => requestDelete(city)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors text-base leading-none w-6 h-6 flex items-center justify-center rounded-sm border border-gray-200 hover:border-red-200"
                      >
                        ×
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-sm hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
