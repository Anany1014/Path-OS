/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                // Neon indicator palette for map overlays
                neon: {
                    emerald: "#10F5A0",
                    amber: "#FFBA08",
                    red: "#FF3B3B",
                    orange: "#FF6B1A",
                },
                glass: {
                    dark: "rgba(15, 23, 42, 0.6)",
                    border: "rgba(255, 255, 255, 0.12)",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            backdropBlur: {
                xs: "2px",
            },
            animation: {
                "ticker-scroll": "tickerScroll 40s linear infinite",
                "pulse-neon": "pulseNeon 2s ease-in-out infinite",
                "fade-in": "fadeIn 0.3s ease-out",
                "slide-in": "slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                "compass-spin": "compassSpin 2s linear",
            },
            keyframes: {
                tickerScroll: {
                    "0%": { transform: "translateX(100%)" },
                    "100%": { transform: "translateX(-100%)" },
                },
                pulseNeon: {
                    "0%, 100%": { opacity: "1", boxShadow: "0 0 8px #FF3B3B" },
                    "50%": { opacity: "0.6", boxShadow: "0 0 20px #FF3B3B, 0 0 40px #FF3B3B" },
                },
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideIn: {
                    "0%": { transform: "translateX(30px)", opacity: "0" },
                    "100%": { transform: "translateX(0)", opacity: "1" },
                },
                compassSpin: {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                },
            },
        },
    },
    plugins: [],
};
