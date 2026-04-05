import { useEffect } from 'react'
import { Download, FileJson, Package } from 'lucide-react'
import { useAdminExport, type StoreInfo } from '../hooks/useAdminExport'

export default function AdminExport() {
  const { stores, isLoading, exportStore, exportAll, refreshCounts } = useAdminExport()

  useEffect(() => {
    refreshCounts()
  }, [refreshCounts])

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Package className="w-7 h-7 text-gray-700" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Admin Export</h1>
              <p className="text-sm text-gray-500 mt-0.5">Export IDB stores as JSON files</p>
            </div>
          </div>
          <button
            onClick={exportAll}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            {isLoading ? 'Exporting…' : 'Export All'}
          </button>
        </div>

        {/* Table */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Store</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">File</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Records</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {stores.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    Loading store counts…
                  </td>
                </tr>
              ) : (
                stores.map((store: StoreInfo, idx: number) => (
                  <tr
                    key={store.name}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">{store.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <FileJson className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="font-mono text-xs">{store.fileName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                      {store.count}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => exportStore(store.name)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Export
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer hint */}
        <p className="mt-4 text-xs text-gray-400 text-center">
          Files match the structure of <span className="font-mono">public/content/</span>
        </p>
      </div>
    </div>
  )
}
