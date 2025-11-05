import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('btn', 'btn-primary')
    expect(result).toBe('btn btn-primary')
  })

  it('should handle conditional classes', () => {
    const result = cn('btn', { 'btn-active': true, 'btn-disabled': false })
    expect(result).toBe('btn btn-active')
  })

  it('should merge tailwind classes and resolve conflicts', () => {
    const result = cn('px-2 py-1', 'px-4')
    // twMerge should keep only the last px value
    expect(result).toBe('py-1 px-4')
  })

  it('should handle undefined and null values', () => {
    const result = cn('btn', undefined, null, 'btn-primary')
    expect(result).toBe('btn btn-primary')
  })

  it('should handle arrays of classes', () => {
    const result = cn(['btn', 'btn-primary'], 'btn-lg')
    expect(result).toBe('btn btn-primary btn-lg')
  })
})
