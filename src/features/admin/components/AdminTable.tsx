import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Fuse from 'fuse.js'
import { Pencil, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'

export interface Column<T> {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

interface AdminTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  searchKeys?: string[]
  searchPlaceholder?: string
  emptyMessage?: string
  getId?: (item: T) => string
}

const PAGE_SIZE = 25

type SortDir = 'asc' | 'desc' | null

export default function AdminTable<T extends Record<string, unknown>>({
  columns,
  data,
  onEdit,
  onDelete,
  searchKeys = [],
  searchPlaceholder,
  emptyMessage,
  getId = (item) => String((item as Record<string, unknown>).id ?? ''),
}: AdminTableProps<T>) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null)

  const resolvedSearchPlaceholder = searchPlaceholder ?? t('admin.common.search')
  const resolvedEmptyMessage = emptyMessage ?? t('admin.common.noItems')

  const fuse = useMemo(
    () =>
      searchKeys.length > 0
        ? new Fuse(data, { keys: searchKeys, threshold: 0.35 })
        : null,
    [data, searchKeys],
  )

  const filtered = useMemo(() => {
    if (!query.trim() || !fuse) return data
    return fuse.search(query).map((r) => r.item)
  }, [query, fuse, data])

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered
    return [...filtered].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av ?? '').localeCompare(String(bv ?? ''))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const pageData = sorted.slice(start, start + PAGE_SIZE)

  function handleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir('asc')
    } else if (sortDir === 'asc') {
      setSortDir('desc')
    } else {
      setSortKey(null)
      setSortDir(null)
    }
    setPage(1)
  }

  function handleSearch(value: string) {
    setQuery(value)
    setPage(1)
  }

  function SortIcon({ colKey }: { colKey: string }) {
    if (sortKey !== colKey) return <ChevronsUpDown size={14} className="text-gray-400" />
    if (sortDir === 'asc') return <ChevronUp size={14} className="text-blue-600" />
    return <ChevronDown size={14} className="text-blue-600" />
  }

  const showActions = !!(onEdit || onDelete)

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <input
        type="search"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={resolvedSearchPlaceholder}
        className="w-full max-w-sm px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider select-none ${col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && <SortIcon colKey={col.key} />}
                  </span>
                </th>
              ))}
              {showActions && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                  {t('admin.common.actions')}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="px-4 py-12 text-center text-gray-400 text-sm"
                >
                  {resolvedEmptyMessage}
                </td>
              </tr>
            ) : (
              pageData.map((item) => (
                <tr
                  key={getId(item)}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-800">
                      {col.render
                        ? col.render(item)
                        : String(item[col.key] ?? '')}
                    </td>
                  ))}
                  {showActions && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={t('admin.common.edit')}
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={t('admin.common.delete')}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {sorted.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {t('admin.common.showing', {
              start: start + 1,
              end: Math.min(start + PAGE_SIZE, sorted.length),
              total: sorted.length,
            })}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {t('admin.common.prev')}
            </button>
            <span className="px-2">
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {t('admin.common.next')}
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('admin.common.deleteTitle')}
        message={t('admin.common.deleteMessage')}
        onConfirm={() => {
          if (deleteTarget) onDelete?.(deleteTarget)
          setDeleteTarget(null)
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
