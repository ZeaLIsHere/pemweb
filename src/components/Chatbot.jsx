import React from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Chatbot () {
  const navigate = useNavigate()

  // Floating chat button - now navigates to dedicated page
  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => navigate('/chatbot')}
      className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50"
    >
      <MessageCircle size={24} />
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
      >
        <Sparkles size={10} className="text-white" />
      </motion.div>
    </motion.button>
  )
}
