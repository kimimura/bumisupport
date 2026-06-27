'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase, type City } from '@/lib/supabase'
import { useManage } from './ManageProvider'
import AddCityModal from './AddCityModal'
import ManageLocationsModal from './ManageLocationsModal'

const MANAGE = [
  { label: 'Category', type: 'service_type' },
  { label: 'Verification', type: 'verification' },
  { label: 'Status', type: 'status' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { open } = useManage()
  const [cities, setCities] = useState<City[]>([])
  const [showAddCity, setShowAddCity] = useState(false)
  const [showManageLocations, setShowManageLocations] = useState(false)

  async function fetchCities() {
    const { data } = await supabase.from('cities').select('*').order('name')
    if (data) setCities(data)
  }

  useEffect(() => { fetchCities() }, [])

  return (
    <>
      <div className="w-52 shrink-0 flex flex-col bg-[#0f172a] text-white min-h-screen">
        <div className="px-4 py-4 border-b border-white/10">
          <div className="text-sm font-semibold tracking-tight">BumiSupport+</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Business Directory</div>
        </div>

        <nav className="flex-1 px-2 py-3 overflow-auto">
          <p className="px-2 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Locations</p>
          {cities.map(city => (
            <Link
              key={city.id}
              href={`/${city.slug}`}
              className={`flex items-center px-3 py-2 text-xs rounded-sm transition-colors ${
                pathname === `/${city.slug}`
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {city.name}
            </Link>
          ))}
          <button
            onClick={() => setShowAddCity(true)}
            className="w-full text-left flex items-center px-3 py-2 text-xs rounded-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            + Add Location
          </button>

          <p className="px-2 pt-5 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Manage</p>
          {MANAGE.map(item => (
            <button
              key={item.type}
              onClick={() => open(item.type, item.label)}
              className="w-full text-left flex items-center px-3 py-2 text-xs rounded-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => setShowManageLocations(true)}
            className="w-full text-left flex items-center px-3 py-2 text-xs rounded-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            Locations
          </button>
        </nav>

        <div className="px-4 py-3 border-t border-white/10 text-[10px] text-slate-600">
          v1.0.0
        </div>
      </div>

      {showAddCity && (
        <AddCityModal
          onClose={() => setShowAddCity(false)}
          onAdded={() => { fetchCities(); setShowAddCity(false) }}
        />
      )}

      {showManageLocations && (
        <ManageLocationsModal
          cities={cities}
          onClose={() => setShowManageLocations(false)}
          onChanged={() => {
            fetchCities()
            const stillExists = cities.some(c => pathname === `/${c.slug}`)
            if (!stillExists) router.push('/')
          }}
        />
      )}
    </>
  )
}
