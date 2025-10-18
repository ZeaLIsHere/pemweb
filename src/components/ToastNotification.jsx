import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react'

const ToastNotification = ({ 
  id, 
  type = 'info', 
  title, 
  message, 
  duration = 5000, 
  onClose, 
  action 
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [id, duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-white" />
      case 'error':
        return <AlertCircle className="w-6 h-6 text-white" />
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-white" />
      case 'info':
      default:
        return <Info className="w-6 h-6 text-white" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          background: 'linear-gradient(135deg, var(--color-secondary), var(--color-secondary-light))',
          iconBg: 'rgba(46, 204, 113, 0.2)',
          shadow: '0 8px 32px rgba(46, 204, 113, 0.3)'
        }
      case 'error':
        return {
          background: 'linear-gradient(135deg, var(--color-error), #FF6B6B)',
          iconBg: 'rgba(231, 76, 60, 0.2)',
          shadow: '0 8px 32px rgba(231, 76, 60, 0.3)'
        }
      case 'warning':
        return {
          background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-light))',
          iconBg: 'rgba(243, 156, 18, 0.2)',
          shadow: '0 8px 32px rgba(243, 156, 18, 0.3)'
        }
      case 'info':
      default:
        return {
          background: 'linear-gradient(135deg, var(--color-info), #74B9FF)',
          iconBg: 'rgba(52, 152, 219, 0.2)',
          shadow: '0 8px 32px rgba(52, 152, 219, 0.3)'
        }
    }
  }

  const styles = getStyles()

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.3 
      }}
      className="relative max-w-xs w-full"
      style={{ boxShadow: styles.shadow }}
    >
      <div 
        className="rounded-2xl p-4 text-white relative overflow-hidden"
        style={{ background: styles.background }}
      >
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{ 
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)`
          }}
        />
        
        <div className="relative flex items-start space-x-3">
          {/* Icon */}
          <div 
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: styles.iconBg }}
          >
            {getIcon()}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="text-sm font-semibold text-white mb-1">
                {title}
              </h4>
            )}
            <p className="text-sm text-white/90 leading-relaxed">
              {message}
            </p>
            
            {/* Action Button */}
            {action && (
              <button
                onClick={action.onClick}
                className="mt-3 text-xs font-medium text-white underline hover:text-white/80 transition-colors"
              >
                {action.label}
              </button>
            )}
          </div>
          
          {/* Close Button */}
          <button
            onClick={() => onClose(id)}
            className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        
        {/* Progress Bar */}
        {duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-2xl overflow-hidden">
            <motion.div
              className="h-full bg-white/40"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default ToastNotification
