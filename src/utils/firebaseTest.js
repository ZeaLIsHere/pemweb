import { db, auth } from '../config/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

// Test Firebase connection
export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    
    // Test auth
    console.log('Auth object:', auth);
    console.log('Current user:', auth.currentUser);
    
    // Test Firestore
    console.log('Firestore object:', db);
    
    // Try to read from a collection (this should work even without data)
    const testCollection = collection(db, 'test');
    console.log('Test collection reference:', testCollection);
    
    // Try to read existing stores (if any)
    try {
      const storesCollection = collection(db, 'stores');
      const storesSnapshot = await getDocs(storesCollection);
      console.log('Stores collection size:', storesSnapshot.size);
      console.log('Stores data:', storesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.log('Error reading stores:', error);
    }
    
    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
  }
};

// Test creating a simple document
export const testCreateDocument = async (userId) => {
  try {
    console.log('Testing document creation...');
    
    const testData = {
      testField: 'test value',
      userId: userId,
      createdAt: new Date(),
      timestamp: Date.now()
    };
    
    console.log('Test data:', testData);
    
    const docRef = await addDoc(collection(db, 'test'), testData);
    console.log('Test document created with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Document creation test failed:', error);
    throw error;
  }
};

// Validate store data before sending
export const validateStoreData = (storeData) => {
  const errors = [];
  
  // Check required fields
  if (!storeData.storeName || typeof storeData.storeName !== 'string') {
    errors.push('storeName is required and must be a string');
  }
  
  if (!storeData.ownerName || typeof storeData.ownerName !== 'string') {
    errors.push('ownerName is required and must be a string');
  }
  
  if (!storeData.address || typeof storeData.address !== 'string') {
    errors.push('address is required and must be a string');
  }
  
  if (!storeData.userId || typeof storeData.userId !== 'string') {
    errors.push('userId is required and must be a string');
  }
  
  // Check field lengths
  if (storeData.storeName && storeData.storeName.length > 100) {
    errors.push('storeName must be 100 characters or less');
  }
  
  if (storeData.ownerName && storeData.ownerName.length > 100) {
    errors.push('ownerName must be 100 characters or less');
  }
  
  if (storeData.address && storeData.address.length > 500) {
    errors.push('address must be 500 characters or less');
  }
  
  // Check optional fields
  if (storeData.phone && typeof storeData.phone !== 'string') {
    errors.push('phone must be a string');
  }
  
  if (storeData.email && typeof storeData.email !== 'string') {
    errors.push('email must be a string');
  }
  
  if (storeData.description && typeof storeData.description !== 'string') {
    errors.push('description must be a string');
  }
  
  // Check boolean fields
  if (typeof storeData.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }
  
  // Check number fields
  if (typeof storeData.totalProducts !== 'number') {
    errors.push('totalProducts must be a number');
  }
  
  if (typeof storeData.totalSales !== 'number') {
    errors.push('totalSales must be a number');
  }
  
  if (typeof storeData.totalRevenue !== 'number') {
    errors.push('totalRevenue must be a number');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};
