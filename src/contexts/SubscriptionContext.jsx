import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const SubscriptionContext = createContext()

export function useSubscription () {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Bulanan',
    price: 49000, // Rp 49,000
    priceDisplay: 'Rp 49.000',
    duration: '1 bulan',
    features: [
      'Akses penuh AI Chatbot',
      'Insight mingguan otomatis',
      'Analisis bisnis mendalam',
      'Strategi penjualan personal',
      'Support prioritas'
    ],
    popular: false
  },
  yearly: {
    id: 'yearly',
    name: 'Tahunan',
    price: 490000, // Rp 490,000 (2 bulan gratis)
    priceDisplay: 'Rp 490.000',
    originalPrice: 588000, // Rp 588,000
    originalPriceDisplay: 'Rp 588.000',
    duration: '12 bulan',
    features: [
      'Akses penuh AI Chatbot',
      'Insight mingguan otomatis',
      'Analisis bisnis mendalam',
      'Strategi penjualan personal',
      'Support prioritas',
      '2 bulan GRATIS',
      'Analisis prediktif',
      'Laporan bulanan eksklusif'
    ],
    popular: true,
    savings: 98000 // Rp 98,000
  }
}

export function SubscriptionProvider ({ children }) {
  const { currentUser } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load subscription data from localStorage
  useEffect(() => {
    if (currentUser) {
      const savedSubscription = localStorage.getItem(`subscription_${currentUser.uid}`)
      if (savedSubscription) {
        try {
          const parsedSubscription = JSON.parse(savedSubscription)
          setSubscription(parsedSubscription)
        } catch (error) {
          console.error('Error parsing subscription data:', error)
          setSubscription(null)
        }
      } else {
        setSubscription(null)
      }
    } else {
      setSubscription(null)
    }
    setLoading(false)
  }, [currentUser])

  // Check if user has active subscription
  const hasActiveSubscription = () => {
    if (!subscription) return false
    
    const now = new Date()
    const endDate = new Date(subscription.endDate)
    
    return endDate > now
  }

  // Get subscription status
  const getSubscriptionStatus = () => {
    if (!subscription) return 'none'
    if (!hasActiveSubscription()) return 'expired'
    return 'active'
  }

  // Subscribe to a plan
  const subscribe = async (planId, paymentMethod = 'credit_card') => {
    if (!currentUser) throw new Error('User not authenticated')
    
    const plan = SUBSCRIPTION_PLANS[planId]
    if (!plan) throw new Error('Invalid plan')
    
    const startDate = new Date()
    const endDate = new Date()
    
    if (planId === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1)
    } else if (planId === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    }
    
    const newSubscription = {
      id: `sub_${Date.now()}`,
      userId: currentUser.uid,
      planId,
      plan,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'active',
      paymentMethod,
      createdAt: new Date().toISOString()
    }
    
    // Save to localStorage
    localStorage.setItem(`subscription_${currentUser.uid}`, JSON.stringify(newSubscription))
    setSubscription(newSubscription)
    
    return newSubscription
  }

  // Cancel subscription
  const cancelSubscription = async () => {
    if (!currentUser || !subscription) throw new Error('No active subscription')
    
    const updatedSubscription = {
      ...subscription,
      status: 'cancelled',
      cancelledAt: new Date().toISOString()
    }
    
    localStorage.setItem(`subscription_${currentUser.uid}`, JSON.stringify(updatedSubscription))
    setSubscription(updatedSubscription)
    
    return updatedSubscription
  }

  // Get days remaining
  const getDaysRemaining = () => {
    if (!subscription || !hasActiveSubscription()) return 0
    
    const now = new Date()
    const endDate = new Date(subscription.endDate)
    const diffTime = endDate - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return Math.max(0, diffDays)
  }

  // Check if feature is available
  const isFeatureAvailable = (feature) => {
    if (!hasActiveSubscription()) return false
    
    // Define feature access based on subscription
    const featureAccess = {
      'ai_chatbot': true,
      'weekly_insights': true,
      'business_analysis': true,
      'sales_strategy': true,
      'predictive_analysis': subscription?.planId === 'yearly',
      'monthly_reports': subscription?.planId === 'yearly'
    }
    
    return featureAccess[feature] || false
  }

  // Get subscription info for display
  const getSubscriptionInfo = () => {
    if (!subscription) {
      return {
        status: 'none',
        planName: 'Tidak ada',
        daysRemaining: 0,
        isActive: false
      }
    }
    
    return {
      status: getSubscriptionStatus(),
      planName: subscription.plan.name,
      daysRemaining: getDaysRemaining(),
      isActive: hasActiveSubscription(),
      endDate: subscription.endDate,
      startDate: subscription.startDate
    }
  }

  const value = {
    subscription,
    loading,
    hasActiveSubscription: hasActiveSubscription(),
    getSubscriptionStatus,
    subscribe,
    cancelSubscription,
    getDaysRemaining,
    isFeatureAvailable,
    getSubscriptionInfo,
    plans: SUBSCRIPTION_PLANS
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}
