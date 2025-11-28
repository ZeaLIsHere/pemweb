// Store Statistics Service - Handles real-time store statistics updates
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  updateDoc,
  doc,
  increment,
  getDocs
} from 'firebase/firestore'
import { db } from '../config/firebase'

class StoreStatsService {
  constructor () {
    this.salesCollection = 'sales'
    this.storesCollection = 'stores'
  }

  // Update store statistics when a new sale is made
  async updateStoreStats (userId, saleData) {
    try {
      // Find the store for this user
      const storesQuery = query(
        collection(db, this.storesCollection),
        where('userId', '==', userId)
      )
      
      const storesSnapshot = await getDocs(storesQuery)
      if (storesSnapshot.empty) {
        console.log('No store found for user:', userId)
        return
      }

      const storeDoc = storesSnapshot.docs[0]
      const storeRef = doc(db, this.storesCollection, storeDoc.id)
      
      // Update store statistics
      await updateDoc(storeRef, {
        totalSales: increment(1),
        totalRevenue: increment(saleData.totalAmount || saleData.price || 0),
        totalProfit: increment(saleData.totalProfit || 0),
        lastSaleDate: new Date(),
        updatedAt: new Date()
      })

      console.log('Store statistics updated successfully')
    } catch (error) {
      console.error('Error updating store statistics:', error)
      throw error
    }
  }

  // Calculate and update store statistics from all sales
  async recalculateStoreStats (storeId) {
    try {
      const salesQuery = query(
        collection(db, this.salesCollection),
        where('userId', '==', storeId) // Assuming userId is the storeId
      )

      const unsubscribe = onSnapshot(salesQuery, async (snapshot) => {
        const sales = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        const totalSales = sales.length
        const totalRevenue = sales.reduce((sum, sale) => 
          sum + (sale.price || sale.totalAmount || 0), 0
        )

        // Update store with calculated statistics
        const storeRef = doc(db, this.storesCollection, storeId)
        await updateDoc(storeRef, {
          totalSales,
          totalRevenue,
          updatedAt: new Date()
        })

        console.log('Store statistics recalculated:', { totalSales, totalRevenue })
      })

      return unsubscribe
    } catch (error) {
      console.error('Error recalculating store statistics:', error)
      throw error
    }
  }

  // Get real-time store statistics
  getStoreStats (userId, callback) {
    if (!userId) {
      callback({ totalSales: 0, totalRevenue: 0, totalProducts: 0 })
      return () => {}
    }

    const salesQuery = query(
      collection(db, this.salesCollection),
      where('userId', '==', userId)
    )

    return onSnapshot(salesQuery, (snapshot) => {
      try {
        const sales = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        const totalSales = sales.length
        const totalRevenue = sales.reduce((sum, sale) => 
          sum + (sale.price || sale.totalAmount || 0), 0
        )
        const totalProfit = sales.reduce((sum, sale) => {
          if (typeof sale.totalProfit === 'number') return sum + sale.totalProfit
          if (Array.isArray(sale.items)) {
            const p = sale.items.reduce((s, i) => s + ((i.harga - (i.harga_modal || 0)) * (i.quantity || 1)), 0)
            return sum + p
          }
          return sum
        }, 0)

        // Get today's sales
        const today = new Date()
        const todaySales = sales.filter(sale => {
          if (!sale.timestamp) return false
          const saleDate = sale.timestamp?.toDate ? sale.timestamp.toDate() : new Date(sale.timestamp)
          return saleDate.toDateString() === today.toDateString()
        })

        const todayRevenue = todaySales.reduce((sum, sale) => 
          sum + (sale.price || sale.totalAmount || 0), 0
        )
        const todayProfit = todaySales.reduce((sum, sale) => {
          if (typeof sale.totalProfit === 'number') return sum + sale.totalProfit
          if (Array.isArray(sale.items)) {
            const p = sale.items.reduce((s, i) => s + ((i.harga - (i.harga_modal || 0)) * (i.quantity || 1)), 0)
            return sum + p
          }
          return sum
        }, 0)

        callback({
          totalSales,
          totalRevenue,
          totalProfit,
          todaySales: todaySales.length,
          todayRevenue,
          todayProfit,
          lastUpdated: new Date()
        })
      } catch (error) {
        console.error('Error processing store statistics:', error)
        callback({ totalSales: 0, totalRevenue: 0, totalProfit: 0, todaySales: 0, todayRevenue: 0, todayProfit: 0 })
      }
    }, (error) => {
      console.error('Error fetching store statistics:', error)
      callback({ totalSales: 0, totalRevenue: 0, totalProfit: 0, todaySales: 0, todayRevenue: 0, todayProfit: 0 })
    })
  }

  // Update store statistics when products are added/updated
  async updateProductStats (storeId, productCount) {
    try {
      const storeRef = doc(db, this.storesCollection, storeId)
      
      await updateDoc(storeRef, {
        totalProducts: productCount,
        updatedAt: new Date()
      })

      console.log('Product statistics updated successfully')
    } catch (error) {
      console.error('Error updating product statistics:', error)
      throw error
    }
  }
}

export default new StoreStatsService()
