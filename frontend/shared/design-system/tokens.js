// Health Platform Design System - Design Tokens
// Centralized design values for consistent UI

// FILO Brand Colors - Optimized for chronic illness users
export const filoColors = {
  // Primary brand teal from FILO design
  primary: {
    50: '#f0f9f7',   // Very light teal
    100: '#d1f2eb',  // Light teal
    200: '#a3e4d7',  // Soft teal
    300: '#76d7c4',  // Medium teal
    400: '#48c9b0',  // FILO brand teal
    500: '#1abc9c',  // Core teal
    600: '#17a085',  // Darker teal
    700: '#148f77',  // Deep teal
    800: '#117a65',  // Very deep teal
    900: '#0e6b5d'   // Darkest teal
  },
  
  // Warm terracotta accent from FILO design
  accent: {
    50: '#fdf6f0',   // Very light terracotta
    100: '#fae5d3',  // Light terracotta
    200: '#f4c2a1',  // Soft terracotta
    300: '#ee9f6f',  // Medium terracotta
    400: '#e67e22',  // FILO brand terracotta
    500: '#d35400',  // Core terracotta
    600: '#ba4a00',  // Darker terracotta
    700: '#a04000',  // Deep terracotta
    800: '#873600',  // Very deep terracotta
    900: '#6d2c00'   // Darkest terracotta
  },
  
  // Warm cream background from FILO design
  neutral: {
    50: '#fdfcfa',   // FILO cream background
    100: '#f8f6f0',  // Slightly darker cream
    200: '#f0ede4',  // Light warm gray
    300: '#e8e3d8',  // Medium warm gray
    400: '#d4cfc0',  // Darker warm gray
    500: '#a8a196',  // Medium gray
    600: '#8b8680',  // Dark gray
    700: '#6f6b64',  // Darker gray
    800: '#524f48',  // Very dark gray
    900: '#36342c'   // Darkest gray
  }
};

// Chronic illness-friendly extended colors
export const extendedColors = {
  // Sage green - for success/allowed states
  sage: {
    50: '#f6f9f6',
    100: '#e8f2e8', 
    200: '#c8e0c8',
    300: '#a8cea8',
    400: '#7fb87f',
    500: '#5a9b5a',  // Core sage
    600: '#4a8a4a',
    700: '#3a7a3a',
    800: '#2a5a2a',
    900: '#1a3a1a'
  },
  
  // Coral - for error/avoid states  
  coral: {
    50: '#fdf6f4',
    100: '#fae8e2',
    200: '#f2c5b8',
    300: '#eaa28e',
    400: '#de7f64',
    500: '#d25c3a',  // Core coral
    600: '#b84a2a',
    700: '#9e381a',
    800: '#84260a',
    900: '#6a1400'
  },
  
  // Amber - for warning/caution states
  amber: {
    50: '#fdf9f0',
    100: '#faf0d9',
    200: '#f2deb3',
    300: '#eacc8d',
    400: '#deb667',
    500: '#d2a041',  // Core amber
    600: '#b88a31',
    700: '#9e7421',
    800: '#845e11',
    900: '#6a4801'
  },
  
  // Lavender - for medications
  lavender: {
    50: '#f8f6fd',
    100: '#ede8fa',
    200: '#d4c5f2',
    300: '#bba2ea',
    400: '#9f7fde',
    500: '#835cd2',  // Core lavender
    600: '#6f4ab8',
    700: '#5b389e',
    800: '#472684',
    900: '#33146a'
  }
};

export const designTokens = {
  // FILO Color Palette - Chronic illness optimized
  colors: {
    // Core FILO brand colors
    primary: filoColors.primary,
    accent: filoColors.accent,
    neutral: filoColors.neutral,
    
    // Extended chronic illness-friendly colors
    sage: extendedColors.sage,
    coral: extendedColors.coral,
    amber: extendedColors.amber,
    lavender: extendedColors.lavender,
    
    // Legacy mappings for backward compatibility
    secondary: extendedColors.sage,  // Map to sage green
    error: extendedColors.coral,     // Map to coral
    warning: extendedColors.amber,   // Map to amber
    success: extendedColors.sage,    // Map to sage green
    
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
    
    // Neutrals - Clean & Professional
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    
    // Special Health Colors
    health: {
      symptom: '#ef4444',    // Red for symptoms
      improvement: '#22c55e', // Green for improvements
      neutral: '#6b7280',     // Gray for neutral
      medication: '#8b5cf6',  // Purple for medications
      supplement: '#06b6d4',  // Cyan for supplements
      food: '#f59e0b',        // Amber for foods
    }
  },
  
  // Typography optimized for readability and chronic illness
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'], // High readability
      mono: ['JetBrains Mono', 'monospace']
    },
    
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1.25rem' }],  // Increased line height
      sm: ['0.875rem', { lineHeight: '1.5rem' }],  // Increased line height
      base: ['1rem', { lineHeight: '1.5rem' }],    // Standard readable line height
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    
    lineHeight: {
      tight: '1.25',    // For headings
      normal: '1.5',    // For body text - easier to read
      relaxed: '1.75'   // For long-form content
    },
    
    contrast: {
      minimum: '4.5:1', // WCAG AA compliance
      enhanced: '7:1'   // WCAG AAA for better accessibility
    }
  },
  
  // Spacing Scale - 8px base
  spacing: {
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem',    // 96px
  },
  
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px',
  },
  
  // Shadows - Subtle & Professional
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  // Chronic illness-friendly semantic mappings
  semantic: {
    status: {
      info: 'primary',      // FILO teal
      success: 'sage',      // Soft sage green
      warning: 'amber',     // Warm amber
      error: 'coral'        // Muted coral
    },
    health: {
      symptom: 'coral',     // Gentle coral instead of harsh red
      improvement: 'sage',  // Soft sage instead of bright green
      medication: 'lavender', // Calming lavender
      supplement: 'primary', // FILO brand teal
      food: 'accent',       // FILO terracotta
      neutral: 'neutral'    // Warm cream/gray
    },
    protocol: {
      allowed: 'sage',      // Soft green = safe to eat
      avoid: 'coral',       // Muted coral = avoid for now
      reintroduction: 'amber', // Warm amber = try carefully
      unknown: 'neutral'    // Neutral = not specified
    }
  },

  // Layout patterns optimized for chronic illness users
  layout: {
    spacing: {
      section: '1.5rem',    // 24px - generous spacing reduces cognitive load
      card: '1rem',         // 16px - comfortable card spacing
      form: '0.75rem',      // 12px - form field spacing
      tight: '0.5rem'       // 8px - minimal spacing
    },
    containers: {
      maxWidth: '28rem',    // 448px - mobile-first, easy to scan
      padding: '1rem',      // 16px - comfortable touch targets
      margin: '0 auto',     // Centered content
      background: 'neutral-50' // FILO cream background
    },
    accessibility: {
      minTouchTarget: '44px',  // Minimum touch target for motor difficulties
      focusRingWidth: '2px',   // Visible focus indicators
      animationDuration: '200ms' // Gentle transitions, not jarring
    }
  },

  // Component-Specific Tokens - Enhanced for accessibility
  components: {
    button: {
      height: {
        sm: '2.75rem',   // 44px minimum for accessibility
        md: '2.75rem',   // 44px minimum for accessibility
        lg: '3rem',      // 48px
      },
      padding: {
        sm: '0.5rem 0.75rem',
        md: '0.625rem 1rem',
        lg: '0.75rem 1.5rem',
      },
      minTouchTarget: '44px', // Chronic illness accessibility
    },
    
    input: {
      height: {
        sm: '2.75rem',   // 44px minimum for accessibility
        md: '2.75rem',   // 44px minimum for accessibility
        lg: '3rem',      // 48px
      },
      padding: '0.625rem 0.75rem',
      minTouchTarget: '44px',
    },
    
    card: {
      padding: '1.5rem',
      borderRadius: '0.5rem',
      shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      background: 'neutral-50', // FILO cream background
    },
  },
  
  // Animation & Transitions
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
    },
    
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    },
  },
  
  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
  
  // Z-Index Scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },
};
