/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        foreground: '#0f172a',
        card: '#ffffff',
        'card-foreground': '#0f172a',
        primary: '#2563eb',
        'primary-foreground': '#ffffff',
        muted: '#f1f5f9',
        'muted-foreground': '#64748b',
        border: '#e2e8f0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
