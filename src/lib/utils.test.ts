import { describe, it, expect } from 'vitest'
import {
  cn,
  formatCurrency,
  formatDate,
  formatPhone,
  maskPhone,
  maskCpfCnpj,
  isPro,
  STATUS_LABELS,
  STATUS_COLORS,
  UNIT_OPTIONS,
  FREE_BUDGET_LIMIT,
} from './utils'
import type { Profile } from '@/types/database'

// ─── cn ───────────────────────────────────────────────

describe('cn', () => {
  it('merges multiple class strings', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden')).toBe('base')
    expect(cn('base', true && 'visible')).toBe('base visible')
  })

  it('resolves Tailwind conflicts (last wins)', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })

  it('returns empty string for no args', () => {
    expect(cn()).toBe('')
  })
})

// ─── formatCurrency ───────────────────────────────────

describe('formatCurrency', () => {
  it('formats integer value', () => {
    expect(formatCurrency(1500)).toBe('R$\u00a01.500,00')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('R$\u00a00,00')
  })

  it('formats decimal value', () => {
    expect(formatCurrency(19.9)).toBe('R$\u00a019,90')
  })

  it('formats single cent', () => {
    expect(formatCurrency(0.01)).toBe('R$\u00a00,01')
  })

  it('formats large values with thousand separators', () => {
    expect(formatCurrency(1234567.89)).toBe('R$\u00a01.234.567,89')
  })
})

// ─── formatDate ───────────────────────────────────────

describe('formatDate', () => {
  it('formats ISO date string', () => {
    // Use midday to avoid timezone edge cases
    const result = formatDate('2026-03-15T12:00:00Z')
    expect(result).toBe('15/03/2026')
  })

  it('formats another date', () => {
    const result = formatDate('2025-12-25T12:00:00Z')
    expect(result).toBe('25/12/2025')
  })
})

// ─── formatPhone ──────────────────────────────────────

describe('formatPhone', () => {
  it('formats 11-digit phone', () => {
    expect(formatPhone('11999887766')).toBe('(11) 99988-7766')
  })

  it('returns input unchanged if not 11 digits', () => {
    expect(formatPhone('1199988')).toBe('1199988')
  })

  it('strips non-digits before checking length', () => {
    expect(formatPhone('(11) 99988-7766')).toBe('(11) 99988-7766')
  })

  it('returns empty string for empty input', () => {
    expect(formatPhone('')).toBe('')
  })
})

// ─── maskPhone ────────────────────────────────────────

describe('maskPhone', () => {
  it('returns empty for empty input', () => {
    expect(maskPhone('')).toBe('')
  })

  it('formats 1 digit', () => {
    expect(maskPhone('1')).toBe('(1')
  })

  it('formats 2 digits', () => {
    expect(maskPhone('11')).toBe('(11')
  })

  it('formats 3 digits', () => {
    expect(maskPhone('119')).toBe('(11) 9')
  })

  it('formats 5 digits', () => {
    expect(maskPhone('11999')).toBe('(11) 999')
  })

  it('formats 7 digits', () => {
    expect(maskPhone('1199988')).toBe('(11) 99988')
  })

  it('formats 8 digits (adds dash)', () => {
    expect(maskPhone('11999887')).toBe('(11) 99988-7')
  })

  it('formats complete 11 digits', () => {
    expect(maskPhone('11999887766')).toBe('(11) 99988-7766')
  })

  it('truncates beyond 11 digits', () => {
    expect(maskPhone('119998877661')).toBe('(11) 99988-7766')
  })

  it('strips existing formatting and re-formats', () => {
    expect(maskPhone('(11) 999')).toBe('(11) 999')
  })
})

// ─── maskCpfCnpj ─────────────────────────────────────

describe('maskCpfCnpj', () => {
  describe('CPF (up to 11 digits)', () => {
    it('returns raw digits for 1-3 chars', () => {
      expect(maskCpfCnpj('123')).toBe('123')
    })

    it('adds first dot at 4 digits', () => {
      expect(maskCpfCnpj('1234')).toBe('123.4')
    })

    it('formats 7 digits', () => {
      expect(maskCpfCnpj('1234567')).toBe('123.456.7')
    })

    it('formats 10 digits (adds dash)', () => {
      expect(maskCpfCnpj('1234567890')).toBe('123.456.789-0')
    })

    it('formats complete CPF (11 digits)', () => {
      expect(maskCpfCnpj('12345678901')).toBe('123.456.789-01')
    })
  })

  describe('CNPJ (12-14 digits)', () => {
    it('formats 12 digits', () => {
      expect(maskCpfCnpj('123456789012')).toBe('12.345.678/9012')
    })

    it('formats 13 digits', () => {
      expect(maskCpfCnpj('1234567890123')).toBe('12.345.678/9012-3')
    })

    it('formats complete CNPJ (14 digits)', () => {
      expect(maskCpfCnpj('12345678901234')).toBe('12.345.678/9012-34')
    })

    it('truncates beyond 14 digits', () => {
      expect(maskCpfCnpj('123456789012345')).toBe('12.345.678/9012-34')
    })
  })

  it('strips non-digit chars before formatting', () => {
    expect(maskCpfCnpj('123.456')).toBe('123.456')
  })
})

// ─── isPro ────────────────────────────────────────────

describe('isPro', () => {
  it('returns false for null profile', () => {
    expect(isPro(null)).toBe(false)
  })

  it('returns false for free plan', () => {
    expect(isPro({ plan: 'free', pro_until: null } as Profile)).toBe(false)
  })

  it('returns false for pro plan without pro_until', () => {
    expect(isPro({ plan: 'pro', pro_until: null } as Profile)).toBe(false)
  })

  it('returns false for pro plan with expired pro_until', () => {
    const expired = new Date(Date.now() - 86400000).toISOString()
    expect(isPro({ plan: 'pro', pro_until: expired } as Profile)).toBe(false)
  })

  it('returns true for pro plan with valid pro_until', () => {
    const future = new Date(Date.now() + 86400000).toISOString()
    expect(isPro({ plan: 'pro', pro_until: future } as Profile)).toBe(true)
  })
})

// ─── Constants ────────────────────────────────────────

describe('constants', () => {
  it('FREE_BUDGET_LIMIT is 3', () => {
    expect(FREE_BUDGET_LIMIT).toBe(3)
  })

  it('STATUS_LABELS has all 4 statuses', () => {
    expect(Object.keys(STATUS_LABELS)).toEqual(['rascunho', 'enviado', 'aprovado', 'recusado'])
    expect(STATUS_LABELS.rascunho).toBe('Rascunho')
    expect(STATUS_LABELS.aprovado).toBe('Aprovado')
  })

  it('STATUS_COLORS has matching keys', () => {
    expect(Object.keys(STATUS_COLORS)).toEqual(Object.keys(STATUS_LABELS))
  })

  it('UNIT_OPTIONS has 7 entries', () => {
    expect(UNIT_OPTIONS).toHaveLength(7)
    expect(UNIT_OPTIONS[0]).toEqual({ value: 'un', label: 'Unidade' })
  })
})
