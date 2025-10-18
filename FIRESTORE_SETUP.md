# Firestore Setup Instructions

## Error: Missing or insufficient permissions

Jika Anda mengalami error "Missing or insufficient permissions" saat membuat toko, ikuti langkah-langkah berikut:

### 1. Buka Firebase Console
1. Pergi ke [Firebase Console](https://console.firebase.google.com/)
2. Pilih project `hackathon-dagangcers`
3. Klik "Firestore Database" di sidebar kiri

### 2. Update Firestore Security Rules
1. Klik tab "Rules" di Firestore
2. Replace rules yang ada dengan rules berikut:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Allow users to read and write their own stores
    match /stores/{storeId} {
      allow read: if isAuthenticated() && (
        !exists(/databases/$(database)/documents/stores/$(storeId)) ||
        isOwner(resource.data.userId)
      );
      allow write: if isAuthenticated() && (
        !exists(/databases/$(database)/documents/stores/$(storeId)) ||
        isOwner(resource.data.userId)
      );
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
    }
    
    // Allow users to read and write their own products
    match /products/{productId} {
      allow read: if isAuthenticated() && (
        !exists(/databases/$(database)/documents/products/$(productId)) ||
        isOwner(resource.data.userId)
      );
      allow write: if isAuthenticated() && (
        !exists(/databases/$(database)/documents/products/$(productId)) ||
        isOwner(resource.data.userId)
      );
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
    }
    
    // Allow users to read and write their own transactions
    match /transactions/{transactionId} {
      allow read: if isAuthenticated() && (
        !exists(/databases/$(database)/documents/transactions/$(transactionId)) ||
        isOwner(resource.data.userId)
      );
      allow write: if isAuthenticated() && (
        !exists(/databases/$(database)/documents/transactions/$(transactionId)) ||
        isOwner(resource.data.userId)
      );
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
    }
    
    // Allow users to read and write their own collective orders
    match /collectiveOrders/{orderId} {
      allow read: if isAuthenticated() && (
        !exists(/databases/$(database)/documents/collectiveOrders/$(orderId)) ||
        isOwner(resource.data.userId)
      );
      allow write: if isAuthenticated() && (
        !exists(/databases/$(database)/documents/collectiveOrders/$(orderId)) ||
        isOwner(resource.data.userId)
      );
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
    }
    
    // Allow users to read and write their own sales
    match /sales/{saleId} {
      allow read: if isAuthenticated() && (
        !exists(/databases/$(database)/documents/sales/$(saleId)) ||
        isOwner(resource.data.userId)
      );
      allow write: if isAuthenticated() && (
        !exists(/databases/$(database)/documents/sales/$(saleId)) ||
        isOwner(resource.data.userId)
      );
      allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
    }
  }
}
```

3. Klik "Publish" untuk menyimpan rules

### 3. Alternatif: Mode Offline
Jika Firestore permissions tidak bisa dikonfigurasi, aplikasi akan otomatis menggunakan mode offline:

- Data toko disimpan di localStorage browser
- Semua fitur tetap berfungsi normal
- Data akan disinkronkan ketika Firestore tersedia
- Indikator "Mode Offline" akan muncul di halaman Account

### 4. Production Security Rules
Untuk production, gunakan rules yang lebih ketat dari file `firestore.rules`:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own stores
    match /stores/{storeId} {
      allow read, write: if request.auth != null && 
                        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
                   request.auth.uid == request.resource.data.userId;
    }
    
    // Similar rules for other collections...
  }
}
```

### 5. Troubleshooting

#### Error masih muncul setelah update rules?
1. Tunggu beberapa menit untuk propagasi rules
2. Refresh browser/clear cache
3. Logout dan login kembali

#### Mode offline tidak muncul?
1. Check browser console untuk error logs
2. Pastikan localStorage tidak disabled
3. Try hard refresh (Ctrl+F5)

### 6. Fitur Mode Offline
Ketika dalam mode offline:
- ✅ Buat toko baru
- ✅ Lihat informasi toko di halaman Account
- ✅ Semua fitur UI tetap berfungsi
- ✅ Data tersimpan aman di localStorage
- ⚠️ Data tidak tersinkron antar device
- ⚠️ Data hilang jika clear browser data

### 7. Migration dari Offline ke Online
Ketika Firestore permissions sudah diperbaiki:
1. Data dari localStorage akan otomatis dimigrasikan
2. Refresh halaman untuk sinkronisasi
3. Indikator "Mode Offline" akan hilang
4. Data tersinkron ke cloud Firestore

## Contact
Jika masih ada masalah, check browser console untuk error details.
