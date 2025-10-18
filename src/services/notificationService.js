// Notification Service - Business logic layer for notification operations
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc,
  getDocs,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'

class NotificationService {
  constructor () {
    this.collection = 'notifications'
  }

  // Subscribe to user's notifications with real-time updates
  subscribeToUserNotifications (userId, callback) {
    if (!userId) {
      callback([])
      return () => {}
    }

    const notificationsQuery = query(
      collection(db, this.collection),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(50) // Limit to last 50 notifications
    )

    return onSnapshot(notificationsQuery, (snapshot) => {
      try {
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        callback(notifications)
      } catch (error) {
        console.error('Error processing notifications data:', error)
        callback([])
      }
    }, (error) => {
      console.error('Error fetching notifications:', error)
      callback([])
    })
  }

  // Create notification
  async createNotification (notificationData) {
    try {
      const docRef = await addDoc(collection(db, this.collection), {
        ...notificationData,
        timestamp: serverTimestamp(),
        isRead: false,
        createdAt: new Date()
      })
      return { id: docRef.id, ...notificationData }
    } catch (error) {
      console.error('Error creating notification:', error)
      throw new Error('Failed to create notification')
    }
  }

  // Mark notification as read
  async markAsRead (notificationId) {
    try {
      await updateDoc(doc(db, this.collection, notificationId), {
        isRead: true,
        readAt: serverTimestamp()
      })
      return { id: notificationId, isRead: true }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw new Error('Failed to mark notification as read')
    }
  }

  // Mark all notifications as read
  async markAllAsRead (userId) {
    try {
      const notificationsQuery = query(
        collection(db, this.collection),
        where('userId', '==', userId),
        where('isRead', '==', false)
      )
      
      const snapshot = await getDocs(notificationsQuery)
      const updatePromises = snapshot.docs.map(doc => 
        updateDoc(doc.ref, {
          isRead: true,
          readAt: serverTimestamp()
        })
      )
      
      await Promise.all(updatePromises)
      return { success: true, count: snapshot.docs.length }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw new Error('Failed to mark all notifications as read')
    }
  }

  // Delete notification
  async deleteNotification (notificationId) {
    try {
      await doc(db, this.collection, notificationId).delete()
      return { id: notificationId }
    } catch (error) {
      console.error('Error deleting notification:', error)
      throw new Error('Failed to delete notification')
    }
  }

  // Get unread notifications count
  getUnreadCount (notifications) {
    return notifications.filter(notification => !notification.isRead).length
  }

  // Get notifications by type
  getNotificationsByType (notifications, type) {
    return notifications.filter(notification => notification.type === type)
  }

  // Get recent notifications (last 24 hours)
  getRecentNotifications (notifications, hours = 24) {
    const cutoffTime = new Date()
    cutoffTime.setHours(cutoffTime.getHours() - hours)
    
    return notifications.filter(notification => {
      if (!notification.timestamp) return false
      const notificationTime = notification.timestamp?.toDate ? 
        notification.timestamp.toDate() : new Date(notification.timestamp)
      return notificationTime >= cutoffTime
    })
  }

  // Create stock alert notification
  async createStockAlert (productName, currentStock, threshold = 5) {
    const notificationData = {
      type: 'stock_alert',
      title: 'Stock Alert',
      message: `${productName} stock is low (${currentStock} remaining)`,
      priority: currentStock === 0 ? 'high' : 'medium',
      data: {
        productName,
        currentStock,
        threshold,
        action: 'update_stock'
      }
    }
    
    return this.createNotification(notificationData)
  }

  // Create sale notification
  async createSaleNotification (saleData) {
    const notificationData = {
      type: 'sale',
      title: 'New Sale',
      message: `Sale recorded: ${saleData.productName} - Rp ${saleData.price?.toLocaleString()}`,
      priority: 'low',
      data: {
        saleId: saleData.id,
        productName: saleData.productName,
        price: saleData.price,
        action: 'view_sale'
      }
    }
    
    return this.createNotification(notificationData)
  }

  // Create low stock notification
  async createLowStockNotification (productName, currentStock) {
    const notificationData = {
      type: 'low_stock',
      title: 'Low Stock Warning',
      message: `${productName} is running low (${currentStock} items left)`,
      priority: 'medium',
      data: {
        productName,
        currentStock,
        action: 'restock'
      }
    }
    
    return this.createNotification(notificationData)
  }

  // Create out of stock notification
  async createOutOfStockNotification (productName) {
    const notificationData = {
      type: 'out_of_stock',
      title: 'Out of Stock',
      message: `${productName} is out of stock`,
      priority: 'high',
      data: {
        productName,
        action: 'restock_urgent'
      }
    }
    
    return this.createNotification(notificationData)
  }

  // Create collective shopping notification
  async createCollectiveShoppingNotification (offerData) {
    const notificationData = {
      type: 'collective_shopping',
      title: 'Collective Shopping Opportunity',
      message: `Join collective order for ${offerData.productName} - Save ${offerData.discount}%`,
      priority: 'medium',
      data: {
        offerId: offerData.id,
        productName: offerData.productName,
        discount: offerData.discount,
        action: 'join_collective'
      }
    }
    
    return this.createNotification(notificationData)
  }

  // Get notification analytics
  getNotificationAnalytics (notifications) {
    const total = notifications.length
    const unread = this.getUnreadCount(notifications)
    const byType = {}
    const byPriority = { high: 0, medium: 0, low: 0 }
    
    notifications.forEach(notification => {
      // Count by type
      byType[notification.type] = (byType[notification.type] || 0) + 1
      
      // Count by priority
      if (notification.priority) {
        byPriority[notification.priority] = (byPriority[notification.priority] || 0) + 1
      }
    })
    
    return {
      total,
      unread,
      read: total - unread,
      byType,
      byPriority,
      readRate: total > 0 ? ((total - unread) / total * 100).toFixed(1) : 0
    }
  }

  // Format notification for display
  formatNotificationForDisplay (notification) {
    if (!notification) return null
    
    const timeAgo = this.getTimeAgo(notification.timestamp)
    
    return {
      ...notification,
      timeAgo,
      isRecent: this.isRecent(notification.timestamp, 1), // Last hour
      displayTitle: notification.title || 'Notification',
      displayMessage: notification.message || 'No message',
      priorityColor: this.getPriorityColor(notification.priority)
    }
  }

  // Get time ago string
  getTimeAgo (timestamp) {
    if (!timestamp) return 'Unknown time'
    
    const now = new Date()
    const notificationTime = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
    const diffInSeconds = Math.floor((now - notificationTime) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  // Check if notification is recent
  isRecent (timestamp, hours = 1) {
    if (!timestamp) return false
    
    const now = new Date()
    const notificationTime = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
    const diffInHours = (now - notificationTime) / (1000 * 60 * 60)
    
    return diffInHours <= hours
  }

  // Get priority color
  getPriorityColor (priority) {
    switch (priority) {
      case 'high': return '#EF4444' // Red
      case 'medium': return '#F59E0B' // Yellow
      case 'low': return '#10B981' // Green
      default: return '#6B7280' // Gray
    }
  }
}

export default new NotificationService()
