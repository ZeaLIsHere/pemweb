import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Store, Wifi, WifiOff, Clock } from 'lucide-react'

export default function LoadingStoreIndicator ({ isLoading }) {
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('Memuat toko...')

  useEffect(() => {
    if (!isLoading) return

    const messages = [
      'Memuat toko...',
      'Menghubungkan ke Firestore...',
      'Memeriksa permissions...',
      'Mencoba mode fallback...',
      'Menggunakan data lokal...'
    ]

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      if (currentStep < messages.length) {
        setMessage(messages[currentStep])
        setProgress((currentStep / messages.length) * 100)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isLoading])

  if (!isLoading) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-secondary mb-2">DagangCerdas</h2>
          <p className="text-gray-600">Menyiapkan toko Anda</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{message}</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Status Icons */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Store className="w-5 h-5 text-primary" />
            </motion.div>
            <span className="text-sm text-gray-600">Toko</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {progress < 50 ? (
                <Wifi className="w-5 h-5 text-blue-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-amber-500" />
              )}
            </motion.div>
            <span className="text-sm text-gray-600">
              {progress < 50 ? 'Online' : 'Offline'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600">5s</span>
          </div>
        </div>

        {/* Info Messages */}
        <div className="space-y-3">
          {progress < 30 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-3"
            >
              <p className="text-xs text-blue-700">
                🔄 Menghubungkan ke database Firestore...
              </p>
            </motion.div>
          )}
          
          {progress >= 30 && progress < 60 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-200 rounded-lg p-3"
            >
              <p className="text-xs text-amber-700">
                ⚠️ Firestore permissions mungkin belum dikonfigurasi...
              </p>
            </motion.div>
          )}
          
          {progress >= 60 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-3"
            >
              <p className="text-xs text-green-700">
                💾 Menggunakan mode offline dengan data lokal...
              </p>
            </motion.div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            💡 Jika loading terlalu lama, periksa koneksi internet atau konfigurasi Firestore
          </p>
        </div>
      </motion.div>
    </div>
  )
}
