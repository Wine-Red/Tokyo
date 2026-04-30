/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'SimHei', 'sans-serif'],
        orbitron: ['Orbitron', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'SimHei', 'sans-serif'],
      },
      colors: {
        'brand-orange': '#FF9E0F',
      },
    },
  },
  plugins: [],
}
