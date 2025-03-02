/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {}
  },
  plugins: [],
  future: {
    // 启用 v3 兼容模式，让旧的类名也能工作
    // enableLegacyUtilityAliases: true,
  }
};
