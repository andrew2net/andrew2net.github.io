/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./js/*.js"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0B0C",
        panel: "#141416",
        line: "#26262A",
        line2: "#3A3A40",
        paper: "#F2F2EE",
        soft: "#C9C9CC",
        muted: "#A1A1A6",
        dim: "#55555C",
        lime: "#C8F031",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
}
