import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, AlertTriangle, Info, Clock, XCircle } from 'lucide-react'

const StatusBadge = ({ 
  status, 
  size = 'medium', 
  animated = true,
  showIcon = true,
  customLabel = null 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
      case 'completed':
      case 'active':
        return {
          label: customLabel || 'Berhasil',
          icon: CheckCircle,
          className: 'status-success',
          bgColor: 'linear-gradient(135deg, var(--color-secondary-light), var(--color-secondary))',
          iconColor: 'white',
          shadow: '0 2px 10px rgba(46, 204, 113, 0.2)'
        }
      case 'warning':
      case 'pending':
      case 'low_stock':
        return {
          label: customLabel || 'Perhatian',
          icon: AlertTriangle,
          className: 'status-warning',
          bgColor: 'linear-gradient(135deg, var(--color-accent-light), var(--color-accent))',
          iconColor: 'white',
          shadow: '0 2px 10px rgba(243, 156, 18, 0.2)'
        }
      case 'error':
      case 'failed':
      case 'out_of_stock':
        return {
          label: customLabel || 'Error',
          icon: XCircle,
          className: 'status-error',
          bgColor: 'linear-gradient(135deg, #FF6B6B, var(--color-error))',
          iconColor: 'white',
          shadow: '0 2px 10px rgba(231, 76, 60, 0.2)'
        }
      case 'info':
      case 'processing':
        return {
          label: customLabel || 'Info',
          icon: Info,
          className: 'status-info',
          bgColor: 'linear-gradient(135deg, #74B9FF, var(--color-info))',
          iconColor: 'white',
          shadow: '0 2px 10px rgba(52, 152, 219, 0.2)'
        }
      case 'loading':
      case 'waiting':
        return {
          label: customLabel || 'Loading',
          icon: Clock,
          className: 'status-info',
          bgColor: 'linear-gradient(135deg, #74B9FF, var(--color-info))',
          iconColor: 'white',
          shadow: '0 2px 10px rgba(52, 152, 219, 0.2)'
        }
      default:
        return {
          label: customLabel || 'Unknown',
          icon: AlertCircle,
          className: 'status-info',
          bgColor: 'linear-gradient(135deg, #74B9FF, var(--color-info))',
          iconColor: 'white',
          shadow: '0 2px 10px rgba(52, 152, 219, 0.2)'
        }
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-3 py-1 text-xs'
      case 'large':
        return 'px-6 py-3 text-base'
      case 'medium':
      default:
        return 'px-4 py-2 text-sm'
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  const BadgeContent = () => (
    <div 
      className={`inline-flex items-center rounded-full font-medium text-white transition-all duration-300 ${getSizeClasses()}`}
      style={{ 
        background: config.bgColor,
        boxShadow: config.shadow
      }}
    >
      {showIcon && (
        <Icon 
          className={`${size === 'small' ? 'w-3 h-3' : size === 'large' ? 'w-5 h-5' : 'w-4 h-4'} mr-2`}
          style={{ color: config.iconColor }}
        />
      )}
      <span>{config.label}</span>
    </div>
  )

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20 
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <BadgeContent />
      </motion.div>
    )
  }

  return <BadgeContent />
}

export default StatusBadge
