import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext()

export function useToast () {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider ({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random()
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast
    }
    
    setToasts(prev => [...prev, newToast])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  // Convenience methods for different toast types
  const showSuccess = useCallback((message, options = {}) => {
    return addToast({
      type: 'success',
      title: 'Berhasil!',
      message,
      duration: 4000,
      ...options
    })
  }, [addToast])

  const showError = useCallback((message, options = {}) => {
    return addToast({
      type: 'error',
      title: 'Terjadi Kesalahan',
      message,
      duration: 6000,
      ...options
    })
  }, [addToast])

  const showWarning = useCallback((message, options = {}) => {
    return addToast({
      type: 'warning',
      title: 'Perhatian',
      message,
      duration: 5000,
      ...options
    })
  }, [addToast])

  const showInfo = useCallback((message, options = {}) => {
    return addToast({
      type: 'info',
      title: 'Informasi',
      message,
      duration: 4000,
      ...options
    })
  }, [addToast])

  // Business-specific toast methods
  const showProductAdded = useCallback((productName) => {
    return showSuccess(`${productName} berhasil ditambahkan!`, {
      action: {
        label: 'Lihat Produk',
        onClick: () => {
          // Navigate to products or specific product
          // TODO: Implement navigation to product
        }
      }
    })
  }, [showSuccess])

  const showProductUpdated = useCallback((productName) => {
    return showSuccess(`${productName} berhasil diperbarui!`)
  }, [showSuccess])

  const showProductDeleted = useCallback((productName) => {
    return showInfo(`${productName} telah dihapus`)
  }, [showInfo])

  const showStockLow = useCallback((productName, currentStock) => {
    return showWarning(`${productName} stok rendah (${currentStock} tersisa)`, {
      action: {
        label: 'Update Stok',
        onClick: () => {
          // Navigate to stock update
          // TODO: Implement navigation to stock update
        }
      }
    })
  }, [showWarning])

  const showStockOut = useCallback((productName) => {
    return showError(`${productName} kehabisan stok!`, {
      action: {
        label: 'Restock Sekarang',
        onClick: () => {
          // Navigate to stock update
          // TODO: Implement navigation to stock update
        }
      }
    })
  }, [showError])

  const showSaleRecorded = useCallback((amount, productName) => {
    return showSuccess(`Penjualan berhasil! Rp ${amount.toLocaleString()}`, {
      title: 'Penjualan Tercatat',
      message: `${productName} terjual dengan sukses`
    })
  }, [showSuccess])

  const showPaymentSuccess = useCallback((amount) => {
    return showSuccess(`Pembayaran berhasil! Rp ${amount.toLocaleString()}`, {
      title: 'Pembayaran Diterima'
    })
  }, [showSuccess])

  const showPaymentFailed = useCallback((reason = 'Gagal memproses pembayaran') => {
    return showError(reason, {
      title: 'Pembayaran Gagal',
      action: {
        label: 'Coba Lagi',
        onClick: () => {
          // Retry payment
          // TODO: Implement payment retry
        }
      }
    })
  }, [showError])

  const showStoreCreated = useCallback((storeName) => {
    return showSuccess(`Toko "${storeName}" berhasil dibuat!`, {
      title: 'Toko Baru',
      action: {
        label: 'Kelola Toko',
        onClick: () => {
          // Navigate to store management
          // TODO: Implement navigation to store management
        }
      }
    })
  }, [showSuccess])

  const showCollectiveOrderJoined = useCallback((productName, discount) => {
    return showSuccess(`Bergabung dengan pesanan kolektif! Hemat ${discount}%`, {
      title: 'Pesanan Kolektif',
      message: `Anda bergabung dengan pesanan ${productName}`
    })
  }, [showSuccess])

  const showNetworkError = useCallback(() => {
    return showError('Koneksi internet bermasalah. Periksa koneksi Anda.', {
      title: 'Koneksi Bermasalah',
      duration: 8000,
      action: {
        label: 'Refresh',
        onClick: () => {
          window.location.reload()
        }
      }
    })
  }, [showError])

  const showOfflineMode = useCallback(() => {
    return showWarning('Mode offline aktif. Data akan disinkronkan saat online.', {
      title: 'Mode Offline',
      duration: 6000
    })
  }, [showWarning])

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    // Business-specific methods
    showProductAdded,
    showProductUpdated,
    showProductDeleted,
    showStockLow,
    showStockOut,
    showSaleRecorded,
    showPaymentSuccess,
    showPaymentFailed,
    showStoreCreated,
    showCollectiveOrderJoined,
    showNetworkError,
    showOfflineMode
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}
