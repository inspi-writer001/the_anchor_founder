/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        grotesk: ['Anton', 'sans-serif'],
        condiment: ['Condiment', 'cursive'],
        barlow: ['Barlow', 'sans-serif'],
        instrument: ['Instrument Serif', 'serif'],
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        'source-serif': ['Source Serif 4', 'serif'],
      },
      colors: {
        anchor: {
          bg: '#14110d',
          surface: '#1d1813',
          surface2: '#28211a',
          panel: '#32281f',
          border: '#49382a',
          wood: '#6f533b',
          brass: '#b88a5a',
          amber: '#d6a06b',
          tan: '#9f7b58',
          paper: '#eadcc2',
          cream: '#f5ecdc',
          text: '#f3ead8',
          soft: '#c8b89d',
          dim: '#8f7f6a',
          glass: '#a9c9bf',
        },
      },
      boxShadow: {
        panel: '0 24px 60px rgba(0, 0, 0, 0.38)',
      },
      backgroundImage: {
        'anchor-overlay':
          'linear-gradient(180deg, rgba(20,17,13,0.18) 0%, rgba(20,17,13,0.82) 100%)',
        'anchor-glow':
          'radial-gradient(circle at top, rgba(214,160,107,0.18), transparent 62%)',
      },
    },
  },
  plugins: [],
};
