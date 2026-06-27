'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Option = { id: string; value: string }

type Props = {
  type: string
  label: string
  onClose: () => void
  onChanged?: () => void
}

export default function ManageOptionsModal({ type, label, onClose, onChanged }: Props) {
  const [options, setOptions] = useState<Option[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editError, setEditError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; value: string; count: number } | null>(null)
  const [addingNew, setAddingNew] = useState(false)
  const [newValue, setNewValue] = useState('')
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function fetchOptions() {
    const { data } = await supabase
      .from('dropdown_options')
      .select('id, value')
      .eq('type', type)
      .order('value')
    if (data) setOptions(data)
  }

  useEffect(() => { fetchOptions() }, [type])

  async function addOption() {
    const value = newValue.trim().toUpperCase()
    if (!value) return
    setLoading(true)
    await supabase.from('dropdown_options').insert({ type, value })
    setNewValue('')
    setAddingNew(false)
    await fetchOptions()
    setLoading(false)
    onChanged?.()
  }

  async function requestDelete(opt: Option) {
    setDeleteError(null)
    const { count } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq(type, opt.value)
    if ((count ?? 0) > 0) {
      setConfirmDelete({ id: opt.id, value: opt.value, count: count ?? 0 })
    } else {
      await doDelete(opt.id)
    }
  }

  async function doDelete(id: string) {
    setDeleteError(null)
    const { error } = await supabase.from('dropdown_options').delete().eq('id', id)
    if (error) {
      setDeleteError(error.message)
      setConfirmDelete(null)
    } else {
      setOptions(prev => prev.filter(o => o.id !== id))
      setConfirmDelete(null)
      onChanged?.()
    }
  }

  function startEdit(opt: Option) {
    setEditingId(opt.id)
    setEditValue(opt.value)
    setEditError(null)
    setAddingNew(false)
  }

  async function saveEdit(id: string) {
    const value = editValue.trim().toUpperCase()
    if (!value) return
    setEditError(null)
    const oldOption = options.find(o => o.id === id)
    const { error } = await supabase.from('dropdown_options').update({ value }).eq('id', id)
    if (error) {
      setEditError(error.message)
      return
    }
    if (oldOption && oldOption.value !== value) {
      const { error: bizError } = await supabase.from('businesses').update({ [type]: value }).eq(type, oldOption.value)
      if (bizError) {
        setEditError(`Businesses not updated: ${bizError.message}`)
        await fetchOptions()
        setEditingId(null)
        return
      }
    }
    await fetchOptions()
    setEditingId(null)
    onChanged?.()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white border border-gray-200 shadow-xl rounded-sm w-[380px] max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-sm font-semibold text-gray-900">Manage {label}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
        </div>

        {/* Delete error */}
        {deleteError && (
          <div className="mx-5 mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-sm shrink-0">
            <p className="text-xs text-red-700">Delete failed: {deleteError}</p>
          </div>
        )}

        {/* Confirm delete banner */}
        {confirmDelete && (
          <div className="mx-5 mt-3 px-3 py-3 bg-red-50 border border-red-200 rounded-sm shrink-0">
            <p className="text-xs text-red-700 font-medium mb-2">
              "{confirmDelete.value}" is used by {confirmDelete.count} {confirmDelete.count === 1 ? 'entry' : 'entries'}. Remove anyway?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => doDelete(confirmDelete.id)}
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

        {/* Options list */}
        <div className="flex-1 overflow-auto px-5 py-3">
          {options.length === 0 && !addingNew ? (
            <p className="text-xs text-gray-400 py-2">No options yet.</p>
          ) : (
            <div className="space-y-1">
              {options.map(opt => (
                <div key={opt.id} className="flex items-center gap-2 py-1">
                  {editingId === opt.id ? (
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex gap-2 items-center">
                        <input
                          autoFocus
                          value={editValue}
                          onChange={e => { setEditValue(e.target.value); setEditError(null) }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveEdit(opt.id)
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                          className="flex-1 border border-gray-300 px-2 py-0.5 text-sm rounded-sm focus:outline-none focus:border-gray-500"
                        />
                        <button
                          onClick={() => saveEdit(opt.id)}
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
                      <span className="flex-1 text-sm text-gray-700">{opt.value}</span>
                      <button
                        onClick={() => startEdit(opt)}
                        className="text-xs text-gray-400 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-2 py-0.5 rounded-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => requestDelete(opt)}
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

          {/* Inline add input */}
          {addingNew && (
            <div className="mt-2">
              <input
                autoFocus
                type="text"
                placeholder={`New ${label.toLowerCase()}...`}
                value={newValue}
                onChange={e => setNewValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') addOption()
                  if (e.key === 'Escape') { setAddingNew(false); setNewValue('') }
                }}
                className="w-full border border-gray-300 px-3 py-1.5 text-sm rounded-sm focus:outline-none focus:border-gray-500"
              />
            </div>
          )}

          {/* Add new trigger */}
          {!addingNew && !editingId && (
            <button
              onClick={() => setAddingNew(true)}
              className="mt-3 text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              + Add New {label}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex justify-end shrink-0">
          {addingNew ? (
            <div className="flex gap-2">
              <button
                onClick={() => { setAddingNew(false); setNewValue('') }}
                className="px-4 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addOption}
                disabled={loading || !newValue.trim()}
                className="px-4 py-1.5 text-sm bg-[#0f172a] text-white rounded-sm hover:bg-[#1e293b] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-sm hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
