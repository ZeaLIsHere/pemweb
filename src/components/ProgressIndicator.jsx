import React from 'react'
import { motion } from 'framer-motion'

const ProgressIndicator = ({ 
  progress = 0, 
  type = 'primary', 
  size = 'medium',
  showPercentage = false,
  label = '',
  animated = true 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-2'
      case 'large':
        return 'h-4'
      case 'medium':
      default:
        return 'h-3'
    }
  }

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          background: 'linear-gradient(90deg, var(--color-secondary), var(--color-secondary-light))',
          shadow: '0 2px 4px rgba(46, 204, 113, 0.3)'
        }
      case 'warning':
        return {
          background: 'linear-gradient(90deg, var(--color-accent), var(--color-accent-light))',
          shadow: '0 2px 4px rgba(243, 156, 18, 0.3)'
        }
      case 'error':
        return {
          background: 'linear-gradient(90deg, var(--color-error), #FF6B6B)',
          shadow: '0 2px 4px rgba(231, 76, 60, 0.3)'
        }
      case 'info':
        return {
          background: 'linear-gradient(90deg, var(--color-info), #74B9FF)',
          shadow: '0 2px 4px rgba(52, 152, 219, 0.3)'
        }
      case 'primary':
      default:
        return {
          background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))',
          shadow: '0 2px 4px rgba(255, 107, 53, 0.3)'
        }
    }
  }

  const styles = getTypeStyles()
  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <div className="w-full">
      {/* Label and Percentage */}
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-text-primary">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-medium text-text-accent">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      
      {/* Progress Bar */}
      <div className={`w-full ${getSizeClasses()} rounded-full overflow-hidden`}>
        <div 
          className="w-full h-full rounded-full"
          style={{ 
            backgroundColor: 'var(--color-border)',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ 
              background: styles.background,
              boxShadow: styles.shadow
            }}
            initial={{ width: 0 }}
            animate={{ width: `${clampedProgress}%` }}
            transition={animated ? { 
              duration: 0.8, 
              ease: "easeOut" 
            } : { duration: 0 }}
          />
        </div>
      </div>
    </div>
  )
}

export default ProgressIndicator
