module.exports = {
  purge: ['./pages/**/*.js', './components/**/*.js'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      backgroundColor: {
        surface: 'var(--color-background)'
      },
      colors: {
        primary: 'var(--color-primary)',
        'primary-variant': 'var(--color-primary-variant)',
        secondary: 'var(--color-secondary)'
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
