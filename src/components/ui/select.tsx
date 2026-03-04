'use client'

import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface SelectProps {
  id?: string
  name?: string
  label?: string
  error?: string
  options: { value: string; label: string }[]
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  disabled?: boolean
  className?: string
}

export function Select({
  id,
  name,
  label,
  error,
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  disabled,
  className,
}: SelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || '')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const isControlled = controlledValue !== undefined
  const currentValue = isControlled ? controlledValue : internalValue
  const selectedOption = options.find((o) => o.value === currentValue)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('keydown', handleEsc)
    }
    return () => document.removeEventListener('keydown', handleEsc)
  }, [open])

  function handleSelect(val: string) {
    if (!isControlled) {
      setInternalValue(val)
    }
    onChange?.(val)
    setOpen(false)
  }

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      {name && <input type="hidden" name={name} value={currentValue} />}
      <div className="relative">
        <button
          id={id}
          type="button"
          disabled={disabled}
          onClick={() => setOpen(!open)}
          className={cn(
            'flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-left focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            open && 'border-blue-500 ring-1 ring-blue-500',
            className
          )}
        >
          <span className={cn(!selectedOption?.value && 'text-gray-400')}>
            {selectedOption?.label || 'Selecione...'}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-gray-400 transition-transform',
              open && 'rotate-180'
            )}
          />
        </button>
        {open && (
          <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm hover:bg-blue-50 hover:text-blue-700',
                    option.value === currentValue
                      ? 'bg-blue-50 font-medium text-blue-700'
                      : 'text-gray-700'
                  )}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
