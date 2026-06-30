import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D4AF37', // Elegant Metallic Gold
          50:  '#FDFBF7',
          100: '#FBF4DB',
          200: '#F5E6B3',
          300: '#EED380',
          400: '#E6C054',
          500: '#D4AF37',
          600: '#B08E27',
          700: '#8E701C',
          800: '#6C5312',
          900: '#403006',
        },
        secondary: {
          DEFAULT: '#0F5257', // Premium Deep Emerald
          50:  '#F4F8F8',
          100: '#E1EDEE',
          200: '#B7D3D5',
          300: '#8EB8BC',
          400: '#649CA2',
          500: '#0F5257',
        },
        accent: {
          DEFAULT: '#B38F00', // Rich Dark Bronze
          50:  '#FFFEEB',
          100: '#FFFBC2',
          200: '#FFF57A',
          300: '#FFED3D',
          400: '#E6D000',
          500: '#B38F00',
          600: '#997A00',
          700: '#7E6400',
        },
        background: '#FCF9F2', // Warm Champagne Cream
        foreground: '#1E1E1E', // Charcoal Dark Text
        muted: '#7A7A7A',
        border: '#E8DFCC',
      },
      fontFamily: {
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Poppins', 'system-ui', 'sans-serif'],
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '3rem',
      },
      boxShadow: {
        luxury: '0 4px 24px rgba(212, 175, 55, 0.1)',
        'luxury-lg': '0 8px 48px rgba(212, 175, 55, 0.15)',
        'luxury-xl': '0 16px 64px rgba(212, 175, 55, 0.18)',
        glow: '0 0 20px rgba(212, 175, 55, 0.3)',
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.4)',
        glass: '0 4px 30px rgba(212, 175, 55, 0.05)',
        card: '0 2px 16px rgba(30, 30, 30, 0.05)',
        'card-hover': '0 8px 32px rgba(212, 175, 55, 0.1)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #D4AF37 0%, #B08E27 100%)',
        'gradient-soft': 'linear-gradient(135deg, #FDFBF7 0%, #FCF9F2 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #B38F00 100%)',
        'gradient-hero': 'linear-gradient(135deg, rgba(30,30,30,0.85) 0%, rgba(15,82,87,0.8) 50%, rgba(30,30,30,0.9) 100%)',
        'gradient-card': 'linear-gradient(145deg, #FFFFFF 0%, #FCF9F2 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0A1C1D 0%, #152E30 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.7s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.7s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.7s ease-out forwards',
        'slide-in-right': 'slideInRight 0.7s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 5s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'scale-in': 'scaleIn 0.5s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212,175,55,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(212,175,55,0.4)' },
        },
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
