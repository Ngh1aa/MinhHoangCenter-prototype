/** Minh Hoàng Center · Tailwind config
 *  Brand palette from Design Guide (MHC-A-7). Font: Google Sans Flex.
 */
module.exports = {
  content: ['./*.dc.html', './**/*.html'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue:   '#253a7e',
          orange: '#ea4c2d',
          yellow: '#f4e743',
        },
        ink:     '#17181c',
        muted:   '#6b6f7b',
        surface: '#f4f5f9',
        line:    '#e6e8ef',
        soft: {
          blue:   '#eef1f9',
          orange: '#fdede9',
          yellow: '#fdfae3',
          green:  '#e6f4ec',
        },
        success: '#1f8a4c',
        // Chart palette, validated (CVD ΔE ≥ 11, contrast ≥ 3:1 on white)
        chart: {
          1: '#3a56b0',
          2: '#e0532f',
          3: '#2a9d8f',
        },
      },
      fontFamily: {
        sans: ['"Google Sans Flex"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '28px',
      },
      boxShadow: {
        nav: '0 10px 30px rgba(23, 24, 28, 0.18)',
      },
    },
  },
  plugins: [],
};
