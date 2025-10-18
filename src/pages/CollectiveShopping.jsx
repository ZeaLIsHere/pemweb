import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, getDocs, setDoc } from 'firebase/firestore';
import { 
  Users,
  AlertCircle,
  Package
} from 'lucide-react';

export default function CollectiveShopping() {
  const { currentUser } = useAuth();
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [demoOffers, setDemoOffers] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    // Get user's products to find low stock items
    const productsQuery = query(
      collection(db, 'products'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
      try {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Filter low stock products (stok <= 5)
        const lowStockProducts = productsData.filter(product => (product.stok || 0) <= 5);
        setMyProducts(lowStockProducts);
        
        // Generate demo offers based on user's low stock products
        generateDemoOffers(lowStockProducts);
        setLoading(false);
      } catch (error) {
        console.error('Error processing products data:', error);
        setMyProducts([]);
        setLoading(false);
      }
    }, (error) => {
      console.error('Error fetching products for collective shopping:', error);
      setMyProducts([]);
      setLoading(false);
      
      if (error.code === 'permission-denied') {
        console.log('Permission denied for products collection in collective shopping');
      }
    });

    return unsubscribe;
  }, [currentUser]);

  const generateDemoOffers = (lowStockProducts) => {
    // Generate demo collective shopping offers based on low stock products
    const offers = lowStockProducts.map(product => {
      const interestedMerchants = Math.floor(Math.random() * 36) + 15; // 15-50 merchants
      const discountPercentage = Math.floor(Math.random() * 21) + 10; // 10-30% discount
      const originalPrice = product.harga || 0;
      const discountedPrice = Math.floor(originalPrice * (100 - discountPercentage) / 100);
      
      return {
        id: `offer-${product.id}`,
        productId: product.id,
        productName: product.nama,
        currentStock: product.stok,
        interestedMerchants,
        originalPrice,
        discountedPrice,
        discountPercentage,
        minOrder: Math.floor(Math.random() * 5) + 5, // 5-10 minimum order
        timeLeft: Math.floor(Math.random() * 12) + 6, // 6-18 hours left
        category: product.kategori || 'Umum',
        unit: product.satuan || 'pcs'
      };
    });
    
    setDemoOffers(offers);
  };

  // Integrated collective shopping function (replaces old store-based approach)
  const handleCollectiveShoppingJoin = async (offer) => {
    try {
      const savings = offer.originalPrice - offer.discountedPrice;
      const orderQuantity = Math.max(offer.minOrder, Math.ceil(offer.currentStock / 2)); // Smart quantity suggestion
      
      // Simulate collective order processing
      const orderData = {
        productId: offer.productId,
        productName: offer.productName,
        quantity: orderQuantity,
        unitPrice: offer.discountedPrice,
        totalPrice: offer.discountedPrice * orderQuantity,
        savings: savings * orderQuantity,
        category: offer.category,
        unit: offer.unit,
        merchantsJoined: offer.interestedMerchants + 1, // +1 for current user
        orderType: 'collective_purchase'
      };

      // Process inventory restock
      await processInventoryRestock({
        productName: offer.productName,
        quantity: orderQuantity,
        bulkPrice: offer.discountedPrice,
        category: offer.category
      });

      // Add transaction record
      await addDoc(collection(db, 'transactions'), {
        userId: currentUser.uid,
        type: 'collective_purchase',
        items: [{
          nama: offer.productName,
          quantity: orderQuantity,
          harga: offer.discountedPrice,
          totalPrice: orderData.totalPrice
        }],
        totalAmount: orderData.totalPrice,
        paymentMethod: 'collective',
        supplier: 'Collective Shopping Network',
        timestamp: serverTimestamp(),
        collectiveData: {
          merchantsJoined: orderData.merchantsJoined,
          originalPrice: offer.originalPrice,
          discountPercentage: offer.discountPercentage,
          totalSavings: orderData.savings
        }
      });

      // Success message
      alert(`✅ Belanja Kolektif Berhasil!\n\n` +
        `🛒 Produk: ${offer.productName}\n` +
        `📦 Quantity: ${orderQuantity} ${offer.unit}\n` +
        `💰 Total: Rp ${orderData.totalPrice.toLocaleString('id-ID')}\n` +
        `💸 Hemat: Rp ${orderData.savings.toLocaleString('id-ID')} (${offer.discountPercentage}%)\n` +
        `👥 Bergabung dengan ${orderData.merchantsJoined} pedagang lain\n\n` +
        `📈 Stok produk telah ditambahkan ke inventory Anda!`);

      // Refresh demo offers after successful purchase
      const updatedProducts = myProducts.map(p => 
        p.id === offer.productId 
          ? { ...p, stok: p.stok + orderQuantity }
          : p
      );
      setMyProducts(updatedProducts);
      generateDemoOffers(updatedProducts);

    } catch (error) {
      console.error('Error processing collective shopping:', error);
      alert('❌ Gagal memproses belanja kolektif. Silakan coba lagi.');
    }
  };


  const handleConfirmCollectiveOrder = async (orderData) => {
    try {
      // 1. Save collective order to Firebase
      const orderRef = await addDoc(collection(db, 'collectiveOrders'), {
        ...orderData,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        createdAt: serverTimestamp(),
        status: 'confirmed' // Langsung confirmed untuk demo
      });

      // 2. Process inventory restocking for each item
      const restockPromises = orderData.items.map(async (item) => {
        await processInventoryRestock(item);
      });

      await Promise.all(restockPromises);

      // 3. Add transaction record for collective purchase
      await addDoc(collection(db, 'transactions'), {
        userId: currentUser.uid,
        type: 'collective_purchase',
        items: orderData.items.map(item => ({
          nama: item.productName,
          quantity: item.quantity,
          harga: item.bulkPrice,
          totalPrice: item.totalPrice
        })),
        totalAmount: orderData.totalAmount,
        paymentMethod: 'collective',
        supplier: orderData.storeName,
        timestamp: serverTimestamp(),
        collectiveOrderId: orderRef.id
      });

      // Show success message
      alert(`✅ Belanja Kolektif Berhasil!\n\n🏪 Toko: ${orderData.storeName}\n💰 Total: Rp ${orderData.totalAmount.toLocaleString('id-ID')}\n💸 Penghematan: Rp ${orderData.totalSavings.toLocaleString('id-ID')}\n\n📦 Stok produk telah ditambahkan ke inventory Anda!\n🧾 Transaksi tercatat dalam riwayat pembelian.`);

      // Reset selected products for this store
      const newSelectedProducts = { ...selectedProducts };
      Object.keys(newSelectedProducts).forEach(key => {
        if (key.startsWith(orderData.storeId)) {
          delete newSelectedProducts[key];
        }
      });
      setSelectedProducts(newSelectedProducts);

    } catch (error) {
      console.error('Error creating collective order:', error);
      alert('❌ Gagal memproses belanja kolektif. Silakan coba lagi.');
    }
  };

  const processInventoryRestock = async (item) => {
    try {
      // Check if product already exists in user's inventory
      const productsQuery = query(
        collection(db, 'products'),
        where('userId', '==', currentUser.uid),
        where('nama', '==', item.productName)
      );

      const existingProducts = await getDocs(productsQuery);

      if (!existingProducts.empty) {
        // Product exists - update stock
        const existingProduct = existingProducts.docs[0];
        const currentStock = existingProduct.data().stok || 0;
        const newStock = currentStock + item.quantity;

        await updateDoc(doc(db, 'products', existingProduct.id), {
          stok: newStock,
          lastRestocked: serverTimestamp(),
          lastRestockQuantity: item.quantity,
          lastRestockPrice: item.bulkPrice,
          lastRestockSource: 'collective_purchase'
        });

        console.log(`Updated ${item.productName}: ${currentStock} + ${item.quantity} = ${newStock}`);
      } else {
        // Product doesn't exist - create new product
        const newProductData = {
          userId: currentUser.uid,
          nama: item.productName,
          kategori: item.category || 'Lainnya',
          harga: Math.round(item.bulkPrice * 1.3), // Set selling price 30% above bulk price
          stok: item.quantity,
          createdAt: serverTimestamp(),
          lastRestocked: serverTimestamp(),
          lastRestockQuantity: item.quantity,
          lastRestockPrice: item.bulkPrice,
          lastRestockSource: 'collective_purchase',
          addedViaCollective: true
        };

        await addDoc(collection(db, 'products'), newProductData);
        console.log(`Created new product: ${item.productName} with stock ${item.quantity}`);
      }
    } catch (error) {
      console.error(`Error processing restock for ${item.productName}:`, error);
      throw error;
    }
  };

  const calculateBulkSavings = (estimatedPrice) => {
    // Assume 15-25% savings for bulk purchase
    const savingsPercentage = 20;
    const savings = estimatedPrice * (savingsPercentage / 100);
    return { savings, percentage: savingsPercentage };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-secondary mb-2">Belanja Kolektif</h1>
        <p className="text-gray-600">Fitur belanja kolektif yang bertujuan untuk mendapat profit maksimal</p>
        <div className="mt-2 inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
          Aktif ketika terdapat stok menipis/kosong
        </div>
      </div>

      {/* My Low Stock Products */}
      {myProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-amber-800">Produk Perlu Restok</h3>
              <p className="text-sm text-amber-600">Stok ≤ 5 unit - Trigger otomatis untuk penawaran kolektif</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {myProducts.map((product, index) => (
              <span key={index} className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full">
                {product.nama} ({product.stok} tersisa)
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Demo Collective Shopping Offers */}
      {demoOffers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="text-center">
            <h2 className="text-xl font-bold text-secondary mb-2">🛒 Penawaran Belanja Kolektif</h2>
            <p className="text-gray-600">Bergabung dengan pedagang lain untuk harga grosir</p>
            <div className="mt-2 text-sm text-blue-600 bg-blue-50 rounded-lg p-2">
              💡 <strong>Demo:</strong> Data pedagang dan penawaran disimulasikan secara real-time
            </div>
          </div>
          
          <div className="grid gap-4">
            {demoOffers.map((offer) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-green-800 text-lg">{offer.productName}</h3>
                    <p className="text-sm text-green-600">Stok tersisa: {offer.currentStock} {offer.unit}</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                      -{offer.discountPercentage}%
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center bg-white bg-opacity-50 rounded-lg p-3">
                    <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm text-gray-600">Pedagang Tertarik</p>
                    <p className="font-bold text-blue-600">{offer.interestedMerchants}</p>
                  </div>
                  <div className="text-center bg-white bg-opacity-50 rounded-lg p-3">
                    <Package className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-sm text-gray-600">Min. Order</p>
                    <p className="font-bold text-green-600">{offer.minOrder} {offer.unit}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 line-through">Rp {offer.originalPrice.toLocaleString('id-ID')}</p>
                    <p className="text-lg font-bold text-green-700">Rp {offer.discountedPrice.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Sisa waktu</p>
                    <p className="font-bold text-orange-600">{offer.timeLeft} jam</p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleCollectiveShoppingJoin(offer)}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-xl font-bold hover:from-green-700 hover:to-blue-700 transition-all duration-200"
                >
                  🤝 Bergabung Sekarang
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
