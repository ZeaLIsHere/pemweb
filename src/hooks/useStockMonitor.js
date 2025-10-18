import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'

export function useStockMonitor (threshold = 5) {
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [monitoringEnabled, setMonitoringEnabled] = useState(() => {
    // Load from localStorage, default to true
    const saved = localStorage.getItem('stockMonitoringEnabled')
    return saved !== null ? JSON.parse(saved) : true
  })
  const { currentUser } = useAuth()
  
  const userId = currentUser?.uid

  // Save monitoring preference to localStorage
  useEffect(() => {
    localStorage.setItem('stockMonitoringEnabled', JSON.stringify(monitoringEnabled))
  }, [monitoringEnabled])

  useEffect(() => {
    if (!userId || !monitoringEnabled) return

    const q = query(
      collection(db, 'products'),
      where('userId', '==', userId),
      where('stok', '<=', threshold),
      where('stok', '>', 0)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products = []
      snapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() })
      })
      
      setLowStockProducts(products)
    })

    return () => unsubscribe()
  }, [userId, threshold, monitoringEnabled])

  const toggleMonitoring = () => {
    setMonitoringEnabled(!monitoringEnabled)
  }

  // Calculate statistics
  const stats = {
    totalProducts: lowStockProducts.length,
    outOfStock: lowStockProducts.filter(p => p.stok === 0).length,
    criticalStock: lowStockProducts.filter(p => p.stok > 0 && p.stok <= 2).length,
    lowStock: lowStockProducts.filter(p => p.stok > 2 && p.stok <= 5).length,
    totalValue: lowStockProducts.reduce((sum, p) => sum + (p.harga * p.stok), 0)
  }

  return {
    lowStockProducts,
    monitoringEnabled,
    toggleMonitoring,
    stats
  }
}
