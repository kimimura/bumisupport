'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CityBreadcrumb() {
  const pathname = usePathname()
  const [cityName, setCityName] = useState<string | null>(null)

  const slug = pathname.split('/').filter(Boolean)[0]

  useEffect(() => {
    if (!slug) return
    setCityName(null)
    supabase.from('cities').select('name').eq('slug', slug).single()
      .then(({ data }) => { if (data) setCityName(data.name) })
  }, [slug])

  if (!cityName) return null

  return (
    <>
      <span className="text-gray-300 text-sm">/</span>
      <span className="text-sm text-gray-500">{cityName}</span>
    </>
  )
}
