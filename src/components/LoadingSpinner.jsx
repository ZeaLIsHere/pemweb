import React from 'react'
import { motion } from 'framer-motion'
import { Loader2, Package, ShoppingCart, BarChart3, Users } from 'lucide-react'

export default function LoadingSpinner ({ 
  size = 'medium', 
  message = 'Memuat...', 
  type = 'default',
  showProgress = false,
  progress = 0 
}) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  const getIcon = () => {
    switch (type) {
      case 'product':
        return <Package className="w-full h-full" />
      case 'cart':
        return <ShoppingCart className="w-full h-full" />
      case 'analytics':
        return <BarChart3 className="w-full h-full" />
      case 'users':
        return <Users className="w-full h-full" />
      default:
        return <Loader2 className="w-full h-full" />
    }
  }

  const getMessage = () => {
    if (message) return message
    
    switch (type) {
      case 'product':
        return 'Memuat produk...'
      case 'cart':
        return 'Memproses keranjang...'
      case 'analytics':
        return 'Menganalisis data...'
      case 'users':
        return 'Memuat pengguna...'
      default:
        return 'Memuat...'
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Animated Icon */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`${sizeClasses[size]} text-primary relative`}
      >
        {getIcon()}
        
        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, var(--color-primary-light) 0%, transparent 70%)',
            opacity: 0.3
          }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </motion.div>
      
      {/* Message */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-4 text-sm text-text-secondary text-center font-medium"
      >
        {getMessage()}
      </motion.p>
      
      {/* Progress Bar */}
      {showProgress && (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: '200px' }}
          transition={{ delay: 0.4 }}
          className="mt-4 w-48"
        >
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}
      
      {/* Loading Dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-3 loading-dots"
      >
        <span></span>
        <span></span>
        <span></span>
      </motion.div>
    </div>
  )
}
