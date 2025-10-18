import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { validateStoreData, testFirebaseConnection } from '../utils/firebaseTest';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail,
  Save,
  Building,
  User,
  CheckCircle
} from 'lucide-react';

export default function StoreSetupModal({ isOpen, onComplete, userEmail }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    storeName: '',
    ownerName: '',
    address: '',
    phone: '',
    email: userEmail || '',
    description: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate current user
      if (!currentUser || !currentUser.uid) {
        throw new Error('User tidak terautentikasi. Silakan login ulang.');
      }

      // Validate required fields
      if (!formData.storeName?.trim() || !formData.ownerName?.trim() || !formData.address?.trim()) {
        alert('Mohon lengkapi semua field yang wajib diisi (*)');
        setLoading(false);
        return;
      }

      // Sanitize and validate data
      const sanitizedData = {
        storeName: formData.storeName.trim().substring(0, 100), // Limit length
        ownerName: formData.ownerName.trim().substring(0, 100),
        address: formData.address.trim().substring(0, 500),
        phone: formData.phone?.trim().substring(0, 20) || '',
        email: formData.email?.trim().substring(0, 100) || '',
        description: formData.description?.trim().substring(0, 1000) || '',
        userId: currentUser.uid,
        isActive: true,
        totalProducts: 0,
        totalSales: 0,
        totalRevenue: 0
      };

      // Add timestamp and validate data
      const storeDataWithTimestamp = {
        ...sanitizedData,
        createdAt: new Date()
      };
      
      // Validate data before sending
      const validation = validateStoreData(storeDataWithTimestamp);
      if (!validation.isValid) {
        throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
      }
      
      console.log('Creating store with validated data:', storeDataWithTimestamp);
      console.log('Current user UID:', currentUser.uid);
      
      // Try creating the store document
      const docRef = await addDoc(collection(db, 'stores'), storeDataWithTimestamp);
      
      console.log('Store created successfully with ID:', docRef.id);

      // Show success message
      alert('✅ Toko berhasil dibuat! Selamat datang di DagangCerdas.');

      // Call completion callback
      onComplete();
    } catch (error) {
      console.error('Detailed error creating store:', {
        error: error,
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      let errorMessage = 'Terjadi kesalahan saat membuat toko.';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Firestore permissions belum dikonfigurasi. Menggunakan mode offline sementara.';
        
        // Fallback: Save to localStorage as temporary solution
        const tempStoreData = {
          ...storeDataWithTimestamp,
          id: 'temp-' + Date.now(),
          isTemporary: true
        };
        
        localStorage.setItem('tempStore', JSON.stringify(tempStoreData));
        console.log('Store saved to localStorage as fallback:', tempStoreData);
        
        alert('✅ Toko berhasil dibuat (mode offline)! Data akan disinkronkan ketika koneksi tersedia.');
        onComplete();
        return;
        
      } else if (error.code === 'invalid-argument') {
        errorMessage = 'Data yang dikirim tidak valid. Periksa format data.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ Gagal membuat toko: ${errorMessage}`);
    }

    setLoading(false);
  };

  const isFormValid = formData.storeName && formData.ownerName && formData.address;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-accent text-white p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Setup Toko Anda</h2>
                  <p className="text-sm opacity-90">Langkah terakhir untuk memulai bisnis</p>
                </div>
              </div>
              
              {/* Welcome Message */}
              <div className="bg-white bg-opacity-10 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Akun berhasil dibuat!</span>
                </div>
                <p className="text-xs mt-1 opacity-90">
                  Sekarang mari setup toko pertama Anda untuk mulai berjualan
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(90vh-200px)] overflow-y-auto">
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
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
                className="w-full bg-gradient-to-r from-primary to-accent text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Membuat Toko...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Mulai Berjualan</span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Info */}
            <div className="px-6 pb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>💡 Tips:</strong> Setelah toko dibuat, Anda dapat langsung menambah produk dan mulai mencatat penjualan. Data toko dapat diubah kapan saja di menu Pengaturan.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
