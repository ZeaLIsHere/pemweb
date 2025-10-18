import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../config/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { 
  X, 
  Store, 
  MapPin, 
  Phone, 
  Mail,
  Save,
  Building,
  User
} from 'lucide-react'

export default function CreateStoreModal ({ isOpen, onClose }) {
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    storeName: '',
    ownerName: '',
    address: '',
    phone: '',
    email: '',
    description: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate current user
      if (!currentUser || !currentUser.uid) {
        throw new Error('User tidak terautentikasi. Silakan login ulang.')
      }

      // Validate required fields
      if (!formData.storeName?.trim() || !formData.ownerName?.trim() || !formData.address?.trim()) {
        alert('Mohon lengkapi semua field yang wajib diisi (*)')
        setLoading(false)
        return
      }

      // Sanitize and validate data
      const sanitizedData = {
        storeName: formData.storeName.trim().substring(0, 100),
        ownerName: formData.ownerName.trim().substring(0, 100),
        address: formData.address.trim().substring(0, 500),
        phone: formData.phone?.trim().substring(0, 20) || '',
        email: formData.email?.trim().substring(0, 100) || '',
        description: formData.description?.trim().substring(0, 1000) || '',
        userId: currentUser.uid,
        isActive: true,
        totalProducts: 0,
        totalSales: 0,
        totalRevenue: 0,
        createdAt: new Date() // Use regular Date instead of serverTimestamp
      }

      console.log('Creating store with sanitized data:', sanitizedData)
      
      const docRef = await addDoc(collection(db, 'stores'), sanitizedData)
      
      console.log('Store created successfully with ID:', docRef.id)

      // Reset form
      setFormData({
        storeName: '',
        ownerName: '',
        address: '',
        phone: '',
        email: '',
        description: ''
      })

      alert('✅ Toko berhasil dibuat!')
      onClose()
    } catch (error) {
      console.error('Detailed error creating store:', {
        error,
        message: error.message,
        code: error.code
      })
      
      let errorMessage = 'Terjadi kesalahan saat membuat toko.'
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Tidak memiliki izin untuk membuat toko.'
      } else if (error.code === 'invalid-argument') {
        errorMessage = 'Data yang dikirim tidak valid.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(`❌ Gagal membuat toko: ${errorMessage}`)
    }

    setLoading(false)
  }

  const isFormValid = formData.storeName && formData.ownerName && formData.address

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
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-secondary">Buat Toko Baru</h2>
                  <p className="text-sm text-gray-600">Tambah toko untuk bisnis yang berbeda</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(90vh-140px)] overflow-y-auto">
              {/* Store Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Store className="w-4 h-4 inline mr-2" />
                  Nama Toko *
                </label>
                <input
                  type="text"
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Contoh: Toko Sembako Barokah"
                  required
                />
              </div>

              {/* Owner Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nama Pemilik *
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Nama lengkap pemilik toko"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Alamat Toko *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input-field"
                  rows="3"
                  placeholder="Alamat lengkap toko"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="08xx-xxxx-xxxx"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Toko
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="email@tokosaya.com"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="w-4 h-4 inline mr-2" />
                  Deskripsi Toko
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input-field"
                  rows="2"
                  placeholder="Deskripsi singkat tentang toko Anda"
                />
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!isFormValid || loading}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Buat Toko</span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Info */}
            <div className="px-6 pb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Info:</strong> Setelah toko dibuat, Anda dapat beralih antar toko dan mengelola data terpisah untuk setiap bisnis.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
