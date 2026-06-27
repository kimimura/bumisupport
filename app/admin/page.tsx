'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const CATEGORIES = ['CAR WASH', 'RESTAURANT', 'RETAIL', 'SERVICES', 'OTHER']

export default function AdminPage() {
  const [form, setForm] = useState({
    company: '',
    service_type: 'CAR WASH',
    owner: '',
    verification: '',
    location: '',
    status: 'BUMI' as 'BUMI' | 'NON BUMI' | '-',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.company.trim()) return
    setLoading(true)
    setMessage(null)
    const { error } = await supabase.from('businesses').insert([form])
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Business added successfully.' })
      setForm({ company: '', service_type: 'CAR WASH', owner: '', verification: '', location: '', status: 'BUMI' })
    }
    setLoading(false)
  }

  const fields: { label: string; key: keyof typeof form; required?: boolean }[] = [
    { label: 'Company Name', key: 'company', required: true },
    { label: 'Owner', key: 'owner' },
    { label: 'Location', key: 'location' },
    { label: 'Verification Source', key: 'verification' },
  ]

  return (
    <div>
      <div className="bg-white border border-gray-400 mb-4">
        <div className="bg-[#003580] text-white px-3 py-1 text-xs font-bold">
          Add New Business
        </div>
        <div className="p-4">
          <form onSubmit={handleSubmit}>
            <table className="border-collapse text-xs" style={{ width: '100%', maxWidth: 560 }}>
              <tbody>
                {fields.map(f => (
                  <tr key={f.key}>
                    <td className="border border-gray-300 px-2 py-1 bg-gray-50 w-36 font-medium">
                      {f.label}{f.required && <span className="text-red-600"> *</span>}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        required={f.required}
                        value={form[f.key] as string}
                        onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className="w-full border border-gray-300 px-1 py-0.5 text-xs"
                      />
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="border border-gray-300 px-2 py-1 bg-gray-50 font-medium">Category</td>
                  <td className="border border-gray-300 px-2 py-1">
                    <select
                      value={form.service_type}
                      onChange={e => setForm(prev => ({ ...prev, service_type: e.target.value }))}
                      className="border border-gray-300 px-1 py-0.5 text-xs"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-2 py-1 bg-gray-50 font-medium">Status</td>
                  <td className="border border-gray-300 px-2 py-1">
                    <div className="flex gap-4">
                      {(['BUMI', 'NON BUMI', '-'] as const).map(s => (
                        <label key={s} className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name="status"
                            value={s}
                            checked={form.status === s}
                            onChange={() => setForm(prev => ({ ...prev, status: s }))}
                          />
                          <span>{s === '-' ? 'Unknown' : s}</span>
                        </label>
                      ))}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-2 py-1 bg-gray-50" />
                  <td className="border border-gray-300 px-2 py-1">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-[#003580] text-white px-4 py-1 text-xs border border-[#002060] hover:bg-[#002060] disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Add Business'}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </form>

          {message && (
            <div className={`mt-3 px-3 py-2 text-xs border ${message.type === 'success' ? 'bg-[#d4edda] border-[#c3e6cb] text-[#155724]' : 'bg-[#f8d7da] border-[#f5c6cb] text-[#721c24]'}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
