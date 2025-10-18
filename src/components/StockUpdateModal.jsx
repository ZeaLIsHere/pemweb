import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Plus } from 'lucide-react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function StockUpdateModal({ product, onClose }) {
  const [updateType, setUpdateType] = useState('manual'); // 'manual' or 'batch'
  const [quantity, setQuantity] = useState('');
  const [batchCount, setBatchCount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let newStock = product.stok;
      
      if (updateType === 'manual') {
        newStock += parseInt(quantity);
      } else {
        const batchSize = product.batchSize || 1;
        newStock += parseInt(batchCount) * batchSize;
      }

      await updateDoc(doc(db, 'products', product.id), {
        stok: Math.max(0, newStock)
      });

      onClose();
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Gagal memperbarui stok');
    }

    setLoading(false);
  };

  const getPreviewStock = () => {
    let addition = 0;
    if (updateType === 'manual' && quantity) {
      addition = parseInt(quantity);
    } else if (updateType === 'batch' && batchCount) {
      const batchSize = product.batchSize || 1;
      addition = parseInt(batchCount) * batchSize;
    }
    return product.stok + addition;
  };

  return (
    <AnimatePresence>
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
          className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col m-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Mobile Optimized */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-secondary">Update Stok</h2>
                <p className="text-sm text-gray-600 truncate max-w-48">{product.nama}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">

            {/* Current Stock Info - Mobile Optimized */}
            <div className="bg-gradient-to-r from-blue-50 to-primary/5 rounded-xl p-5 mb-6 border border-blue-100">
              <h3 className="font-semibold text-gray-800 mb-4">Informasi Produk</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-blue-100">
                  <span className="text-gray-600 font-medium">Stok Saat Ini</span>
                  <span className="text-2xl font-bold text-secondary">{product.stok} {product.satuan}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-blue-100">
                  <span className="text-gray-600 font-medium">Harga Satuan</span>
                  <span className="text-lg font-bold text-primary">Rp {product.harga.toLocaleString('id-ID')}</span>
                </div>
                
                {product.batchSize > 1 && (
                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600 font-medium">Ukuran Batch</span>
                    <span className="text-lg font-semibold text-gray-800">{product.batchSize} {product.satuan}</span>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Update Type Selection - Side by Side Layout */}
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-4">
                  Cara Menambah Stok
                </label>
                <div className={`grid gap-3 ${product.batchSize > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  <button
                    type="button"
                    onClick={() => setUpdateType('manual')}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      updateType === 'manual'
                        ? 'border-primary bg-primary bg-opacity-10 text-primary shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        updateType === 'manual' ? 'border-primary bg-primary' : 'border-gray-300'
                      }`}></div>
                      <div className="text-center">
                        <div className="font-semibold">Manual</div>
                        <div className="text-xs opacity-75">Per satuan</div>
                      </div>
                    </div>
                  </button>
                  
                  {product.batchSize > 1 && (
                    <button
                      type="button"
                      onClick={() => setUpdateType('batch')}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        updateType === 'batch'
                          ? 'border-primary bg-primary bg-opacity-10 text-primary shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          updateType === 'batch' ? 'border-primary bg-primary' : 'border-gray-300'
                        }`}></div>
                        <div className="text-center">
                          <div className="font-semibold">Per Batch</div>
                          <div className="text-xs opacity-75">{product.batchSize} {product.satuan}</div>
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Quantity Input - Mobile Optimized */}
              {updateType === 'manual' ? (
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3">
                    Jumlah Tambahan ({product.satuan})
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="Masukkan jumlah"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3">
                    Jumlah Batch
                  </label>
                  <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-700">
                      💡 1 batch = {product.batchSize} {product.satuan}
                    </p>
                  </div>
                  <input
                    type="number"
                    required
                    min="1"
                    value={batchCount}
                    onChange={(e) => setBatchCount(e.target.value)}
                    className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="Masukkan jumlah batch"
                  />
                </div>
              )}

              {/* Preview - Enhanced for Mobile */}
              {((updateType === 'manual' && quantity) || (updateType === 'batch' && batchCount)) && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Plus className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-semibold text-green-800">Preview Stok</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-700">Stok setelah update:</span>
                    <span className="text-2xl font-bold text-green-800">{getPreviewStock()} {product.satuan}</span>
                  </div>
                </div>
              )}

              {/* Footer Buttons - Mobile Optimized */}
              <div className="grid grid-cols-2 gap-4 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-4 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold text-base hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || (!quantity && !batchCount)}
                  className="py-4 px-6 bg-primary text-white rounded-xl font-semibold text-base hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      <span>Update Stok</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
