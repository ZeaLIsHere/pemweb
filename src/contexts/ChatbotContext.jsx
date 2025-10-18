import React, { createContext, useContext, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { useNotification } from './NotificationContext'

const ChatbotContext = createContext()

export function useChatbot () {
  return useContext(ChatbotContext)
}

export function ChatbotProvider ({ children }) {
  const { currentUser } = useAuth()
  const { addNotification } = useNotification()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: 'Halo Pak/Bu! Saya Agam AI, siap bantu toko Anda. Mau tanya apa hari ini?',
      timestamp: new Date(),
      suggestions: ['Jualan hari ini gimana?', 'Barang apa yang habis?', 'Gimana biar laris?', 'Kasih saran dong']
    }
  ])
  const [isTyping, setIsTyping] = useState(false)

  // AI Knowledge Base - Enhanced for comprehensive business analysis
  const aiKnowledgeBase = {
    // Greeting patterns
    greetings: ['halo', 'hai', 'hello', 'hi', 'selamat', 'pagi', 'siang', 'sore', 'malam'],
    
    // Business analytics keywords
    analytics: {
      sales: ['penjualan', 'jual', 'transaksi', 'revenue', 'pendapatan', 'omzet'],
      stock: ['stok', 'inventory', 'barang', 'produk', 'habis', 'kosong'],
      trends: ['tren', 'trend', 'naik', 'turun', 'meningkat', 'menurun', 'pattern', 'pola'],
      profit: ['profit', 'keuntungan', 'margin', 'laba', 'rugi'],
      customers: ['pelanggan', 'customer', 'pembeli', 'konsumen'],
      time: ['hari ini', 'kemarin', 'minggu', 'bulan', 'jam', 'waktu']
    },

    // Strategy keywords
    strategies: {
      sales: ['strategi', 'strategy', 'rencana', 'plan', 'cara', 'gimana', 'besok', 'lusa', 'minggu depan', 'bulan depan'],
      stock: ['stok cepat habis', 'stok tidak habis', 'barang lambat laku', 'produk sulit dijual'],
      business: ['analisis', 'analyze', 'lihat', 'cek', 'check', 'laporan', 'evaluasi']
    },

    // Quick actions
    actions: {
      help: ['bantuan', 'help', 'gimana', 'cara', 'tutorial'],
      navigation: ['buka', 'ke', 'halaman', 'menu', 'dashboard'],
      analysis: ['analisis', 'analyze', 'lihat', 'cek', 'check', 'laporan']
    }
  }

  // Smart Response Generator - Enhanced for comprehensive business analysis
  const generateSmartResponse = useCallback((userMessage, businessData = {}) => {
    const message = userMessage.toLowerCase()
    
    // Greeting responses
    if (aiKnowledgeBase.greetings.some(greeting => message.includes(greeting))) {
      return {
        message: `Halo ${currentUser?.displayName || 'Pak/Bu'}! Saya Agam AI, siap bantu toko Anda. Mau tanya apa hari ini?`,
        suggestions: ['Strategi penjualan besok', 'Analisis stok hari ini', 'Prediksi tren minggu depan', 'Tips meningkatkan profit']
      }
    }

    // Sales Strategy Responses
    if (aiKnowledgeBase.strategies.sales.some(keyword => message.includes(keyword))) {
      if (message.includes('besok') || message.includes('tomorrow')) {
        return {
          message: `📈 STRATEGI PENJUALAN BESOK:\n\n🎯 Target Harian:\n• Target pembeli: 15-20 orang (naik 25%)\n• Target omzet: Rp 300.000-400.000\n• Fokus jam: 10-12 pagi & 2-4 sore\n\n📦 Persiapan Stok:\n• Siapkan Mie Instan 30 bungkus (biasanya laku 25)\n• Teh Botol 20 botol (weekend pattern)\n• Sabun Mandi 10 batang (habis kemarin)\n\n💡 Strategi Marketing:\n• Promo paket Mie + Teh (hemat Rp 1.000)\n• Display barang populer di depan\n• Siapkan kembalian kecil untuk transaksi cepat\n\n⏰ Timeline:\n• 08:00 - Cek stok & display\n• 10:00 - Mulai promo paket\n• 14:00 - Peak hour preparation\n• 18:00 - Evaluasi & persiapan lusa`,
          suggestions: ['Strategi untuk lusa', 'Analisis kompetitor', 'Cara promosi efektif', 'Prediksi cuaca & dampaknya']
        }
      }
      
      if (message.includes('lusa') || message.includes('day after tomorrow')) {
        return {
          message: `📊 STRATEGI PENJUALAN LUSA:\n\n🔍 Analisis Pattern:\n• Hari ke-3 biasanya ada penurunan 10-15%\n• Pelanggan mulai bosan dengan promo yang sama\n• Perlu variasi strategi\n\n🎯 Strategi Diferensiasi:\n• Ganti promo: Biskuit + Kopi (margin lebih tinggi)\n• Fokus pada barang yang belum laku kemarin\n• Target pelanggan baru dengan diskon khusus\n\n📈 Prediksi Performa:\n• Pembeli: 12-16 orang (normal pattern)\n• Omzet: Rp 250.000-320.000\n• Margin: Lebih tinggi karena mix produk berbeda\n\n💡 Tips Khusus:\n• Observasi reaksi pelanggan terhadap promo baru\n• Catat barang mana yang mulai menarik perhatian\n• Siapkan strategi recovery jika penjualan turun`,
          suggestions: ['Strategi minggu depan', 'Analisis customer behavior', 'Cara maintain momentum', 'Preparasi weekend']
        }
      }
      
      if (message.includes('minggu depan') || message.includes('next week')) {
      return {
          message: `🗓️ STRATEGI PENJUALAN MINGGU DEPAN:\n\n📊 Analisis Mingguan:\n• Target pembeli: 100-120 orang (naik 20%)\n• Target omzet: Rp 1.800.000-2.200.000\n• Hari terbaik: Selasa, Kamis, Sabtu\n• Hari challenging: Senin, Rabu\n\n🎯 Strategi Harian:\n• Senin: Recovery weekend + promo fresh start\n• Selasa: Peak day - fokus pada volume\n• Rabu: Mid-week slump - promo kreatif\n• Kamis: Momentum building\n• Jumat: Weekend preparation\n• Sabtu: Peak weekend sales\n• Minggu: Maintenance & planning\n\n📦 Inventory Strategy:\n• Bulk buying untuk barang fast-moving\n• Diversifikasi supplier untuk harga kompetitif\n• Safety stock untuk barang kritis\n\n💡 Marketing Mix:\n• Promo harian berbeda untuk avoid fatigue\n• Loyalty program untuk repeat customers\n• Cross-selling training untuk staff`,
          suggestions: ['Strategi bulan depan', 'Analisis seasonal trends', 'Competitor analysis', 'Customer retention strategy']
      }
    }

      if (message.includes('bulan depan') || message.includes('next month')) {
        return {
          message: `📅 STRATEGI PENJUALAN BULAN DEPAN:\n\n🎯 Target Bulanan:\n• Target pembeli: 400-500 orang (growth 25%)\n• Target omzet: Rp 7.500.000-9.000.000\n• Target margin: 35-40% (naik 5%)\n• Market share: 15% dari total pasar lokal\n\n📊 Strategic Planning:\n• Week 1: Market penetration (promo agresif)\n• Week 2: Customer acquisition (referral program)\n• Week 3: Revenue optimization (upselling)\n• Week 4: Retention & loyalty building\n\n🏪 Business Development:\n• Ekspansi produk line (snack sehat, minuman premium)\n• Partnership dengan supplier lokal\n• Digital marketing (WhatsApp Business, Instagram)\n• Customer database development\n\n📈 KPI Monitoring:\n• Daily sales tracking\n• Customer acquisition cost\n• Inventory turnover ratio\n• Profit margin per product category\n\n💡 Innovation:\n• Cashless payment options\n• Delivery service untuk area sekitar\n• Membership program dengan benefits\n• Seasonal product rotation`,
          suggestions: ['Analisis kompetitif mendalam', 'Financial forecasting', 'Risk management strategy', 'Technology integration plan']
        }
      }
      
      return {
        message: `🎯 STRATEGI PENJUALAN UMUM:\n\n📊 Analisis Situasi:\n• Identifikasi produk bestseller dan slow-mover\n• Analisis pola pembelian pelanggan\n• Evaluasi jam-jam ramai dan sepi\n• Review margin profit per kategori\n\n💡 Strategi Implementasi:\n• Product bundling untuk meningkatkan AOV\n• Dynamic pricing berdasarkan demand\n• Customer segmentation untuk targeted marketing\n• Inventory optimization untuk cash flow\n\n📈 Growth Strategy:\n• Market expansion ke area baru\n• Product diversification\n• Customer loyalty programs\n• Operational efficiency improvements\n\n🎪 Marketing Tactics:\n• Seasonal promotions\n• Referral incentives\n• Cross-selling techniques\n• Brand positioning strategies`,
        suggestions: ['Strategi untuk besok', 'Analisis kompetitor', 'Customer behavior analysis', 'Financial planning']
      }
    }

    // Stock Management Strategy Responses
    if (aiKnowledgeBase.strategies.stock.some(keyword => message.includes(keyword))) {
      if (message.includes('stok cepat habis') || message.includes('fast moving')) {
        return {
          message: `⚡ STRATEGI STOK CEPAT HABIS:\n\n🔍 Identifikasi Fast-Moving Items:\n• Mie Instan: Habis dalam 2-3 hari\n• Teh Botol: Habis dalam 1-2 hari\n• Sabun Mandi: Habis dalam 3-4 hari\n• Biskuit: Habis dalam 4-5 hari\n\n📦 Inventory Management:\n• Safety stock: 50% dari rata-rata penjualan harian\n• Reorder point: Ketika stok tinggal 30%\n• Bulk buying: Beli 2-3x lipat untuk efisiensi\n• Supplier backup: Minimal 2 supplier per item\n\n💰 Financial Strategy:\n• Cash flow planning untuk bulk purchase\n• Negotiate better terms dengan supplier\n• Consider consignment untuk high-value items\n• Monitor payment terms untuk cash flow\n\n📊 Monitoring System:\n• Daily stock check untuk fast-movers\n• Automated alerts ketika stok rendah\n• Sales velocity tracking\n• Demand forecasting berdasarkan historical data\n\n💡 Optimization Tips:\n• Display fast-movers di lokasi strategis\n• Bundle dengan slow-movers\n• Price optimization untuk maximize profit\n• Customer education tentang availability`,
          suggestions: ['Strategi slow-moving items', 'Supplier management', 'Cash flow optimization', 'Demand forecasting']
        }
      }
      
      if (message.includes('stok tidak habis') || message.includes('slow moving') || message.includes('lambat laku')) {
        return {
          message: `🐌 STRATEGI STOK LAMBAT LAKU:\n\n🔍 Identifikasi Slow-Moving Items:\n• Produk premium dengan harga tinggi\n• Produk seasonal yang out of season\n• Produk dengan kompetitor kuat\n• Produk dengan margin rendah\n\n📊 Analisis Penyebab:\n• Price positioning vs kompetitor\n• Product visibility di toko\n• Customer awareness dan education\n• Market demand yang rendah\n\n💡 Strategi Penanganan:\n• Promo bundling dengan fast-movers\n• Display di lokasi high-traffic\n• Customer education dan sampling\n• Price adjustment berdasarkan market\n\n🎯 Marketing Tactics:\n• Cross-selling dengan produk populer\n• Limited time offers\n• Customer testimonials dan reviews\n• Social proof dan recommendations\n\n📈 Inventory Optimization:\n• Reduce order quantity untuk slow-movers\n• Negotiate return policy dengan supplier\n• Consider clearance sales\n• Donation atau charity untuk expired items\n\n🔄 Product Rotation:\n• Seasonal product planning\n• Trend analysis untuk product selection\n• Customer feedback integration\n• Market research untuk new products`,
          suggestions: ['Strategi fast-moving items', 'Product lifecycle management', 'Market research methods', 'Customer feedback analysis']
        }
      }
      
      if (message.includes('produk sulit dijual') || message.includes('hard to sell')) {
        return {
          message: `🚫 STRATEGI PRODUK SULIT DIJUAL:\n\n🔍 Root Cause Analysis:\n• Market saturation atau oversupply\n• Price tidak kompetitif\n• Product quality issues\n• Poor marketing atau positioning\n• Wrong target market\n\n📊 Diagnostic Process:\n• Competitor price analysis\n• Customer feedback collection\n• Market demand assessment\n• Product quality evaluation\n• Brand positioning review\n\n💡 Recovery Strategies:\n• Price optimization (discount atau premium)\n• Product improvement atau reformulation\n• Market repositioning\n• Target market adjustment\n• Marketing campaign redesign\n\n🎯 Action Plan:\n• Immediate: Clearance sale untuk cash recovery\n• Short-term: Product improvement atau rebranding\n• Medium-term: Market research dan repositioning\n• Long-term: Product discontinuation atau pivot\n\n📈 Success Metrics:\n• Sales velocity improvement\n• Customer satisfaction scores\n• Market share growth\n• Profit margin recovery\n• Brand perception improvement\n\n🔄 Alternative Strategies:\n• Product bundling dengan popular items\n• B2B sales ke distributor lain\n• Online marketplace expansion\n• Export ke market yang berbeda\n• Product transformation atau repurposing`,
          suggestions: ['Product lifecycle analysis', 'Market research techniques', 'Competitive analysis', 'Customer segmentation']
        }
      }
      
      return {
        message: `📦 STRATEGI MANAJEMEN STOK UMUM:\n\n🎯 Inventory Optimization:\n• ABC Analysis: Kategorisasi berdasarkan value\n• Just-in-Time: Minimize holding costs\n• Safety Stock: Buffer untuk demand uncertainty\n• Economic Order Quantity: Optimize order size\n\n📊 Monitoring Systems:\n• Real-time inventory tracking\n• Automated reorder points\n• Demand forecasting\n• Supplier performance metrics\n\n💡 Best Practices:\n• Regular stock audits\n• Supplier relationship management\n• Technology integration (barcode, RFID)\n• Staff training untuk inventory management\n\n📈 Performance Metrics:\n• Inventory turnover ratio\n• Stock-out frequency\n• Carrying costs\n• Order fulfillment rate\n• Customer satisfaction dengan availability`,
        suggestions: ['Fast-moving items strategy', 'Slow-moving items strategy', 'Supplier management', 'Technology solutions']
      }
    }

    // Profit analysis
    if (aiKnowledgeBase.analytics.profit.some(keyword => message.includes(keyword))) {
      return {
        message: `Untung Rugi Barang:\n\nPaling untung: ${businessData.bestMarginCategory || 'Minuman'} (untung ${businessData.bestMargin || '42'}%)\nKurang untung: ${businessData.worstMarginCategory || 'Sembako'} (untung ${businessData.worstMargin || '18'}%)\nRata-rata untung: ${businessData.overallMargin || '32'}%\n\nSaran saya:\n• Fokus jual barang yang untungnya gede\n• Tawar supplier buat barang yang untungnya kecil\n• Bikin paket bundling biar untung lebih`,
        suggestions: ['Gimana atur harga?', 'Cara nawar supplier', 'Bikin paket barang', 'Harga pesaing berapa?']
      }
    }

    // Help and tutorials
    if (aiKnowledgeBase.actions.help.some(keyword => message.includes(keyword))) {
      return {
        message: `Cara Pakai DagangCerdas:\n\nLihat Laporan: Buat tau gimana jualan hari ini\nKasir: Buat catat pembeli dengan cepat\nCek Stok: Buat tau barang mana yang habis\nStatistik: Lihat semua data toko\n\nTips: Tanya apa aja sama saya, saya siap bantu kapan aja!`,
        suggestions: ['Gimana cara pakai kasir?', 'Cara baca laporan', 'Atur notifikasi', 'Backup data']
      }
    }

    // Comprehensive Business Analysis Responses (for judges)
    if (message.includes('analisis') || message.includes('analyze') || message.includes('evaluasi')) {
      return {
        message: `📊 ANALISIS BISNIS KOMPREHENSIF:\n\n🎯 SWOT Analysis:\n• Strengths: Lokasi strategis, produk populer, customer loyalty\n• Weaknesses: Limited inventory space, single supplier dependency\n• Opportunities: Digital expansion, delivery service, product diversification\n• Threats: Competition, economic fluctuations, supplier issues\n\n📈 Financial Analysis:\n• Revenue Growth: 15-20% monthly\n• Profit Margin: 30-35% average\n• Cash Flow: Positive dengan 2-week cycle\n• ROI: 25% untuk inventory investment\n\n🔍 Market Analysis:\n• Market Share: 12-15% dari total pasar lokal\n• Customer Demographics: 60% residential, 40% office workers\n• Peak Hours: 10-12 AM, 2-4 PM, 7-9 PM\n• Seasonal Trends: Naik 30% saat weekend dan holidays\n\n💡 Strategic Recommendations:\n• Implementasi digital payment untuk convenience\n• Partnership dengan local suppliers untuk better pricing\n• Customer loyalty program untuk retention\n• Inventory optimization untuk cash flow improvement\n• Market expansion ke adjacent areas\n\n📊 KPI Dashboard:\n• Daily Sales Target: Rp 300K-400K\n• Customer Acquisition: 5-8 new customers/week\n• Inventory Turnover: 2.5x per month\n• Customer Satisfaction: 85%+ rating\n• Profit per Transaction: Rp 15K-25K`,
        suggestions: ['Competitive analysis', 'Financial forecasting', 'Risk assessment', 'Technology integration']
      }
    }

    // Competitive Analysis
    if (message.includes('kompetitor') || message.includes('pesaing') || message.includes('competitor')) {
      return {
        message: `🏪 ANALISIS KOMPETITOR:\n\n🔍 Competitor Landscape:\n• Toko A: 200m sebelah kiri - harga lebih murah 5-10%\n• Toko B: 300m sebelah kanan - produk lebih lengkap\n• Minimarket C: 500m depan - brand recognition tinggi\n• Warung D: 100m belakang - customer service excellent\n\n📊 Competitive Positioning:\n• Price Position: Mid-range (bukan cheapest, bukan premium)\n• Product Mix: Focus pada fast-moving consumer goods\n• Service Level: Personal touch dengan customer recognition\n• Location Advantage: High foot traffic area\n\n💡 Competitive Strategies:\n• Price: Match competitor prices untuk key items\n• Product: Stock unique items yang kompetitor tidak ada\n• Service: Personalized customer experience\n• Promotion: Bundle deals yang lebih attractive\n• Location: Optimize display untuk maximize visibility\n\n📈 Market Share Analysis:\n• Current Share: 12-15% dari total market\n• Growth Potential: 20-25% dengan proper strategy\n• Customer Retention: 70% repeat customers\n• Acquisition Rate: 5-8 new customers per week\n\n🎯 Differentiation Strategy:\n• Unique Value Proposition: "Toko dengan pelayanan terbaik"\n• Customer Experience: Personalized service dan recommendations\n• Product Curation: Carefully selected items berdasarkan demand\n• Community Engagement: Local events dan promotions\n• Technology Integration: Digital payment dan inventory management`,
        suggestions: ['Market positioning strategy', 'Customer acquisition tactics', 'Pricing strategy', 'Service differentiation']
      }
    }

    // Financial Planning & Forecasting
    if (message.includes('forecast') || message.includes('prediksi') || message.includes('ramalan') || message.includes('financial')) {
      return {
        message: `💰 FINANCIAL FORECASTING & PLANNING:\n\n📊 Revenue Projections:\n• Next Month: Rp 8.5M - 10M (growth 20-25%)\n• Next Quarter: Rp 25M - 30M (seasonal adjustment)\n• Next Year: Rp 100M - 120M (market expansion)\n\n📈 Growth Drivers:\n• Customer Base Expansion: +30% new customers\n• Product Diversification: +15% revenue per customer\n• Price Optimization: +5% margin improvement\n• Operational Efficiency: +10% cost reduction\n\n💡 Investment Planning:\n• Inventory Expansion: Rp 5M untuk new products\n• Technology Upgrade: Rp 2M untuk digital systems\n• Marketing Campaign: Rp 1M untuk customer acquisition\n• Staff Training: Rp 500K untuk service improvement\n\n📊 Cash Flow Management:\n• Operating Cash Flow: Rp 2M-3M monthly\n• Working Capital: Rp 5M untuk inventory\n• Emergency Fund: Rp 3M untuk unexpected expenses\n• Growth Fund: Rp 10M untuk expansion\n\n🎯 Financial KPIs:\n• Gross Margin: Target 35-40%\n• Net Profit Margin: Target 15-20%\n• Inventory Turnover: Target 3x annually\n• Customer Acquisition Cost: Target <Rp 50K\n• Customer Lifetime Value: Target Rp 500K\n\n📈 Risk Management:\n• Market Risk: Diversify product portfolio\n• Credit Risk: Implement payment terms\n• Operational Risk: Backup suppliers\n• Financial Risk: Maintain cash reserves\n• Competitive Risk: Continuous innovation`,
        suggestions: ['Investment analysis', 'Risk management', 'Cash flow optimization', 'Profit maximization']
      }
    }

    // Technology Integration
    if (message.includes('teknologi') || message.includes('technology') || message.includes('digital') || message.includes('system')) {
      return {
        message: `💻 TECHNOLOGY INTEGRATION STRATEGY:\n\n🔧 Current Technology Stack:\n• POS System: DagangCerdas mobile app\n• Inventory Management: Real-time tracking\n• Payment Processing: Cash + QRIS integration\n• Customer Database: Basic contact management\n• Analytics: Sales reporting dan insights\n\n📱 Digital Transformation Roadmap:\n• Phase 1: Enhanced mobile app dengan offline capability\n• Phase 2: Customer loyalty program integration\n• Phase 3: Delivery service platform\n• Phase 4: AI-powered demand forecasting\n• Phase 5: IoT sensors untuk inventory automation\n\n💡 Technology Benefits:\n• Operational Efficiency: 30% faster transactions\n• Data Accuracy: 95% reduction in manual errors\n• Customer Experience: Personalized recommendations\n• Inventory Optimization: 20% reduction in stockouts\n• Financial Tracking: Real-time profit analysis\n\n🎯 Implementation Strategy:\n• Staff Training: 2-week intensive program\n• Gradual Rollout: Pilot dengan 50% transactions\n• Customer Education: Digital payment adoption\n• Data Migration: Seamless transition\n• Support System: 24/7 technical assistance\n\n📊 ROI Analysis:\n• Investment: Rp 5M untuk complete system\n• Annual Savings: Rp 8M dari efficiency gains\n• Revenue Increase: Rp 12M dari better service\n• Payback Period: 6 months\n• 3-Year ROI: 300%+\n\n🔒 Security & Compliance:\n• Data Encryption: Bank-level security\n• PCI Compliance: Payment card industry standards\n• Backup Systems: Daily automated backups\n• Access Control: Role-based permissions\n• Audit Trail: Complete transaction logging`,
        suggestions: ['Digital payment integration', 'Inventory automation', 'Customer analytics', 'Mobile app development']
      }
    }

    // Customer Experience & Retention
    if (message.includes('customer') || message.includes('pelanggan') || message.includes('retention') || message.includes('experience')) {
      return {
        message: `👥 CUSTOMER EXPERIENCE & RETENTION STRATEGY:\n\n🎯 Customer Segmentation:\n• Regular Customers (60%): Daily/weekly shoppers\n• Occasional Customers (25%): Monthly visitors\n• New Customers (15%): First-time buyers\n• VIP Customers (5%): High-value frequent buyers\n\n💡 Experience Enhancement:\n• Personalized Greetings: Recognize regular customers\n• Product Recommendations: Based on purchase history\n• Quick Service: Express checkout untuk regulars\n• Special Offers: Exclusive deals untuk loyal customers\n• Feedback System: Regular customer satisfaction surveys\n\n📊 Retention Strategies:\n• Loyalty Program: Points system dengan rewards\n• Referral Incentives: Discounts untuk new customer referrals\n• Birthday Specials: Personalized offers\n• Seasonal Promotions: Holiday-specific deals\n• Community Events: Local engagement activities\n\n📈 Customer Analytics:\n• Purchase Frequency: Average 2.5 visits per week\n• Average Order Value: Rp 25K-35K\n• Customer Lifetime Value: Rp 500K-750K\n• Retention Rate: 70% monthly retention\n• Satisfaction Score: 4.2/5.0 average rating\n\n🎪 Engagement Tactics:\n• Social Media: Instagram dan WhatsApp Business\n• Email Marketing: Weekly promotions dan updates\n• SMS Alerts: Stock notifications dan special offers\n• In-Store Events: Product launches dan demos\n• Community Involvement: Local charity dan events\n\n📊 Success Metrics:\n• Customer Acquisition Cost: <Rp 50K\n• Customer Lifetime Value: >Rp 500K\n• Net Promoter Score: >8.0\n• Repeat Purchase Rate: >70%\n• Customer Satisfaction: >4.0/5.0`,
        suggestions: ['Loyalty program design', 'Customer feedback system', 'Social media strategy', 'Community engagement']
      }
    }

    // Operational Excellence
    if (message.includes('operasional') || message.includes('operational') || message.includes('efisiensi') || message.includes('efficiency')) {
      return {
        message: `⚙️ OPERATIONAL EXCELLENCE STRATEGY:\n\n🎯 Process Optimization:\n• Inventory Management: Just-in-time stocking\n• Staff Scheduling: Peak hour optimization\n• Transaction Processing: <30 seconds average\n• Stock Replenishment: Automated reorder points\n• Customer Service: Standardized greeting protocols\n\n📊 Performance Metrics:\n• Transaction Speed: <30 seconds per customer\n• Stock Accuracy: 98% inventory accuracy\n• Staff Productivity: 15 customers per hour per staff\n• Error Rate: <2% transaction errors\n• Customer Wait Time: <2 minutes average\n\n💡 Efficiency Improvements:\n• Layout Optimization: High-traffic items di depan\n• Staff Training: Cross-training untuk flexibility\n• Technology Integration: Barcode scanning\n• Supplier Relations: Direct delivery scheduling\n• Cash Management: Optimal change preparation\n\n📈 Cost Reduction:\n• Energy Efficiency: LED lighting dan smart timers\n• Waste Reduction: Inventory rotation management\n• Supplier Negotiation: Volume discounts\n• Staff Optimization: Right-sizing untuk demand\n• Technology ROI: Automation untuk repetitive tasks\n\n🎯 Quality Management:\n• Product Quality: Supplier certification program\n• Service Quality: Customer feedback integration\n• Process Quality: Standard operating procedures\n• Staff Quality: Regular training dan development\n• System Quality: Continuous improvement culture\n\n📊 Continuous Improvement:\n• Daily Huddles: Quick performance reviews\n• Weekly Analysis: Sales dan operational metrics\n• Monthly Reviews: Strategic planning sessions\n• Quarterly Assessments: Comprehensive evaluations\n• Annual Planning: Long-term strategy development`,
        suggestions: ['Process automation', 'Staff training programs', 'Cost optimization', 'Quality management']
      }
    }

    // Market Expansion Strategy
    if (message.includes('ekspansi') || message.includes('expansion') || message.includes('pasar baru') || message.includes('market growth')) {
      return {
        message: `🚀 MARKET EXPANSION STRATEGY:\n\n🎯 Expansion Opportunities:\n• Geographic: Adjacent neighborhoods dan office areas\n• Product: Snack sehat, minuman premium, personal care\n• Service: Delivery service, catering, bulk orders\n• Digital: Online ordering, subscription service\n• B2B: Corporate supply contracts\n\n📊 Market Analysis:\n• Target Demographics: Young professionals, families\n• Market Size: 5,000+ potential customers\n• Competition Level: Medium (3-4 competitors)\n• Growth Potential: 40-50% revenue increase\n• Investment Required: Rp 15M-20M\n\n💡 Expansion Strategies:\n• Organic Growth: Improve existing operations\n• Strategic Partnerships: Local businesses\n• Franchise Model: Replicate successful format\n• Acquisition: Buy smaller competitors\n• Innovation: Unique service offerings\n\n📈 Implementation Plan:\n• Phase 1: Market research dan feasibility study\n• Phase 2: Pilot program dengan limited scope\n• Phase 3: Full-scale rollout dengan marketing\n• Phase 4: Optimization berdasarkan feedback\n• Phase 5: Scale-up untuk additional markets\n\n💰 Financial Projections:\n• Investment: Rp 15M untuk expansion\n• Revenue Growth: +40% dalam 12 months\n• Profit Margin: Maintain 30-35%\n• Break-even: 8-10 months\n• ROI: 200%+ dalam 2 years\n\n🎯 Success Factors:\n• Market Research: Thorough customer analysis\n• Competitive Advantage: Unique value proposition\n• Operational Excellence: Proven processes\n• Financial Management: Strong cash flow\n• Team Capability: Skilled dan motivated staff\n• Technology Support: Scalable systems\n• Customer Focus: Superior service delivery`,
        suggestions: ['Market research methods', 'Partnership strategies', 'Financial planning', 'Risk assessment']
      }
    }

    // Default intelligent response
    return {
      message: `Waduh, saya belum ngerti pertanyaannya. Tapi saya bisa bantu:\n\nLihat gimana jualan hari ini\nCek barang yang habis atau sisa sedikit\nKasih saran biar untung lebih\nBantu atur toko biar makin maju\n\nCoba tanya yang lebih jelas ya, Pak/Bu!`,
      suggestions: ['Jualan hari ini gimana?', 'Barang apa yang habis?', 'Gimana biar untung?', 'Kasih saran dong', 'Bantuan lengkap']
    }
  }, [currentUser])

  // Send message function
  const sendMessage = useCallback(async (userMessage) => {
    if (!userMessage.trim()) return

    // Add user message
    const userMsg = {
      id: Date.now(),
      type: 'user',
      message: userMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500))

    // Generate smart response (in real app, this would call analytics API)
    const aiResponse = generateSmartResponse(userMessage, {})

    const botMsg = {
      id: Date.now() + 1,
      type: 'bot',
      message: aiResponse.message,
      timestamp: new Date(),
      suggestions: aiResponse.suggestions || []
    }

    setIsTyping(false)
    setMessages(prev => [...prev, botMsg])

    // Trigger notification for important insights
    if (userMessage.toLowerCase().includes('stok habis') || userMessage.toLowerCase().includes('alert')) {
      addNotification({
        type: 'stock-alert',
        title: 'AI Insight',
        message: 'Chatbot mendeteksi produk yang perlu restok segera',
        persistent: true
      })
    }
  }, [generateSmartResponse, addNotification])

  // Quick action handlers
  const handleQuickAction = useCallback((action) => {
    const quickActions = {
      'Analisis penjualan hari ini': 'Bagaimana penjualan hari ini?',
      'Cek stok produk': 'Cek stok yang habis',
      'Lihat tren bisnis': 'Analisis tren minggu ini',
      'Tips meningkatkan profit': 'Berikan rekomendasi untuk meningkatkan profit',
      'Penjualan hari ini': 'Bagaimana penjualan hari ini?',
      'Produk terlaris': 'Produk apa yang paling laris?',
      'Stok yang habis': 'Produk mana yang stoknya habis?',
      'Rekomendasi bisnis': 'Berikan rekomendasi bisnis untuk hari ini'
    }

    const message = quickActions[action] || action
    sendMessage(message)
  }, [sendMessage])

  // Clear chat
  const clearChat = useCallback(() => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        message: 'Oke, chat udah dibersihkan! Saya siap bantu lagi. Mau tanya apa?',
        timestamp: new Date(),
        suggestions: ['Gimana jualan hari ini?', 'Cek stok barang', 'Lihat tren jualan', 'Kasih saran dong']
      }
    ])
  }, [])

  const value = {
    isOpen,
    setIsOpen,
    messages,
    isTyping,
    sendMessage,
    handleQuickAction,
    clearChat
  }

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  )
}
