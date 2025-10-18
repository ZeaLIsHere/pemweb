import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCache, useProductCache, useSalesCache } from '../useCache'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('useCache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('get and set', () => {
    it('should store and retrieve data', () => {
      const { result } = renderHook(() => useCache())

      act(() => {
        result.current.set('test-key', { data: 'test-value' })
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'dagangcerdas_cache_test-key',
        expect.stringContaining('"data":{"data":"test-value"}')
      )

      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          data: { data: 'test-value' },
          expiry: Date.now() + 300000 // 5 minutes from now
        })
      )

      const data = result.current.get('test-key')
      expect(data).toEqual({ data: 'test-value' })
    })

    it('should return null for expired data', () => {
      const { result } = renderHook(() => useCache())

      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          data: { data: 'test-value' },
          expiry: Date.now() - 1000 // 1 second ago
        })
      )

      const data = result.current.get('test-key')
      expect(data).toBeNull()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('dagangcerdas_cache_test-key')
    })

    it('should return null for non-existent key', () => {
      const { result } = renderHook(() => useCache())

      const data = result.current.get('non-existent')
      expect(data).toBeNull()
    })
  })

  describe('remove', () => {
    it('should remove data from cache', () => {
      const { result } = renderHook(() => useCache())

      act(() => {
        result.current.remove('test-key')
      })

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('dagangcerdas_cache_test-key')
    })
  })

  describe('clear', () => {
    it('should clear all cache entries', () => {
      const { result } = renderHook(() => useCache())

      // Mock Object.keys to return cache keys
      const originalKeys = Object.keys
      Object.keys = vi.fn().mockReturnValue(['dagangcerdas_cache_key1', 'dagangcerdas_cache_key2', 'other_key'])

      act(() => {
        result.current.clear()
      })

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('dagangcerdas_cache_key1')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('dagangcerdas_cache_key2')
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('other_key')

      // Restore original Object.keys
      Object.keys = originalKeys
    })
  })

  describe('getOrSet', () => {
    it('should return cached data if available', async () => {
      const { result } = renderHook(() => useCache())

      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          data: { data: 'cached-value' },
          expiry: Date.now() + 300000
        })
      )

      const fetchFn = vi.fn().mockResolvedValue({ data: 'fresh-value' })

      const data = await result.current.getOrSet('test-key', fetchFn)

      expect(data).toEqual({ data: 'cached-value' })
      expect(fetchFn).not.toHaveBeenCalled()
    })

    it('should fetch and cache data if not available', async () => {
      const { result } = renderHook(() => useCache())

      const fetchFn = vi.fn().mockResolvedValue({ data: 'fresh-value' })

      const data = await result.current.getOrSet('test-key', fetchFn)

      expect(data).toEqual({ data: 'fresh-value' })
      expect(fetchFn).toHaveBeenCalledOnce()
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })
})

describe('useProductCache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should provide product-specific cache methods', () => {
    const { result } = renderHook(() => useProductCache())

    expect(result.current.getProducts).toBeDefined()
    expect(result.current.setProducts).toBeDefined()
    expect(result.current.getProduct).toBeDefined()
    expect(result.current.setProduct).toBeDefined()
    expect(result.current.clearProducts).toBeDefined()
  })

  it('should cache products with correct key format', () => {
    const { result } = renderHook(() => useProductCache())

    act(() => {
      result.current.setProducts('user123', [{ id: '1', nama: 'Product 1' }])
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'dagangcerdas_cache_products_user123',
      expect.any(String)
    )
  })
})

describe('useSalesCache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should provide sales-specific cache methods', () => {
    const { result } = renderHook(() => useSalesCache())

    expect(result.current.getSales).toBeDefined()
    expect(result.current.setSales).toBeDefined()
    expect(result.current.getTodaySales).toBeDefined()
    expect(result.current.setTodaySales).toBeDefined()
    expect(result.current.clearSales).toBeDefined()
  })

  it('should cache today sales with shorter expiry', () => {
    const { result } = renderHook(() => useSalesCache())

    act(() => {
      result.current.setTodaySales('user123', [{ id: '1', price: 1000 }])
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'dagangcerdas_cache_today_sales_user123',
      expect.any(String)
    )
  })
})
