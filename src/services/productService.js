// Product Service - Business logic layer for product operations
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  getDocs,
  orderBy
} from 'firebase/firestore'
import { db } from '../config/firebase'

class ProductService {
  constructor () {
    this.collection = 'products'
  }

  // Get products by user ID with real-time updates
  subscribeToUserProducts (userId, callback) {
    if (!userId) {
      callback([])
      return () => {}
    }

    const productsQuery = query(
      collection(db, this.collection),
      where('userId', '==', userId),
      orderBy('nama', 'asc')
    )

    return onSnapshot(productsQuery, (snapshot) => {
      try {
        const products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        callback(products)
      } catch (error) {
        console.error('Error processing products data:', error)
        callback([])
      }
    }, (error) => {
      console.error('Error fetching products:', error)
      callback([])
    })
  }

  // Get low stock products (stok <= threshold)
  getLowStockProducts (products, threshold = 5) {
    return products.filter(product => (product.stok || 0) <= threshold)
  }

  // Get out of stock products
  getOutOfStockProducts (products) {
    return products.filter(product => (product.stok || 0) <= 0)
  }

  // Add new product
  async addProduct (productData) {
    try {
      const docRef = await addDoc(collection(db, this.collection), {
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return { id: docRef.id, ...productData }
    } catch (error) {
      console.error('Error adding product:', error)
      throw new Error('Failed to add product')
    }
  }

  // Update product
  async updateProduct (productId, updateData) {
    try {
      await updateDoc(doc(db, this.collection, productId), {
        ...updateData,
        updatedAt: new Date()
      })
      return { id: productId, ...updateData }
    } catch (error) {
      console.error('Error updating product:', error)
      throw new Error('Failed to update product')
    }
  }

  // Update product stock
  async updateStock (productId, newStock) {
    try {
      await updateDoc(doc(db, this.collection, productId), {
        stok: Math.max(0, newStock),
        updatedAt: new Date()
      })
      return { id: productId, stok: Math.max(0, newStock) }
    } catch (error) {
      console.error('Error updating stock:', error)
      throw new Error('Failed to update stock')
    }
  }

  // Delete product
  async deleteProduct (productId) {
    try {
      await deleteDoc(doc(db, this.collection, productId))
      return { id: productId }
    } catch (error) {
      console.error('Error deleting product:', error)
      throw new Error('Failed to delete product')
    }
  }

  // Get product by ID
  async getProductById (productId) {
    try {
      const productDoc = await getDocs(
        query(collection(db, this.collection), where('__name__', '==', productId))
      )
      
      if (productDoc.empty) {
        return null
      }
      
      const doc = productDoc.docs[0]
      return { id: doc.id, ...doc.data() }
    } catch (error) {
      console.error('Error getting product:', error)
      throw new Error('Failed to get product')
    }
  }

  // Get products by category
  getProductsByCategory (products, category) {
    return products.filter(product => 
      product.kategori?.toLowerCase() === category?.toLowerCase()
    )
  }

  // Search products
  searchProducts (products, searchTerm) {
    if (!searchTerm) return products
    
    const term = searchTerm.toLowerCase()
    return products.filter(product => 
      product.nama?.toLowerCase().includes(term) ||
      product.kategori?.toLowerCase().includes(term) ||
      product.deskripsi?.toLowerCase().includes(term)
    )
  }

  // Get best selling products
  getBestSellingProducts (products, limit = 5) {
    return products
      .filter(product => product.stok > 0)
      .sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0))
      .slice(0, limit)
  }

  // Calculate inventory value
  calculateInventoryValue (products) {
    return products.reduce((total, product) => {
      return total + ((product.stok || 0) * (product.harga || 0))
    }, 0)
  }

  // Get inventory analytics
  getInventoryAnalytics (products) {
    const totalProducts = products.length
    const totalValue = this.calculateInventoryValue(products)
    const lowStockCount = this.getLowStockProducts(products).length
    const outOfStockCount = this.getOutOfStockProducts(products).length
    const categories = [...new Set(products.map(p => p.kategori).filter(Boolean))]

    return {
      totalProducts,
      totalValue,
      lowStockCount,
      outOfStockCount,
      categories,
      averageStock: totalProducts > 0 ? products.reduce((sum, p) => sum + (p.stok || 0), 0) / totalProducts : 0
    }
  }
}

export default new ProductService()
