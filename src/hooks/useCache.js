// Custom hook for local caching with expiration
import { useState, useEffect, useCallback } from 'react'

const CACHE_PREFIX = 'dagangcerdas_cache_'
const DEFAULT_EXPIRY = 5 * 60 * 1000 // 5 minutes

export function useCache () {
  const [cache, setCache] = useState(new Map())

  // Get cached data
  const get = useCallback((key) => {
    try {
      const cachedItem = localStorage.getItem(`${CACHE_PREFIX}${key}`)
      if (!cachedItem) return null

      const { data, expiry } = JSON.parse(cachedItem)
      
      if (Date.now() > expiry) {
        localStorage.removeItem(`${CACHE_PREFIX}${key}`)
        return null
      }

      return data
    } catch (error) {
      console.error('Error reading from cache:', error)
      return null
    }
  }, [])

  // Set cached data
  const set = useCallback((key, data, expiryMs = DEFAULT_EXPIRY) => {
    try {
      const expiry = Date.now() + expiryMs
      const cacheItem = { data, expiry }
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheItem))
      
      setCache(prev => new Map(prev.set(key, { data, expiry })))
    } catch (error) {
      console.error('Error writing to cache:', error)
    }
  }, [])

  // Remove cached data
  const remove = useCallback((key) => {
    try {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`)
      setCache(prev => {
        const newCache = new Map(prev)
        newCache.delete(key)
        return newCache
      })
    } catch (error) {
      console.error('Error removing from cache:', error)
    }
  }, [])

  // Clear all cache
  const clear = useCallback(() => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX))
      keys.forEach(key => localStorage.removeItem(key))
      setCache(new Map())
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  }, [])

  // Get or set cached data with fallback
  const getOrSet = useCallback(async (key, fetchFn, expiryMs = DEFAULT_EXPIRY) => {
    const cached = get(key)
    if (cached !== null) {
      return cached
    }

    try {
      const data = await fetchFn()
      set(key, data, expiryMs)
      return data
    } catch (error) {
      console.error('Error fetching data for cache:', error)
      throw error
    }
  }, [get, set])

  // Clean expired cache entries
  const cleanExpired = useCallback(() => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX))
      keys.forEach(key => {
        const cachedItem = localStorage.getItem(key)
        if (cachedItem) {
          const { expiry } = JSON.parse(cachedItem)
          if (Date.now() > expiry) {
            localStorage.removeItem(key)
          }
        }
      })
    } catch (error) {
      console.error('Error cleaning expired cache:', error)
    }
  }, [])

  // Initialize cache from localStorage
  useEffect(() => {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX))
      const initialCache = new Map()
      
      keys.forEach(key => {
        const cachedItem = localStorage.getItem(key)
        if (cachedItem) {
          const { data, expiry } = JSON.parse(cachedItem)
          if (Date.now() <= expiry) {
            const cacheKey = key.replace(CACHE_PREFIX, '')
            initialCache.set(cacheKey, { data, expiry })
          } else {
            localStorage.removeItem(key)
          }
        }
      })
      
      setCache(initialCache)
    } catch (error) {
      console.error('Error initializing cache:', error)
    }
  }, [])

  // Clean expired entries on mount
  useEffect(() => {
    cleanExpired()
  }, [cleanExpired])

  return {
    get,
    set,
    remove,
    clear,
    getOrSet,
    cleanExpired,
    has: (key) => cache.has(key),
    size: cache.size
  }
}

// Specialized hooks for different data types
export function useProductCache () {
  const cache = useCache()
  
  const getProducts = useCallback((userId) => {
    return cache.get(`products_${userId}`)
  }, [cache])

  const setProducts = useCallback((userId, products) => {
    cache.set(`products_${userId}`, products, 2 * 60 * 1000) // 2 minutes
  }, [cache])

  const getProduct = useCallback((productId) => {
    return cache.get(`product_${productId}`)
  }, [cache])

  const setProduct = useCallback((productId, product) => {
    cache.set(`product_${productId}`, product, 5 * 60 * 1000) // 5 minutes
  }, [cache])

  return {
    getProducts,
    setProducts,
    getProduct,
    setProduct,
    clearProducts: () => cache.clear()
  }
}

export function useSalesCache () {
  const cache = useCache()
  
  const getSales = useCallback((userId) => {
    return cache.get(`sales_${userId}`)
  }, [cache])

  const setSales = useCallback((userId, sales) => {
    cache.set(`sales_${userId}`, sales, 1 * 60 * 1000) // 1 minute
  }, [cache])

  const getTodaySales = useCallback((userId) => {
    return cache.get(`today_sales_${userId}`)
  }, [cache])

  const setTodaySales = useCallback((userId, sales) => {
    cache.set(`today_sales_${userId}`, sales, 30 * 1000) // 30 seconds
  }, [cache])

  return {
    getSales,
    setSales,
    getTodaySales,
    setTodaySales,
    clearSales: () => cache.clear()
  }
}

export function useStoreCache () {
  const cache = useCache()
  
  const getStores = useCallback((userId) => {
    return cache.get(`stores_${userId}`)
  }, [cache])

  const setStores = useCallback((userId, stores) => {
    cache.set(`stores_${userId}`, stores, 10 * 60 * 1000) // 10 minutes
  }, [cache])

  const getCurrentStore = useCallback((userId) => {
    return cache.get(`current_store_${userId}`)
  }, [cache])

  const setCurrentStore = useCallback((userId, store) => {
    cache.set(`current_store_${userId}`, store, 10 * 60 * 1000) // 10 minutes
  }, [cache])

  return {
    getStores,
    setStores,
    getCurrentStore,
    setCurrentStore,
    clearStores: () => cache.clear()
  }
}
