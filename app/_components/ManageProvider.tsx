'use client'

import { createContext, useContext, useRef, useState } from 'react'
import ManageOptionsModal from './ManageOptionsModal'

type ManageContextType = {
  open: (type: string, label: string) => void
  registerOnChanged: (fn: () => void) => void
  notifyChanged: () => void
}

const ManageContext = createContext<ManageContextType>({
  open: () => {},
  registerOnChanged: () => {},
  notifyChanged: () => {},
})

export function useManage() {
  return useContext(ManageContext)
}

export function ManageProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<{ type: string; label: string } | null>(null)
  const onChangedRef = useRef<(() => void) | null>(null)

  function registerOnChanged(fn: () => void) { onChangedRef.current = fn }
  function notifyChanged() { onChangedRef.current?.() }

  return (
    <ManageContext.Provider value={{ open: (type, label) => setActive({ type, label }), registerOnChanged, notifyChanged }}>
      {children}
      {active && (
        <ManageOptionsModal
          type={active.type}
          label={active.label}
          onClose={() => setActive(null)}
          onChanged={notifyChanged}
        />
      )}
    </ManageContext.Provider>
  )
}
