/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        background: '#070913',
        surface: '#0d1322',
        panel: 'rgba(15, 23, 42, 0.75)',
        border: 'rgba(255, 255, 255, 0.08)',
        primary: '#00f0ff',
        'primary-dim': 'rgba(0, 240, 255, 0.15)',
        secondary: '#7c3aed',
        accent: '#f59e0b',
        text: '#f8fafc',
        'text-muted': '#94a3b8',
      },
      boxShadow: {
        'glow-cyan': '0 0 25px rgba(0, 240, 255, 0.25)',
        'glow-violet': '0 0 25px rgba(124, 58, 237, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyber-gradient': 'linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
