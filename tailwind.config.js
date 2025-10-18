/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Warm & Emotional Color Palette for Ultra-Micro Entrepreneurs
        primary: {
          DEFAULT: '#FF6B35',    // Warm Orange - Energy & Positivity
          light: '#FF8A65',      // Lighter Orange - Gentle & Approachable
          dark: '#E55A2B'       // Darker Orange - Trust & Reliability
        },
        secondary: {
          DEFAULT: '#227337',    // Fresh Green - Growth & Success
          light: '#58D68D',      // Light Green - Optimism
          dark: '#27AE60'       // Dark Green - Stability
        },
        accent: {
          DEFAULT: '#F39C12',    // Golden Yellow - Warmth & Prosperity
          light: '#F7DC6F',      // Light Yellow - Cheerfulness
          dark: '#D68910'       // Dark Yellow - Wisdom
        },
        success: '#227337',      // Success Green
        warning: '#F39C12',      // Warm Warning
        error: '#E74C3C',        // Soft Red - Not Harsh
        info: '#3498DB',         // Friendly Blue
        
        // Background Colors - Warm & Comfortable
        background: {
          DEFAULT: '#FEF9F7',    // Warm Cream - Cozy & Inviting
          secondary: '#F8F4F0'  // Soft Beige - Gentle
        },
        surface: {
          DEFAULT: '#FFFFFF',    // Pure White - Clean & Trustworthy
          warm: '#FFF8F5'       // Warm White - Soft & Welcoming
        },
        
        // Text Colors - Readable & Friendly
        'text-primary': '#2C3E50',    // Deep Blue-Gray - Professional but Warm
        'text-secondary': '#7F8C8D',  // Soft Gray - Gentle & Non-intimidating
        'text-muted': '#BDC3C7',      // Light Gray - Subtle
        'text-accent': '#E67E22',     // Warm Orange - Highlights
        
        // Border & Divider Colors - Soft & Welcoming
        border: {
          DEFAULT: '#F4E4D6',    // Warm Beige - Soft Dividers
          light: '#F9F1E8',      // Very Light Beige - Subtle
          dark: '#E8D5C4'       // Darker Beige - Definition
        },
        
        // Shadow Colors - Warm & Soft
        shadow: {
          DEFAULT: 'rgba(255, 107, 53, 0.1)',    // Warm Orange Shadow
          light: 'rgba(255, 107, 53, 0.05)',     // Very Light Shadow
          dark: 'rgba(255, 107, 53, 0.2)'       // Deeper Shadow
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
