/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
      colors: {
        forest: { DEFAULT: '#0f4c2a', mid: '#166534', lt: '#15803d' },
        emerald: { DEFAULT: '#10b981', lt: '#34d399' },
        cream:   { DEFAULT: '#fafaf7', dk: '#f3f3ef' },
        ink: '#0f1f14',
        muted: '#6b7280',
      },
      boxShadow: {
        card: '0 2px 12px rgba(15,76,42,0.08)',
        'card-hover': '0 12px 32px rgba(15,76,42,0.14)',
      },
    },
  },
  plugins: [],
};
