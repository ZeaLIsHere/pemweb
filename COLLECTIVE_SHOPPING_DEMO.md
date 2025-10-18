# Fitur Belanja Kolektif (DEMO Version)

## 📋 Spesifikasi Implementasi

### 🎯 Tujuan
Menyediakan simulasi fitur "Belanja Kolektif" yang berjalan sepenuhnya di sisi klien (frontend) untuk demonstrasi konsep dan alur kerja kepada audiens (juri hackathon).

### 🏗️ Arsitektur
- **Lingkungan Eksekusi:** Frontend React.js
- **Dependensi:** React, Framer Motion, Firebase Firestore (hanya untuk data produk)
- **Sumber Data:** State reaktif dari product.stok + data pseudo-random

### ⚡ Mekanisme Pemicu (Trigger)

#### Event Trigger:
1. **Lokasi:** `CheckoutModal.jsx` - fungsi `checkCollectiveShoppingOpportunity()`
2. **Pemicu:** Setelah checkout berhasil dan stok produk diupdate
3. **Kondisi:** `currentStock <= stockThreshold (5)` dan `currentStock > 0`
4. **Parameter:** `stockThreshold = 5` (hardcoded)

#### Alur Kerja:
```javascript
// 1. User checkout produk
handleCheckout() → updateDoc(stok - quantity)

// 2. Trigger check collective shopping
checkCollectiveShoppingOpportunity(soldItems)

// 3. Cek stok setiap item yang dijual
for (item of soldItems) {
  currentStock = await getDoc(productRef).data().stok
  
  // 4. Jika stok <= 5 dan > 0
  if (currentStock <= 5 && currentStock > 0) {
    // 5. Generate data pseudo-random
    interestedMerchants = random(15-50)
    
    // 6. Tampilkan alert dengan delay 500ms
    setTimeout(() => alert(offerMessage), 500)
  }
}
```

### 🎨 UI Manifestation

#### 1. Alert Popup (Checkout Trigger)
```
🛒 PENAWARAN BELANJA KOLEKTIF!

Produk: [Nama Produk]
Stok tersisa: [X] unit
[Y] pedagang lain tertarik untuk pembelian kolektif!

Bergabung sekarang untuk mendapatkan harga grosir yang lebih murah!
```

#### 2. Halaman Belanja Kolektif
- **Header:** "Belanja Kolektif (DEMO)" dengan indikator simulasi
- **Section 1:** Produk Perlu Restok (stok ≤ 5)
- **Section 2:** Penawaran Belanja Kolektif dengan data pseudo-random
- **Section 3:** Toko Terdekat (simulasi)

### 📊 Data Pseudo-Random

#### Generator Functions:
```javascript
// Jumlah pedagang tertarik: 15-50
interestedMerchants = Math.floor(Math.random() * 36) + 15

// Diskon: 10-30%
discountPercentage = Math.floor(Math.random() * 21) + 10

// Minimum order: 5-10 unit
minOrder = Math.floor(Math.random() * 5) + 5

// Sisa waktu: 6-18 jam
timeLeft = Math.floor(Math.random() * 12) + 6
```

#### Demo Offers Structure:
```javascript
{
  id: `offer-${productId}`,
  productName: string,
  currentStock: number,
  interestedMerchants: number (15-50),
  originalPrice: number,
  discountedPrice: number,
  discountPercentage: number (10-30%),
  minOrder: number (5-10),
  timeLeft: number (6-18 hours),
  category: string,
  unit: string
}
```

### 🔧 File Modifications

#### 1. CheckoutModal.jsx
- ✅ Added `checkCollectiveShoppingOpportunity()` function
- ✅ Added trigger after successful checkout
- ✅ Added `getDoc` import for reading updated stock
- ✅ Added 500ms delay for better UX

#### 2. CollectiveShopping.jsx
- ✅ Added `demoOffers` state
- ✅ Added `generateDemoOffers()` function
- ✅ Added demo offers UI section
- ✅ Updated header with DEMO indicators
- ✅ Added interactive demo buttons with alerts

### 🎯 Demo Features

#### Automatic Trigger:
1. User melakukan checkout di Cashier
2. Jika ada produk dengan stok ≤ 5 setelah checkout
3. Alert otomatis muncul dengan data pseudo-random
4. Hanya 1 alert per checkout (tidak spam)

#### Interactive Demo Page:
1. Menampilkan produk dengan stok rendah
2. Generate penawaran kolektif dengan data simulasi
3. Button "Bergabung Sekarang" dengan alert demo
4. Visual indicators bahwa ini adalah simulasi

### 🚫 Keterbatasan (Sesuai Spesifikasi)

1. **Tidak Berbasis Data Riil:** Penawaran menggunakan generator pseudo-random
2. **Tidak Persisten:** Event sesaat, tidak disimpan di database
3. **Simulasi Pengguna Tunggal:** "Pedagang lain" adalah simulasi
4. **Tidak Ada Backend:** Seluruh logika di frontend
5. **Browser Alert:** Menggunakan `alert()` standar browser

### 🎉 Hasil Implementasi

#### ✅ Sesuai Spesifikasi:
- [x] Frontend-only implementation
- [x] Trigger saat stok ≤ 5
- [x] Data pseudo-random (15-50 merchants)
- [x] Alert dengan delay 500ms
- [x] Tidak ada backend calls
- [x] Simulasi pengguna tunggal
- [x] Event tidak persisten

#### ✅ Bonus Features:
- [x] Interactive demo page
- [x] Visual demo indicators
- [x] Responsive design
- [x] Smooth animations
- [x] Error handling
- [x] Multiple offer types

### 🚀 Demo Flow

1. **Setup:** User memiliki produk dengan stok > 5
2. **Trigger:** User checkout hingga stok menjadi ≤ 5
3. **Alert:** Popup penawaran belanja kolektif otomatis
4. **Explore:** User bisa ke halaman Belanja Kolektif
5. **Interact:** Klik penawaran untuk melihat detail demo

---

**Status:** ✅ COMPLETED - Ready for Demo
**Compliance:** 100% sesuai spesifikasi fungsional & teknis
