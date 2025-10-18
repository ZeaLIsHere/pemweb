import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '../config/firebase'

// Enhanced error handling for Firestore operations
export const handleFirestoreError = (error, operation = 'operation') => {
  console.error(`Firestore ${operation} error:`, error)
  
  switch (error.code) {
    case 'permission-denied':
      console.log(`Permission denied for ${operation}. Check Firestore rules.`)
      return `Tidak memiliki izin untuk ${operation}. Periksa konfigurasi database.`
    
    case 'unavailable':
      console.log(`Firestore unavailable for ${operation}. Using offline mode.`)
      return `Database tidak tersedia. Menggunakan mode offline.`
    
    case 'unauthenticated':
      console.log(`User not authenticated for ${operation}.`)
      return `Silakan login terlebih dahulu.`
    
    case 'not-found':
      console.log(`Document not found for ${operation}.`)
      return `Data tidak ditemukan.`
    
    case 'already-exists':
      console.log(`Document already exists for ${operation}.`)
      return `Data sudah ada.`
    
    case 'invalid-argument':
      console.log(`Invalid argument for ${operation}.`)
      return `Data tidak valid.`
    
    default:
      console.log(`Unknown error for ${operation}:`, error.message)
      return `Terjadi kesalahan: ${error.message}`
  }
}

// Safe onSnapshot wrapper with error handling
export const safeOnSnapshot = (query, onSuccess, onError, operation = 'fetch data') => {
  return onSnapshot(
    query,
    (snapshot) => {
      try {
        onSuccess(snapshot)
      } catch (error) {
        console.error(`Error processing ${operation}:`, error)
        if (onError) onError(error)
      }
    },
    (error) => {
      const errorMessage = handleFirestoreError(error, operation)
      console.error(`Error in ${operation}:`, errorMessage)
      if (onError) onError(error)
    }
  )
}

// Safe addDoc wrapper
export const safeAddDoc = async (collectionRef, data, operation = 'create document') => {
  try {
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: serverTimestamp()
    })
    console.log(`Successfully ${operation} with ID:`, docRef.id)
    return { success: true, id: docRef.id }
  } catch (error) {
    const errorMessage = handleFirestoreError(error, operation)
    console.error(`Failed to ${operation}:`, errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Safe updateDoc wrapper
export const safeUpdateDoc = async (docRef, data, operation = 'update document') => {
  try {
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
    console.log(`Successfully ${operation}`)
    return { success: true }
  } catch (error) {
    const errorMessage = handleFirestoreError(error, operation)
    console.error(`Failed to ${operation}:`, errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Safe deleteDoc wrapper
export const safeDeleteDoc = async (docRef, operation = 'delete document') => {
  try {
    await deleteDoc(docRef)
    console.log(`Successfully ${operation}`)
    return { success: true }
  } catch (error) {
    const errorMessage = handleFirestoreError(error, operation)
    console.error(`Failed to ${operation}:`, errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Safe getDocs wrapper
export const safeGetDocs = async (query, operation = 'get documents') => {
  try {
    const snapshot = await getDocs(query)
    const docs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    console.log(`Successfully ${operation}, found ${docs.length} documents`)
    return { success: true, docs }
  } catch (error) {
    const errorMessage = handleFirestoreError(error, operation)
    console.error(`Failed to ${operation}:`, errorMessage)
    return { success: false, error: errorMessage, docs: [] }
  }
}

// Create user-specific query
export const createUserQuery = (collectionName, userId) => {
  return query(
    collection(db, collectionName),
    where('userId', '==', userId)
  )
}

// Validate data before Firestore operations
export const validateFirestoreData = (data, requiredFields = []) => {
  const errors = []
  
  // Check required fields
  requiredFields.forEach(field => {
    if (!data[field] || data[field] === '') {
      errors.push(`Field '${field}' is required`)
    }
  })
  
  // Check data types
  Object.keys(data).forEach(key => {
    const value = data[key]
    
    // Check for undefined or null values
    if (value === undefined) {
      errors.push(`Field '${key}' cannot be undefined`)
    }
    
    // Check string length limits
    if (typeof value === 'string' && value.length > 1000) {
      errors.push(`Field '${key}' is too long (max 1000 characters)`)
    }
    
    // Check number validity
    if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
      errors.push(`Field '${key}' must be a valid number`)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Retry mechanism for failed operations
export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await operation()
      if (result.success) {
        return result
      }
      
      if (i === maxRetries - 1) {
        return result // Return the last failed result
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
    } catch (error) {
      if (i === maxRetries - 1) {
        return { success: false, error: error.message }
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
    }
  }
}
