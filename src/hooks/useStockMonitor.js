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

  // Helper status stok: habis, menipis, normal, berlebih
  const getStockStatus = (product) => {
    const stok = Number(product.stok) || 0
    const batchSize = Number(product.batchSize) || 1

    // Produk bundling tidak ikut klasifikasi stok khusus
    if (product.isBundle) return 'stok_normal'

    if (stok === 0) return 'stok_habis'
    if (stok >= 5 * batchSize) return 'stok_berlebih'
    if (stok <= 0.5 * batchSize) return 'stok_menipis'
    return 'stok_normal'
  }

  useEffect(() => {
    if (!userId || !monitoringEnabled) return

    const q = query(
      collection(db, 'products'),
      where('userId', '==', userId)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products = []
      snapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() })
      })

      const lowStock = products.filter(p => {
        const status = getStockStatus(p)
        return status === 'stok_habis' || status === 'stok_menipis'
      })

      setLowStockProducts(lowStock)
    })

    return () => unsubscribe()
  }, [userId, monitoringEnabled])

  const toggleMonitoring = () => {
    setMonitoringEnabled(!monitoringEnabled)
  }

  // Calculate statistics
  const stats = {
    totalProducts: lowStockProducts.length,
    outOfStock: lowStockProducts.filter(p => getStockStatus(p) === 'stok_habis').length,
    criticalStock: lowStockProducts.filter(p => getStockStatus(p) === 'stok_menipis').length,
    lowStock: 0,
    totalValue: lowStockProducts.reduce((sum, p) => sum + (p.harga * p.stok), 0)
  }

  return {
    lowStockProducts,
    monitoringEnabled,
    toggleMonitoring,
    stats
  }
}
