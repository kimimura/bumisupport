'use client'

import { useEffect, useState } from 'react'
import { supabase, type Business } from '@/lib/supabase'

type Props = {
  business: Business
  onClose: () => void
  onUpdated: () => void
}

const STATUS_BADGE: Record<string, string> = {
  'BUMI': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'NON BUMI': 'bg-red-50 text-red-700 border border-red-200',
  '-': 'bg-gray-100 text-gray-500 border border-gray-200',
}

const TEXT_FIELDS: { label: string; key: keyof Business }[] = [
  { label: 'Company', key: 'company' },
  { label: 'Owner', key: 'owner' },
  { label: 'Location', key: 'location' },
  { label: 'Tier', key: 'tier' },
  { label: 'Price Range', key: 'price_range' },
]

const DROPDOWN_FIELDS: { label: string; key: keyof Business; optionKey: string }[] = [
  { label: 'Category', key: 'service_type', optionKey: 'service_type' },
  { label: 'Verification', key: 'verification', optionKey: 'verification' },
  { label: 'Status', key: 'status', optionKey: 'status' },
]

const VIEW_ORDER: { label: string; key: keyof Business }[] = [
  { label: 'Owner', key: 'owner' },
  { label: 'Location', key: 'location' },
  { label: 'Verification', key: 'verification' },
  { label: 'Tier', key: 'tier' },
  { label: 'Price Range', key: 'price_range' },
  { label: 'Status', key: 'status' },
]

export default function BusinessDetailModal({ business, onClose, onUpdated }: Props) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Business>>({ ...business })
  const [options, setOptions] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOptions() {
      const { data } = await supabase.from('dropdown_options').select('type, value').order('value')
      if (data) {
        const grouped: Record<string, string[]> = {}
        data.forEach(row => {
          if (!grouped[row.type]) grouped[row.type] = []
          grouped[row.type].push(row.value)
        })
        setOptions(grouped)
      }
    }
    loadOptions()
  }, [])

  async function handleSave() {
    setLoading(true)
    setError(null)
    const { error } = await supabase
      .from('businesses')
      .update({
        company: form.company,
        owner: form.owner,
        location: form.location,
        service_type: form.service_type,
        verification: form.verification,
        status: form.status,
        tier: form.tier,
        price_range: form.price_range,
      })
      .eq('id', business.id)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      onUpdated()
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white border border-gray-200 shadow-xl rounded-sm w-[460px] max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 leading-snug">
              {editing ? form.company || business.company : business.company}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{business.service_type}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none ml-4 shrink-0">×</button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          {editing ? (
            <>
              {TEXT_FIELDS.map(({ label, key }) => (
                <div key={key} className="flex gap-3 items-center">
                  <span className="text-xs text-gray-400 w-24 shrink-0">{label}</span>
                  <input
                    type="text"
                    value={(form[key] as string) ?? ''}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="flex-1 border border-gray-300 px-2 py-1 text-xs rounded-sm focus:outline-none focus:border-gray-500"
                  />
                </div>
              ))}
              {DROPDOWN_FIELDS.map(({ label, key, optionKey }) => (
                <div key={key} className="flex gap-3 items-center">
                  <span className="text-xs text-gray-400 w-24 shrink-0">{label}</span>
                  <div className="relative flex-1">
                    <select
                      value={(form[key] as string) ?? ''}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="appearance-none w-full border border-gray-300 bg-white pl-2 pr-7 py-1 text-xs rounded-sm focus:outline-none focus:border-gray-500"
                    >
                      {(options[optionKey] ?? []).map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
                  </div>
                </div>
              ))}
              {error && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-sm">
                  {error}
                </div>
              )}
            </>
          ) : (
            VIEW_ORDER.map(({ label, key }) => {
              const value = business[key]
              return (
                <div key={key} className="flex gap-3">
                  <span className="text-xs text-gray-400 w-24 shrink-0 pt-0.5">{label}</span>
                  {key === 'status' ? (
                    <span className={`text-xs px-2 py-0.5 rounded-sm font-medium self-start ${STATUS_BADGE[value as string ?? '-'] ?? STATUS_BADGE['-']}`}>
                      {value ?? '—'}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-800 leading-relaxed">{value ?? <span className="text-gray-300">—</span>}</span>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex justify-between">
          {editing ? (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-1.5 text-sm bg-[#0f172a] text-white rounded-sm hover:bg-[#1e293b] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => { setEditing(false); setForm({ ...business }); setError(null) }}
                className="px-4 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-sm hover:bg-gray-50 transition-colors"
            >
              Edit
            </button>
          )}
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
