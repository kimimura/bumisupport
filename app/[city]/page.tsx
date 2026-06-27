'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase, type Business, type City } from '@/lib/supabase'
import AddBusinessModal from '../_components/AddBusinessModal'
import BusinessDetailModal from '../_components/BusinessDetailModal'
import { useManage } from '../_components/ManageProvider'

const STATUS_BADGE: Record<string, string> = {
  'BUMI': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'NON BUMI': 'bg-red-50 text-red-700 border border-red-200',
}

function statusBadgeClass(status: string | null) {
  if (!status) return 'bg-gray-100 text-gray-500 border border-gray-200'
  return STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-500 border border-gray-200'
}

function Cell({ text, maxW = 'max-w-[180px]' }: { text: string | null | undefined; maxW?: string }) {
  if (!text) return <span className="text-gray-300">—</span>
  return (
    <div className={`${maxW} truncate`} title={text}>
      {text}
    </div>
  )
}

export default function CityPage() {
  const params = useParams()
  const citySlug = params.city as string

  const [city, setCity] = useState<City | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [statusOptions, setStatusOptions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterCategory, setFilterCategory] = useState('ALL')
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<Business | null>(null)
  const { registerOnChanged } = useManage()

  useEffect(() => {
    supabase.from('dropdown_options').select('value').eq('type', 'status').order('value')
      .then(({ data }) => { if (data) setStatusOptions(data.map(r => r.value)) })
  }, [])

  useEffect(() => {
    async function loadCity() {
      const { data } = await supabase.from('cities').select('*').eq('slug', citySlug).single()
      if (!data) { setNotFound(true); setLoading(false); return }
      setCity(data)
    }
    loadCity()
  }, [citySlug])

  async function fetchBusinesses() {
    if (!city) return
    setLoading(true)
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('city_id', city.id)
      .order('company', { ascending: true })
    if (!error && data) setBusinesses(data)
    setLoading(false)
  }

  useEffect(() => {
    if (!city) return
    fetchBusinesses()
    registerOnChanged(() => {
      fetchBusinesses()
      supabase.from('dropdown_options').select('value').eq('type', 'status').order('value')
        .then(({ data }) => { if (data) setStatusOptions(data.map(r => r.value)) })
    })
  }, [city])

  if (notFound) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">Location not found.</p>
      </div>
    )
  }

  const categories = ['ALL', ...Array.from(new Set(businesses.map(b => b.service_type).filter(Boolean)))]

  const filtered = businesses.filter(b => {
    const q = search.toLowerCase()
    const matchSearch = b.company.toLowerCase().includes(q) ||
      (b.location ?? '').toLowerCase().includes(q) ||
      (b.owner ?? '').toLowerCase().includes(q)
    const matchStatus = filterStatus === 'ALL' || b.status === filterStatus
    const matchCategory = filterCategory === 'ALL' || b.service_type === filterCategory
    return matchSearch && matchStatus && matchCategory
  })

  const bumiCount = businesses.filter(b => b.status === 'BUMI').length
  const nonBumiCount = businesses.filter(b => b.status === 'NON BUMI').length
  const unknownCount = businesses.filter(b => !b.status || (b.status !== 'BUMI' && b.status !== 'NON BUMI')).length

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: businesses.length, color: 'text-gray-800' },
          { label: 'Bumi-Owned', value: bumiCount, color: 'text-emerald-600' },
          { label: 'Non-Bumi', value: nonBumiCount, color: 'text-red-600' },
          { label: 'Unknown', value: unknownCount, color: 'text-gray-400' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 px-4 py-3 rounded-sm">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search name, location, owner..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 bg-white px-3 py-1.5 text-sm w-64 rounded-sm focus:outline-none focus:border-gray-400"
          />
          <div className="relative">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="appearance-none border border-gray-300 bg-white pl-3 pr-8 py-1.5 text-sm rounded-sm focus:outline-none focus:border-gray-400"
            >
              <option value="ALL">All Status</option>
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
          </div>
          <div className="relative">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="appearance-none border border-gray-300 bg-white pl-3 pr-8 py-1.5 text-sm rounded-sm focus:outline-none focus:border-gray-400"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
          </div>
          <span className="text-xs text-gray-400">{filtered.length} of {businesses.length} records</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const headers = ['#', 'Company', 'Category', 'Owner', 'Location', 'Verification', 'Tier', 'Price Range', 'Status']
              const rows = filtered.map((b, i) => [
                i + 1,
                b.company,
                b.service_type ?? '',
                b.owner ?? '',
                b.location ?? '',
                b.verification ?? '',
                b.tier ?? '',
                b.price_range ?? '',
                b.status ?? '',
              ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
              const csv = [headers.join(','), ...rows].join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `bumisupport-${citySlug}.csv`
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="border border-gray-300 text-gray-600 px-4 py-1.5 text-sm rounded-sm hover:bg-gray-50 transition-colors"
          >
            Export
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#0f172a] text-white px-4 py-1.5 text-sm rounded-sm hover:bg-[#1e293b] transition-colors"
          >
            + Add Entry
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-sm overflow-auto" style={{ maxHeight: 'calc(100vh - 260px)' }}>
        {loading ? (
          <div className="px-4 py-10 text-center text-sm text-gray-400">Loading...</div>
        ) : (
          <table className="text-sm" style={{ borderCollapse: 'collapse', minWidth: '100%' }}>
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap sticky left-0 bg-gray-50 z-10" style={{ width: 64, minWidth: 64, maxWidth: 64, paddingLeft: 24, paddingRight: 16 }}>#</th>
                <th className="px-6 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap sticky bg-gray-50 z-10" style={{ left: 64 }}>Company</th>
                <th className="px-6 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Category</th>
                <th className="px-6 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Owner</th>
                <th className="px-6 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Location</th>
                <th className="px-6 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Verification</th>
                <th className="px-6 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Tier</th>
                <th className="px-6 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Price Range</th>
                <th className="px-6 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">
                    No records found.
                  </td>
                </tr>
              ) : (
                filtered.map((b, i) => (
                  <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 text-xs text-gray-400 sticky left-0 bg-white" style={{ width: 64, minWidth: 64, maxWidth: 64, paddingLeft: 24, paddingRight: 16 }}>{i + 1}</td>
                    <td className="px-6 py-2.5 font-medium text-gray-900 sticky bg-white cursor-pointer hover:text-blue-600 transition-colors" style={{ left: 64 }} onClick={() => setSelected(b)}><Cell text={b.company} maxW="max-w-[260px]" /></td>
                    <td className="px-6 py-2.5 text-gray-600 whitespace-nowrap">{b.service_type}</td>
                    <td className="px-6 py-2.5 text-gray-600"><Cell text={b.owner} maxW="max-w-[200px]" /></td>
                    <td className="px-6 py-2.5 text-gray-600"><Cell text={b.location} maxW="max-w-[320px]" /></td>
                    <td className="px-6 py-2.5 text-gray-600 whitespace-nowrap">{b.verification}</td>
                    <td className="px-6 py-2.5 text-gray-600 whitespace-nowrap">{b.tier ?? <span className="text-gray-300">—</span>}</td>
                    <td className="px-6 py-2.5 text-gray-600 whitespace-nowrap">{b.price_range ?? <span className="text-gray-300">—</span>}</td>
                    <td className="px-6 py-2.5 whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded-sm font-medium inline-block text-center w-32 ${statusBadgeClass(b.status)}`}>
                        {b.status ?? '—'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && city && (
        <AddBusinessModal
          cityId={city.id}
          onClose={() => setShowModal(false)}
          onAdded={fetchBusinesses}
        />
      )}

      {selected && (
        <BusinessDetailModal
          business={selected}
          onClose={() => setSelected(null)}
          onUpdated={fetchBusinesses}
        />
      )}
    </div>
  )
}
