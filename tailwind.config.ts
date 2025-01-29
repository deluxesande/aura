import type { Config } from "tailwindcss";
import daisyui from "daisyui";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            clipPath: {
                half: "polygon(0 0, 100% 0, 100% 50%, 0 50%)",
            },
        },
    },
    plugins: [
        daisyui,
        function (utilities: {
            addUtilities: (utilities: Record<string, any>) => void;
        }) {
            const { addUtilities } = utilities;
            addUtilities({
                ".clip-half": {
                    "clip-path": "polygon(0 0, 100% 0, 100% 85%, 0 85%)",
                },
            });
        },
    ],
};
export default config;
