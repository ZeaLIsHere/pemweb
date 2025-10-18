import { describe, it, expect, vi, beforeEach } from 'vitest'
import productService from '../productService'

// Mock Firebase
vi.mock('../../config/firebase', () => ({
  db: {}
}))

describe('ProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getLowStockProducts', () => {
    it('should filter products with stock <= threshold', () => {
      const products = [
        { id: '1', nama: 'Product 1', stok: 3 },
        { id: '2', nama: 'Product 2', stok: 10 },
        { id: '3', nama: 'Product 3', stok: 0 },
        { id: '4', nama: 'Product 4', stok: 5 }
      ]

      const lowStockProducts = productService.getLowStockProducts(products, 5)

      expect(lowStockProducts).toHaveLength(3)
      expect(lowStockProducts.map(p => p.id)).toEqual(['1', '3', '4'])
    })

    it('should use default threshold of 5', () => {
      const products = [
        { id: '1', nama: 'Product 1', stok: 3 },
        { id: '2', nama: 'Product 2', stok: 10 }
      ]

      const lowStockProducts = productService.getLowStockProducts(products)

      expect(lowStockProducts).toHaveLength(1)
      expect(lowStockProducts[0].id).toBe('1')
    })

    it('should handle products with undefined stock', () => {
      const products = [
        { id: '1', nama: 'Product 1' },
        { id: '2', nama: 'Product 2', stok: 10 }
      ]

      const lowStockProducts = productService.getLowStockProducts(products, 5)

      expect(lowStockProducts).toHaveLength(1)
      expect(lowStockProducts[0].id).toBe('1')
    })
  })

  describe('getOutOfStockProducts', () => {
    it('should filter products with stock <= 0', () => {
      const products = [
        { id: '1', nama: 'Product 1', stok: 0 },
        { id: '2', nama: 'Product 2', stok: 1 },
        { id: '3', nama: 'Product 3', stok: -1 }
      ]

      const outOfStockProducts = productService.getOutOfStockProducts(products)

      expect(outOfStockProducts).toHaveLength(2)
      expect(outOfStockProducts.map(p => p.id)).toEqual(['1', '3'])
    })
  })

  describe('searchProducts', () => {
    it('should search products by name', () => {
      const products = [
        { id: '1', nama: 'Apple iPhone', kategori: 'Electronics' },
        { id: '2', nama: 'Samsung Galaxy', kategori: 'Electronics' },
        { id: '3', nama: 'Apple MacBook', kategori: 'Computers' }
      ]

      const results = productService.searchProducts(products, 'apple')

      expect(results).toHaveLength(2)
      expect(results.map(p => p.id)).toEqual(['1', '3'])
    })

    it('should search products by category', () => {
      const products = [
        { id: '1', nama: 'Apple iPhone', kategori: 'Electronics' },
        { id: '2', nama: 'Samsung Galaxy', kategori: 'Electronics' },
        { id: '3', nama: 'Apple MacBook', kategori: 'Computers' }
      ]

      const results = productService.searchProducts(products, 'electronics')

      expect(results).toHaveLength(2)
      expect(results.map(p => p.id)).toEqual(['1', '2'])
    })

    it('should search products by description', () => {
      const products = [
        { id: '1', nama: 'Product 1', deskripsi: 'High quality item' },
        { id: '2', nama: 'Product 2', deskripsi: 'Low quality item' }
      ]

      const results = productService.searchProducts(products, 'quality')

      expect(results).toHaveLength(2)
    })

    it('should return all products when search term is empty', () => {
      const products = [
        { id: '1', nama: 'Product 1' },
        { id: '2', nama: 'Product 2' }
      ]

      const results = productService.searchProducts(products, '')

      expect(results).toHaveLength(2)
    })
  })

  describe('getProductsByCategory', () => {
    it('should filter products by category', () => {
      const products = [
        { id: '1', nama: 'Product 1', kategori: 'Electronics' },
        { id: '2', nama: 'Product 2', kategori: 'Clothing' },
        { id: '3', nama: 'Product 3', kategori: 'Electronics' }
      ]

      const electronicsProducts = productService.getProductsByCategory(products, 'Electronics')

      expect(electronicsProducts).toHaveLength(2)
      expect(electronicsProducts.map(p => p.id)).toEqual(['1', '3'])
    })

    it('should be case insensitive', () => {
      const products = [
        { id: '1', nama: 'Product 1', kategori: 'Electronics' },
        { id: '2', nama: 'Product 2', kategori: 'electronics' }
      ]

      const results = productService.getProductsByCategory(products, 'ELECTRONICS')

      expect(results).toHaveLength(2)
    })
  })

  describe('getBestSellingProducts', () => {
    it('should return products sorted by totalSold', () => {
      const products = [
        { id: '1', nama: 'Product 1', totalSold: 10, stok: 5 },
        { id: '2', nama: 'Product 2', totalSold: 50, stok: 3 },
        { id: '3', nama: 'Product 3', totalSold: 30, stok: 0 },
        { id: '4', nama: 'Product 4', totalSold: 20, stok: 2 }
      ]

      const bestSelling = productService.getBestSellingProducts(products, 3)

      expect(bestSelling).toHaveLength(3)
      expect(bestSelling[0].id).toBe('2')
      expect(bestSelling[1].id).toBe('4')
      expect(bestSelling[2].id).toBe('1')
    })

    it('should exclude out of stock products', () => {
      const products = [
        { id: '1', nama: 'Product 1', totalSold: 10, stok: 5 },
        { id: '2', nama: 'Product 2', totalSold: 50, stok: 0 }
      ]

      const bestSelling = productService.getBestSellingProducts(products)

      expect(bestSelling).toHaveLength(1)
      expect(bestSelling[0].id).toBe('1')
    })
  })

  describe('calculateInventoryValue', () => {
    it('should calculate total inventory value', () => {
      const products = [
        { id: '1', nama: 'Product 1', stok: 10, harga: 1000 },
        { id: '2', nama: 'Product 2', stok: 5, harga: 2000 },
        { id: '3', nama: 'Product 3', stok: 0, harga: 500 }
      ]

      const totalValue = productService.calculateInventoryValue(products)

      expect(totalValue).toBe(20000) // (10 * 1000) + (5 * 2000) + (0 * 500)
    })

    it('should handle products with undefined stock or price', () => {
      const products = [
        { id: '1', nama: 'Product 1', stok: 10, harga: 1000 },
        { id: '2', nama: 'Product 2', stok: 5 },
        { id: '3', nama: 'Product 3', harga: 500 }
      ]

      const totalValue = productService.calculateInventoryValue(products)

      expect(totalValue).toBe(10000) // (10 * 1000) + (5 * 0) + (0 * 500)
    })
  })

  describe('getInventoryAnalytics', () => {
    it('should return comprehensive inventory analytics', () => {
      const products = [
        { id: '1', nama: 'Product 1', stok: 10, harga: 1000, kategori: 'Electronics' },
        { id: '2', nama: 'Product 2', stok: 3, harga: 2000, kategori: 'Electronics' },
        { id: '3', nama: 'Product 3', stok: 0, harga: 500, kategori: 'Clothing' },
        { id: '4', nama: 'Product 4', stok: 7, harga: 1500, kategori: 'Clothing' }
      ]

      const analytics = productService.getInventoryAnalytics(products)

      expect(analytics.totalProducts).toBe(4)
      expect(analytics.totalValue).toBe(26500) // (10*1000) + (3*2000) + (0*500) + (7*1500) = 10000 + 6000 + 0 + 10500
      expect(analytics.lowStockCount).toBe(2) // Products with stock <= 5
      expect(analytics.outOfStockCount).toBe(1) // Products with stock <= 0
      expect(analytics.categories).toEqual(['Electronics', 'Clothing'])
      expect(analytics.averageStock).toBe(5) // (10 + 3 + 0 + 7) / 4
    })
  })
})
