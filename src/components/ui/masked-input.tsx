'use client'

import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef, useState } from 'react'

interface MaskedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  error?: string
  mask: (value: string) => string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ className, label, error, id, mask, defaultValue, onChange, ...props }, ref) => {
    const [value, setValue] = useState(() => {
      const initial = (defaultValue as string) || ''
      return initial ? mask(initial) : ''
    })

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const masked = mask(e.target.value)
      setValue(masked)
      e.target.value = masked
      onChange?.(e)
    }

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          value={value}
          onChange={handleChange}
          className={cn(
            'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    )
  }
)

MaskedInput.displayName = 'MaskedInput'
