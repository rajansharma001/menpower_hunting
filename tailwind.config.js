/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        admin: {
          bg: '#f8fafc',         // slate-50
          surface: '#ffffff',    // pure white
          border: '#e2e8f0',     // slate-200
          borderDark: '#cbd5e1', // slate-300
          text: '#0f172a',       // slate-900
          muted: '#64748b',      // slate-500
          lightMuted: '#94a3b8', // slate-400
          accent: '#0f766e',     // teal-700 (restrained, dignified corporate tone)
          accentHover: '#115e59',// teal-800
          accentLight: '#f0fdfa',// teal-50
          sidebar: '#0f172a',    // slate-900 dark slate sidebar
          sidebarHover: '#1e293b',
          sidebarActive: '#334155'
        }
      },
      fontSize: {
        '2xs': '0.6875rem',
      }
    },
  },
  plugins: [],
}
