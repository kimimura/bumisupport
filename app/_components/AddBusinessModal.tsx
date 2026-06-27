'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type DropdownOptions = {
  service_type: string[]
  verification: string[]
  status: string[]
}

type Props = {
  cityId: string
  onClose: () => void
  onAdded: () => void
}

const EMPTY_FORM = {
  company: '',
  owner: '',
  location: '',
  service_type: '',
  verification: '',
  status: '',
  tier: '',
  price_range: '',
}

export default function AddBusinessModal({ cityId, onClose, onAdded }: Props) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [options, setOptions] = useState<DropdownOptions>({ service_type: [], verification: [], status: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOptions() {
      const { data } = await supabase.from('dropdown_options').select('type, value').order('value')
      if (data) {
        const grouped: DropdownOptions = { service_type: [], verification: [], status: [] }
        data.forEach(row => {
          if (row.type in grouped) grouped[row.type as keyof DropdownOptions].push(row.value)
        })
        setOptions(grouped)
        setForm(f => ({
          ...f,
          service_type: grouped.service_type[0] ?? '',
          verification: grouped.verification[0] ?? '',
          status: grouped.status[0] ?? '',
        }))
      }
    }
    loadOptions()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.company.trim()) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.from('businesses').insert([{ ...form, city_id: cityId }])
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      onAdded()
      onClose()
    }
  }

  const dropdowns: { label: string; key: keyof DropdownOptions }[] = [
    { label: 'Service Type', key: 'service_type' },
    { label: 'Verification', key: 'verification' },
    { label: 'Status', key: 'status' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white border border-gray-200 shadow-xl rounded-sm w-[480px] max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Add New Business</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {([
            { label: 'Company Name', key: 'company' as const, required: true },
            { label: 'Owner', key: 'owner' as const },
            { label: 'Location', key: 'location' as const },
            { label: 'Tier', key: 'tier' as const },
            { label: 'Price Range', key: 'price_range' as const },
          ] as { label: string; key: keyof typeof EMPTY_FORM; required?: boolean }[]).map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {f.label}{f.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <input
                type="text"
                required={f.required}
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full border border-gray-300 px-3 py-1.5 text-sm rounded-sm focus:outline-none focus:border-gray-500"
              />
            </div>
          ))}

          {dropdowns.map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
              <div className="relative">
                <select
                  value={form[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  className="appearance-none w-full border border-gray-300 bg-white pl-3 pr-8 py-1.5 text-sm rounded-sm focus:outline-none focus:border-gray-500"
                >
                  {options[key].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
              </div>
            </div>
          ))}

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0f172a] text-white px-4 py-1.5 text-sm rounded-sm hover:bg-[#1e293b] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Save Business'}
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
