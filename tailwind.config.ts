import type { Config } from 'tailwindcss';

const config: Config = {
  "content": [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  "theme": {
    "extend": {
      "colors": {
        "primary": {
          "50": "#f5f9ff",
          "100": "#ebf3fe",
          "200": "#d8e6fd",
          "300": "#b1cdfb",
          "400": "#89b4fa",
          "500": "#3b82f6",
          "600": "#2f68c5",
          "700": "#234e94",
          "800": "#183462",
          "900": "#0c1a31",
          "950": "#060d19"
        },
        "secondary": {
          "50": "#f3fcf9",
          "100": "#e7f8f2",
          "200": "#cff1e6",
          "300": "#9fe3cd",
          "400": "#70d5b3",
          "500": "#10b981",
          "600": "#0d9467",
          "700": "#0a6f4d",
          "800": "#064a34",
          "900": "#03251a",
          "950": "#02120d"
        },
        "neutral": {
          "50": "#fafafa",
          "100": "#f5f5f5",
          "200": "#e5e5e5",
          "300": "#d4d4d4",
          "400": "#a3a3a3",
          "500": "#737373",
          "600": "#525252",
          "700": "#404040",
          "800": "#262626",
          "900": "#171717",
          "950": "#0a0a0a"
        },
        "semantic": {
          "success": "#12823b",
          "warning": "#ae5f05",
          "error": "#dc2626",
          "info": "#2563eb"
        }
      },
      "fontFamily": {
        "primary": [
          "Inter",
          "sans-serif"
        ],
        "secondary": [
          "system-ui",
          "sans-serif"
        ]
      },
      "fontSize": {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "base": "1rem",
        "lg": "1.125rem",
        "xl": "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem"
      },
      "fontWeight": {
        "thin": 100,
        "extraLight": 200,
        "light": 300,
        "normal": 400,
        "medium": 500,
        "semiBold": 600,
        "bold": 700,
        "extraBold": 800,
        "black": 900
      },
      "lineHeight": {
        "none": 1,
        "tight": 1.25,
        "snug": 1.375,
        "normal": 1.5,
        "relaxed": 1.625,
        "loose": 2
      },
      "spacing": {
        "0": "4px",
        "1": "8px",
        "2": "12px",
        "3": "16px",
        "4": "20px",
        "5": "24px",
        "6": "32px",
        "7": "40px",
        "xs": "4px",
        "sm": "8px",
        "md": "16px",
        "lg": "24px",
        "xl": "32px",
        "2xl": "40px",
        "3xl": "48px"
      },
      "width": {
        "0": "16px",
        "1": "20px",
        "2": "24px",
        "3": "28px",
        "4": "32px",
        "5": "36px",
        "6": "40px",
        "7": "44px",
        "8": "48px",
        "9": "52px",
        "10": "56px",
        "11": "64px",
        "12": "72px",
        "13": "80px",
        "14": "96px",
        "xs": "20px",
        "sm": "24px",
        "md": "28px",
        "lg": "32px",
        "xl": "36px"
      },
      "height": {
        "0": "16px",
        "1": "20px",
        "2": "24px",
        "3": "28px",
        "4": "32px",
        "5": "36px",
        "6": "40px",
        "7": "44px",
        "8": "48px",
        "9": "52px",
        "10": "56px",
        "11": "64px",
        "12": "72px",
        "13": "80px",
        "14": "96px",
        "xs": "20px",
        "sm": "24px",
        "md": "28px",
        "lg": "32px",
        "xl": "36px"
      },
      "borderRadius": {
        "none": "0px",
        "sm": "2px",
        "md": "4px",
        "lg": "8px",
        "xl": "12px",
        "2xl": "16px",
        "full": "9999px"
      },
      "boxShadow": {
        "xs": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "sm": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        "xl": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        "inner": "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)"
      },
      "transitionDuration": {
        "fast": "150ms",
        "normal": "250ms",
        "slow": "350ms"
      },
      "transitionTimingFunction": {
        "ease": [
          0.25,
          0.1,
          0.25,
          1
        ],
        "easeIn": [
          0.42,
          0,
          1,
          1
        ],
        "easeOut": [
          0,
          0,
          0.58,
          1
        ],
        "easeInOut": [
          0.42,
          0,
          0.58,
          1
        ]
      }
    }
  }
};

export default config;
