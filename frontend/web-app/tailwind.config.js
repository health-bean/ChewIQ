/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../shared/components/**/*.{js,ts,jsx,tsx}", // More specific path to avoid node_modules
    "../shared/utils/**/*.{js,ts,jsx,tsx}",     // More specific path to avoid node_modules
  ],
  theme: {
    extend: {
      colors: {
        // FILO Primary - Brand Teal
        primary: {
          50: '#f0f9f7',
          100: '#d1f2eb',
          200: '#a3e4d7',
          300: '#76d7c4',
          400: '#48c9b0',
          500: '#1abc9c',
          600: '#17a085',
          700: '#148f77',
          800: '#117a65',
          900: '#0e6b5d',
        },
        
        // FILO Accent - Terracotta
        accent: {
          50: '#fdf6f0',
          100: '#fae5d3',
          200: '#f4c2a1',
          300: '#ee9f6f',
          400: '#e67e22',
          500: '#d35400',
          600: '#ba4a00',
          700: '#a04000',
          800: '#873600',
          900: '#6d2c00',
        },
        
        // FILO Neutral - Warm Cream/Gray
        neutral: {
          50: '#fdfcfa',
          100: '#f8f6f0',
          200: '#f0ede4',
          300: '#e8e3d8',
          400: '#d4cfc0',
          500: '#a8a196',
          600: '#8b8680',
          700: '#6f6b64',
          800: '#524f48',
          900: '#36342c',
        },
        
        // Chronic illness-friendly semantic colors
        sage: {
          50: '#f6f9f6',
          100: '#e8f2e8',
          200: '#c8e0c8',
          300: '#a8cea8',
          400: '#7fb87f',
          500: '#5a9b5a',
          600: '#4a8a4a',
          700: '#3a7a3a',
          800: '#2a5a2a',
          900: '#1a3a1a',
        },
        
        coral: {
          50: '#fdf6f4',
          100: '#fae8e2',
          200: '#f2c5b8',
          300: '#eaa28e',
          400: '#de7f64',
          500: '#d25c3a',
          600: '#b84a2a',
          700: '#9e381a',
          800: '#84260a',
          900: '#6a1400',
        },
        
        amber: {
          50: '#fdf9f0',
          100: '#faf0d9',
          200: '#f2deb3',
          300: '#eacc8d',
          400: '#deb667',
          500: '#d2a041',
          600: '#b88a31',
          700: '#9e7421',
          800: '#845e11',
          900: '#6a4801',
        },
        
        lavender: {
          50: '#f8f6fd',
          100: '#ede8fa',
          200: '#d4c5f2',
          300: '#bba2ea',
          400: '#9f7fde',
          500: '#835cd2',
          600: '#6f4ab8',
          700: '#5b389e',
          800: '#472684',
          900: '#33146a',
        },
        
        // Legacy mappings for backward compatibility
        secondary: {
          50: '#f6f9f6',
          100: '#e8f2e8',
          200: '#c8e0c8',
          300: '#a8cea8',
          400: '#7fb87f',
          500: '#5a9b5a',
          600: '#4a8a4a',
          700: '#3a7a3a',
          800: '#2a5a2a',
          900: '#1a3a1a',
        },
        
        error: {
          50: '#fdf6f4',
          100: '#fae8e2',
          200: '#f2c5b8',
          300: '#eaa28e',
          400: '#de7f64',
          500: '#d25c3a',
          600: '#b84a2a',
          700: '#9e381a',
          800: '#84260a',
          900: '#6a1400',
        },
        
        warning: {
          50: '#fdf9f0',
          100: '#faf0d9',
          200: '#f2deb3',
          300: '#eacc8d',
          400: '#deb667',
          500: '#d2a041',
          600: '#b88a31',
          700: '#9e7421',
          800: '#845e11',
          900: '#6a4801',
        },
        
        success: {
          50: '#f6f9f6',
          100: '#e8f2e8',
          200: '#c8e0c8',
          300: '#a8cea8',
          400: '#7fb87f',
          500: '#5a9b5a',
          600: '#4a8a4a',
          700: '#3a7a3a',
          800: '#2a5a2a',
          900: '#1a3a1a',
        },
        
        // Semantic Colors
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      
      // Chronic illness accessibility spacing
      spacing: {
        '11': '2.75rem', // 44px - minimum touch target
      },
      
      // Enhanced line heights for readability
      lineHeight: {
        'relaxed': '1.75',
      },
      
      // Animation durations for gentle transitions
      transitionDuration: {
        '250': '250ms',
        '300': '300ms',
      },
    },
  },
  plugins: [],
}
