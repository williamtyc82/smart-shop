/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#FF7E5F",
                "primary-content": "#ffffff",
                "background-light": "#FFFDF9",
                "background-dark": "#1a1715",
                "card-light": "#ffffff",
                "card-dark": "#25211e",
                "text-main": "#2D3436",
                "text-muted": "#636E72",
                "pastel-peach": "#FFF0E8",
                "pastel-blue": "#E8F4FD",
                "pastel-green": "#EAF9E7",
                "pastel-purple": "#F3E8FF",
            },
            fontFamily: {
                "display": ["Plus Jakarta Sans", "sans-serif"],
                "body": ["Plus Jakarta Sans", "sans-serif"],
            },
            borderRadius: {
                "DEFAULT": "0.75rem",
                "lg": "1rem",
                "xl": "1.25rem",
                "2xl": "2rem",
                "3xl": "2.5rem",
                "full": "9999px"
            },
            boxShadow: {
                'soft': '0 10px 30px -5px rgba(255, 126, 95, 0.15)',
                'card': '0 4px 12px rgba(0, 0, 0, 0.03)',
            }
        },
    },
    plugins: [
        require('@tailwindcss/container-queries')
    ],
}
