import type { ReactNode } from 'react'

interface AdminFormFieldProps {
  label: string
  required?: boolean
  children: ReactNode
  error?: string
}

export function AdminFormField({ label, required, children, error }: AdminFormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
