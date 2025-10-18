// Store Service - Business logic layer for store operations
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc,
  getDocs,
  orderBy
} from 'firebase/firestore'
import { db } from '../config/firebase'

class StoreService {
  constructor () {
    this.collection = 'stores'
  }

  // Subscribe to user's stores with real-time updates
  subscribeToUserStores (userId, callback) {
    if (!userId) {
      callback([])
      return () => {}
    }

    const storesQuery = query(
      collection(db, this.collection),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    return onSnapshot(storesQuery, (snapshot) => {
      try {
        const stores = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        callback(stores)
      } catch (error) {
        console.error('Error processing stores data:', error)
        callback([])
      }
    }, (error) => {
      console.error('Error fetching stores:', error)
      callback([])
    })
  }

  // Create new store
  async createStore (storeData) {
    try {
      const docRef = await addDoc(collection(db, this.collection), {
        ...storeData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return { id: docRef.id, ...storeData }
    } catch (error) {
      console.error('Error creating store:', error)
      throw new Error('Failed to create store')
    }
  }

  // Update store
  async updateStore (storeId, updateData) {
    try {
      await updateDoc(doc(db, this.collection, storeId), {
        ...updateData,
        updatedAt: new Date()
      })
      return { id: storeId, ...updateData }
    } catch (error) {
      console.error('Error updating store:', error)
      throw new Error('Failed to update store')
    }
  }

  // Get store by ID
  async getStoreById (storeId) {
    try {
      const storeDoc = await getDocs(
        query(collection(db, this.collection), where('__name__', '==', storeId))
      )
      
      if (storeDoc.empty) {
        return null
      }
      
      const doc = storeDoc.docs[0]
      return { id: doc.id, ...doc.data() }
    } catch (error) {
      console.error('Error getting store:', error)
      throw new Error('Failed to get store')
    }
  }

  // Validate store data
  validateStoreData (storeData) {
    const errors = []
    
    if (!storeData.nama || storeData.nama.trim().length === 0) {
      errors.push('Store name is required')
    }
    
    if (!storeData.alamat || storeData.alamat.trim().length === 0) {
      errors.push('Store address is required')
    }
    
    if (!storeData.telepon || storeData.telepon.trim().length === 0) {
      errors.push('Store phone number is required')
    }
    
    if (storeData.nama && storeData.nama.length > 100) {
      errors.push('Store name must be less than 100 characters')
    }
    
    if (storeData.alamat && storeData.alamat.length > 200) {
      errors.push('Store address must be less than 200 characters')
    }
    
    if (storeData.telepon && !/^[\d\s\-+()]+$/.test(storeData.telepon)) {
      errors.push('Invalid phone number format')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Get store statistics
  async getStoreStatistics (storeId, products = [], sales = []) {
    const storeProducts = products.filter(product => product.storeId === storeId)
    const storeSales = sales.filter(sale => sale.storeId === storeId)
    
    const totalProducts = storeProducts.length
    const totalValue = storeProducts.reduce((sum, product) => 
      sum + ((product.stok || 0) * (product.harga || 0)), 0
    )
    const lowStockProducts = storeProducts.filter(product => (product.stok || 0) <= 5).length
    const outOfStockProducts = storeProducts.filter(product => (product.stok || 0) <= 0).length
    
    const todaySales = storeSales.filter(sale => {
      if (!sale.timestamp) return false
      const saleDate = sale.timestamp?.toDate ? sale.timestamp.toDate() : new Date(sale.timestamp)
      const today = new Date()
      return saleDate.toDateString() === today.toDateString()
    })
    
    const todayRevenue = todaySales.reduce((sum, sale) => sum + (sale.price || sale.totalAmount || 0), 0)

    return {
      totalProducts,
      totalValue,
      lowStockProducts,
      outOfStockProducts,
      todaySales: todaySales.length,
      todayRevenue,
      totalSales: storeSales.length,
      totalRevenue: storeSales.reduce((sum, sale) => sum + (sale.price || sale.totalAmount || 0), 0)
    }
  }

  // Check if store setup is complete
  isStoreSetupComplete (store) {
    if (!store) return false
    
    const requiredFields = ['nama', 'alamat', 'telepon']
    return requiredFields.every(field => store[field] && store[field].trim().length > 0)
  }

  // Get store completion percentage
  getStoreCompletionPercentage (store) {
    if (!store) return 0
    
    const fields = ['nama', 'alamat', 'telepon', 'deskripsi', 'jamBuka', 'jamTutup']
    const completedFields = fields.filter(field => store[field] && store[field].trim().length > 0)
    
    return Math.round((completedFields.length / fields.length) * 100)
  }

  // Format store data for display
  formatStoreForDisplay (store) {
    if (!store) return null
    
    return {
      ...store,
      displayName: store.nama || 'Unnamed Store',
      displayAddress: store.alamat || 'No address provided',
      displayPhone: store.telepon || 'No phone provided',
      isComplete: this.isStoreSetupComplete(store),
      completionPercentage: this.getStoreCompletionPercentage(store)
    }
  }

  // Get store operating hours
  getOperatingHours (store) {
    if (!store || !store.jamBuka || !store.jamTutup) {
      return { isOpen: false, message: 'Operating hours not set' }
    }
    
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const [openHour, openMinute] = store.jamBuka.split(':').map(Number)
    const [closeHour, closeMinute] = store.jamTutup.split(':').map(Number)
    
    const openTime = openHour * 60 + openMinute
    const closeTime = closeHour * 60 + closeMinute
    
    const isOpen = currentTime >= openTime && currentTime <= closeTime
    
    return {
      isOpen,
      openTime: store.jamBuka,
      closeTime: store.jamTutup,
      message: isOpen ? 'Store is open' : 'Store is closed'
    }
  }
}

export default new StoreService()
