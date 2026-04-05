import { useNavigate } from 'react-router-dom'
import { Plus, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAdminData } from '../hooks/useAdminData'
import AdminTable, { type Column } from '../components/AdminTable'
import type { Guide } from '@/data/types'

export default function AdminGuideList() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { items, isLoading, remove } = useAdminData<Guide>('guides')

  const COLUMNS: Column<Guide>[] = [
    {
      key: 'name',
      label: t('admin.guides.columns.name'),
      sortable: true,
      render: (guide) => (
        <span className="font-medium text-gray-900">{guide.name.ru}</span>
      ),
    },
    {
      key: 'languages',
      label: t('admin.guides.columns.languages'),
      render: (guide) => (
        <div className="flex flex-wrap gap-1">
          {guide.languages.map((lang) => (
            <span
              key={lang}
              className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"
            >
              {lang}
            </span>
          ))}
          {guide.languages.length === 0 && (
            <span className="text-sm text-gray-400">—</span>
          )}
        </div>
      ),
    },
    {
      key: 'specializations',
      label: t('admin.guides.columns.specializations'),
      render: (guide) => (
        <div className="flex flex-wrap gap-1">
          {guide.specializations.slice(0, 3).map((s) => (
            <span
              key={s}
              className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700"
            >
              {s}
            </span>
          ))}
          {guide.specializations.length > 3 && (
            <span className="text-xs text-gray-400">+{guide.specializations.length - 3}</span>
          )}
          {guide.specializations.length === 0 && (
            <span className="text-sm text-gray-400">—</span>
          )}
        </div>
      ),
    },
    {
      key: 'rating',
      label: t('admin.guides.columns.rating'),
      sortable: true,
      width: '90px',
      render: (guide) => (
        <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-800">
          <Star size={13} className="text-amber-400 fill-amber-400" />
          {guide.rating > 0 ? guide.rating.toFixed(1) : '—'}
        </span>
      ),
    },
    {
      key: 'tourCount',
      label: t('admin.guides.columns.tours'),
      sortable: true,
      width: '70px',
      render: (guide) => (
        <span className="text-sm text-gray-600">{guide.tourCount}</span>
      ),
    },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{t('admin.guides.title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} {t('admin.common.total')}</p>
        </div>
        <button
          onClick={() => navigate('/admin/guides/new')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          <Plus size={16} />
          {t('admin.guides.newButton')}
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-16 text-center text-gray-400 text-sm">Loading…</div>
      ) : (
        <AdminTable<Guide>
          columns={COLUMNS}
          data={items}
          searchKeys={['name.ru', 'name.en', 'specializations', 'languages']}
          searchPlaceholder={t('admin.guides.searchPlaceholder')}
          emptyMessage={t('admin.guides.emptyMessage')}
          onEdit={(guide) => navigate(`/admin/guides/${guide.id}`)}
          onDelete={(guide) => remove(guide.id)}
          getId={(guide) => guide.id}
        />
      )}
    </div>
  )
}
