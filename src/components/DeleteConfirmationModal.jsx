import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Trash2 } from 'lucide-react'

export default function DeleteConfirmationModal ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  product,
  loading = false 
}) {
  const [confirmText, setConfirmText] = useState('')
  const isConfirmValid = confirmText.toUpperCase() === 'HAPUS'

  // Reset confirmation text when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setConfirmText('')
    }
  }, [isOpen])

  if (!product) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-600">Hapus Produk</h2>
                  <p className="text-sm text-gray-600">Konfirmasi penghapusan</p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="p-3 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Confirmation Question */}
              <div className="text-center mb-6">
                <p className="text-lg font-semibold text-gray-800 mb-3">
                  Apakah Anda yakin ingin menghapus produk
                </p>
                <p className="text-xl font-bold text-red-600 mb-4">
                  &quot;{product.nama}&quot;?
                </p>
                <p className="text-sm text-gray-600">
                  Ketik &quot;<span className="font-semibold text-red-600">HAPUS</span>&quot; untuk mengkonfirmasi
                </p>
              </div>

              {/* Confirmation Input */}
              <div className="mb-6">
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Ketik HAPUS untuk konfirmasi"
                  className="w-full px-4 py-3 border-2 border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-center font-semibold text-red-600 placeholder-red-300"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="py-4 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold text-base hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={onConfirm}
                  disabled={!isConfirmValid || loading}
                  className={`flex-1 py-4 px-6 rounded-xl font-semibold text-base transition-colors flex items-center justify-center space-x-2 ${
                    isConfirmValid && !loading
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={20} />
                      <span>Hapus Produk</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
