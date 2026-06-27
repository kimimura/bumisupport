'use client'

import { useState } from 'react'
import { supabase, type City } from '@/lib/supabase'

type Props = {
  city: City
  onClose: () => void
  onUpdated: () => void
  onDeleted: () => void
}

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function EditCityModal({ city, onClose, onUpdated, onDeleted }: Props) {
  const [name, setName] = useState(city.name)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [businessCount, setBusinessCount] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || trimmed === city.name) { onClose(); return }
    setLoading(true)
    setError(null)
    const { error } = await supabase
      .from('cities')
      .update({ name: trimmed, slug: toSlug(trimmed) })
      .eq('id', city.id)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      onUpdated()
      onClose()
    }
  }

  async function requestDelete() {
    const { count } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('city_id', city.id)
    setBusinessCount(count ?? 0)
    setConfirmingDelete(true)
  }

  async function handleDelete() {
    setDeleting(true)
    await supabase.from('businesses').delete().eq('city_id', city.id)
    await supabase.from('cities').delete().eq('id', city.id)
    onDeleted()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white border border-gray-200 shadow-xl rounded-sm w-[400px]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Edit Location</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
        </div>

        {confirmingDelete ? (
          <div className="px-5 py-4 space-y-4">
            {(businessCount ?? 0) > 0 ? (
              <p className="text-xs text-gray-600">
                This will permanently delete <span className="font-medium text-red-600">{businessCount} business {businessCount === 1 ? 'entry' : 'entries'}</span> under "{city.name}". This cannot be undone.
              </p>
            ) : (
              <p className="text-xs text-gray-600">Remove "{city.name}"? It has no entries.</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-1.5 text-sm bg-red-600 text-white rounded-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Removing...' : 'Yes, remove'}
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="px-4 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="px-5 py-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">City / Area Name</label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-gray-300 px-3 py-1.5 text-sm rounded-sm focus:outline-none focus:border-gray-500"
              />
            </div>
            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-sm">{error}</div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={requestDelete}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                Remove location
              </button>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="bg-[#0f172a] text-white px-4 py-1.5 text-sm rounded-sm hover:bg-[#1e293b] disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
