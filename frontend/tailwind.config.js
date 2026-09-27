/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F97316', // Vibrant Orange
          dark: '#EA580C',    // Deep Orange
          light: '#FB923C',   // Light Warm Orange
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        brandPink: {
          DEFAULT: '#BE185D', // Dark Pink / Deep Rose
          dark: '#9D174D',    // Deep Pink
          light: '#F43F5E',   // Rose
          50: '#FDF2F8',
          100: '#FCE7F3',
          200: '#FBCFE8',
          300: '#F9A8D4',
          400: '#F472B6',
          500: '#EC4899',
          600: '#DB2777',
          700: '#BE185D',
          800: '#9D174D',
          900: '#831843',
        },
        brandRed: {
          DEFAULT: '#DC2626', // Vibrant Red (alerts, warnings, critical)
          dark: '#B91C1C',
          light: '#EF4444',
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        background: '#FFF7F3', // Soft Warm Background
        surface: '#FFFFFF',    // Crisp Pure White
        charcoal: {
          DEFAULT: '#171717',  // Dark Charcoal
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          500: '#6B7280',
          700: '#374151',
          800: '#1F2937',
          900: '#171717',
        },
        muted: '#6B7280',      // Crisp Muted Slate
        softBorder: '#F3E8E2', // Warm Soft Border
        warning: {
          DEFAULT: '#EA580C',  // Deep Orange
          light: '#FFEDD5',
          dark: '#9A3412',
        },
        danger: {
          DEFAULT: '#DC2626',  // Red
          light: '#FEE2E2',
          dark: '#991B1B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(23, 23, 23, 0.04), 0 1px 2px -1px rgba(23, 23, 23, 0.03)',
        'card': '0 4px 12px -2px rgba(23, 23, 23, 0.06), 0 2px 6px -2px rgba(23, 23, 23, 0.04)',
        'cardHover': '0 10px 25px -3px rgba(249, 115, 22, 0.12), 0 4px 10px -2px rgba(23, 23, 23, 0.04)',
        'elevated': '0 14px 28px -4px rgba(23, 23, 23, 0.09), 0 6px 12px -4px rgba(23, 23, 23, 0.05)',
        'glow': '0 0 25px -4px rgba(249, 115, 22, 0.35)',
        'pinkGlow': '0 0 25px -4px rgba(190, 24, 93, 0.30)',
        'redGlow': '0 0 25px -4px rgba(220, 38, 38, 0.30)',
      },
    },
  },
  plugins: [],
}
