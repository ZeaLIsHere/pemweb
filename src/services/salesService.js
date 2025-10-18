// Sales Service - Business logic layer for sales operations
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  doc,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'

class SalesService {
  constructor () {
    this.collection = 'sales'
    this.transactionsCollection = 'transactions'
  }

  // Subscribe to user's sales with real-time updates
  subscribeToUserSales (userId, callback) {
    if (!userId) {
      callback([])
      return () => {}
    }

    const salesQuery = query(
      collection(db, this.collection),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    )

    return onSnapshot(salesQuery, (snapshot) => {
      try {
        const sales = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        callback(sales)
      } catch (error) {
        console.error('Error processing sales data:', error)
        callback([])
      }
    }, (error) => {
      console.error('Error fetching sales:', error)
      callback([])
    })
  }

  // Record a new sale
  async recordSale (saleData) {
    try {
      const docRef = await addDoc(collection(db, this.collection), {
        ...saleData,
        timestamp: serverTimestamp(),
        createdAt: new Date()
      })
      return { id: docRef.id, ...saleData }
    } catch (error) {
      console.error('Error recording sale:', error)
      throw new Error('Failed to record sale')
    }
  }

  // Record multiple sales (bulk transaction)
  async recordBulkSales (salesData) {
    try {
      const batch = []
      const timestamp = serverTimestamp()
      
      salesData.forEach(sale => {
        const docRef = doc(collection(db, this.collection))
        batch.push({
          id: docRef.id,
          ...sale,
          timestamp,
          createdAt: new Date()
        })
      })

      // In a real implementation, you'd use writeBatch for atomic operations
      const results = await Promise.all(
        batch.map(sale => addDoc(collection(db, this.collection), sale))
      )
      
      return results.map((docRef, index) => ({
        id: docRef.id,
        ...batch[index]
      }))
    } catch (error) {
      console.error('Error recording bulk sales:', error)
      throw new Error('Failed to record bulk sales')
    }
  }

  // Get sales by date range
  getSalesByDateRange (sales, startDate, endDate) {
    return sales.filter(sale => {
      if (!sale.timestamp) return false
      const saleDate = sale.timestamp?.toDate ? sale.timestamp.toDate() : new Date(sale.timestamp)
      return saleDate >= startDate && saleDate <= endDate
    })
  }

  // Get today's sales
  getTodaySales (sales) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return this.getSalesByDateRange(sales, today, tomorrow)
  }

  // Get yesterday's sales
  getYesterdaySales (sales) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return this.getSalesByDateRange(sales, yesterday, today)
  }

  // Get this week's sales
  getThisWeekSales (sales) {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    return this.getSalesByDateRange(sales, startOfWeek, today)
  }

  // Get this month's sales
  getThisMonthSales (sales) {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    
    return this.getSalesByDateRange(sales, startOfMonth, today)
  }

  // Calculate total revenue
  calculateTotalRevenue (sales) {
    return sales.reduce((total, sale) => {
      return total + (sale.price || sale.totalAmount || 0)
    }, 0)
  }

  // Calculate average transaction value
  calculateAverageTransactionValue (sales) {
    if (sales.length === 0) return 0
    return this.calculateTotalRevenue(sales) / sales.length
  }

  // Get sales analytics
  getSalesAnalytics (sales) {
    const todaySales = this.getTodaySales(sales)
    const yesterdaySales = this.getYesterdaySales(sales)
    const thisWeekSales = this.getThisWeekSales(sales)
    const thisMonthSales = this.getThisMonthSales(sales)

    const todayRevenue = this.calculateTotalRevenue(todaySales)
    const yesterdayRevenue = this.calculateTotalRevenue(yesterdaySales)
    const thisWeekRevenue = this.calculateTotalRevenue(thisWeekSales)
    const thisMonthRevenue = this.calculateTotalRevenue(thisMonthSales)

    const growthRate = yesterdayRevenue > 0 
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100)
      : 0

    return {
      today: {
        sales: todaySales.length,
        revenue: todayRevenue,
        averageValue: this.calculateAverageTransactionValue(todaySales)
      },
      yesterday: {
        sales: yesterdaySales.length,
        revenue: yesterdayRevenue,
        averageValue: this.calculateAverageTransactionValue(yesterdaySales)
      },
      thisWeek: {
        sales: thisWeekSales.length,
        revenue: thisWeekRevenue,
        averageValue: this.calculateAverageTransactionValue(thisWeekSales)
      },
      thisMonth: {
        sales: thisMonthSales.length,
        revenue: thisMonthRevenue,
        averageValue: this.calculateAverageTransactionValue(thisMonthSales)
      },
      growthRate,
      totalRevenue: this.calculateTotalRevenue(sales),
      totalTransactions: sales.length
    }
  }

  // Get hourly sales pattern
  getHourlySalesPattern (sales) {
    const hourlyData = {}
    
    sales.forEach(sale => {
      if (sale.timestamp) {
        const saleDate = sale.timestamp?.toDate ? sale.timestamp.toDate() : new Date(sale.timestamp)
        const hour = saleDate.getHours()
        hourlyData[hour] = (hourlyData[hour] || 0) + 1
      }
    })

    return hourlyData
  }

  // Get peak hours
  getPeakHours (sales) {
    const hourlyPattern = this.getHourlySalesPattern(sales)
    const sortedHours = Object.entries(hourlyPattern)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
    
    return sortedHours.map(([hour, count]) => ({
      hour: parseInt(hour),
      count,
      timeRange: `${hour}:00-${parseInt(hour) + 1}:00`
    }))
  }

  // Get best selling products from sales data
  getBestSellingProductsFromSales (sales) {
    const productSales = {}
    
    sales.forEach(sale => {
      if (sale.productName) {
        productSales[sale.productName] = (productSales[sale.productName] || 0) + 1
      }
    })

    return Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)
      .map(([productName, count]) => ({ productName, count }))
  }

  // Get sales by payment method
  getSalesByPaymentMethod (sales) {
    const paymentMethods = {}
    
    sales.forEach(sale => {
      const method = sale.paymentMethod || 'cash'
      paymentMethods[method] = (paymentMethods[method] || 0) + 1
    })

    return paymentMethods
  }

  // Record transaction (for checkout process)
  async recordTransaction (transactionData) {
    try {
      const docRef = await addDoc(collection(db, this.transactionsCollection), {
        ...transactionData,
        timestamp: serverTimestamp(),
        createdAt: new Date()
      })
      return { id: docRef.id, ...transactionData }
    } catch (error) {
      console.error('Error recording transaction:', error)
      throw new Error('Failed to record transaction')
    }
  }
}

export default new SalesService()
