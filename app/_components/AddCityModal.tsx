'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type Props = {
  onClose: () => void
  onAdded: () => void
}

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function AddCityModal({ onClose, onAdded }: Props) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const slug = toSlug(name)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !slug) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.from('cities').insert({ name: name.trim(), slug })
    if (error) {
      setError(error.message.includes('unique') ? 'A location with this name already exists.' : error.message)
      setLoading(false)
    } else {
      onAdded()
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white border border-gray-200 shadow-xl rounded-sm w-[400px]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Add New Location</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              City / Area Name <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Kuala Lumpur"
              className="w-full border border-gray-300 px-3 py-1.5 text-sm rounded-sm focus:outline-none focus:border-gray-500"
            />
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="bg-[#0f172a] text-white px-4 py-1.5 text-sm rounded-sm hover:bg-[#1e293b] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Adding...' : 'Add Location'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
