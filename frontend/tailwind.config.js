
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        brand: {
          teal:  "#2DD4BF",
          navy:  "#0F172A",
          slate: "#1E293B",
        },
      },
    },
  },
  plugins: [],
};