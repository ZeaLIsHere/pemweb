import React from 'react'
import { AnimatePresence } from 'framer-motion'
import ToastNotification from './ToastNotification'

const ToastContainer = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-3 max-w-xs w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            {...toast}
            onClose={onClose}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

export default ToastContainer
