/** @type {import('tailwindcss').Config} */
module.exports = {
  "theme": {
    "extend": {
      "colors": {
        "brand": "#6B46C1",
        "brandAccent": "#805AD5",
        "surface": "#FFFFFF",
        "surfaceAlt": "#F7FAFC",
        "overlay": "rgba(0, 0, 0, 0.8)",
        "success": "#48BB78",
        "danger": "#E53E3E",
        "warning": "#ECC94B",
        "textPrimary": "#1A202C",
        "textSecondary": "#4A5568",
        "textInverse": "#FFFFFF",
        "white": "#FFFFFF",
        "primary": {
          "50": "#F5F3FF",
          "100": "#EDE9FE",
          "200": "#DDD6FE",
          "300": "#C4B5FD",
          "400": "#A78BFA",
          "500": "#8B5CF6",
          "600": "#7C3AED",
          "700": "#6D28D9",
          "800": "#5B21B6",
          "900": "#4C1D95"
        },
        "neutral": {
          "50": "#F7FAFC",
          "100": "#EDF2F7",
          "200": "#E2E8F0",
          "300": "#CBD5E0",
          "400": "#A0AEC0",
          "500": "#718096",
          "600": "#4A5568",
          "700": "#2D3748",
          "800": "#1A202C",
          "900": "#171923"
        }
      },
      "spacing": {
        "0": "0px",
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "24px",
        "6": "32px",
        "xs": "4px",
        "sm": "8px",
        "md": "16px",
        "lg": "24px",
        "xl": "32px",
        "2xl": "48px"
      },
      "borderRadius": {
        "none": "0px",
        "sm": "2px",
        "md": "4px",
        "lg": "8px",
        "full": "9999px"
      },
      "fontSize": {
        "xs": "12px",
        "sm": "14px",
        "md": "16px",
        "lg": "18px",
        "xl": "24px",
        "2xl": "32px"
      },
      "fontWeight": {
        "regular": "400",
        "medium": "500",
        "bold": "700"
      },
      "lineHeight": {
        "xs": "16px",
        "sm": "20px",
        "md": "24px",
        "lg": "28px",
        "xl": "32px",
        "2xl": "40px"
      },
      "boxShadow": {
        "none": "none",
        "xs": "0px 1px 1px #000",
        "sm": "0px 2px 2px #000",
        "md": "0px 4px 4px #000",
        "lg": "0px 8px 8px #000"
      },
      "opacity": {
        "0": 0,
        "10": 0.1,
        "20": 0.2,
        "30": 0.3,
        "40": 0.4,
        "50": 0.5,
        "60": 0.6,
        "70": 0.7,
        "80": 0.8,
        "90": 0.9,
        "100": 1
      },
      "transitionDuration": {
        "fast": "150ms",
        "normal": "300ms",
        "slow": "500ms"
      },
      "zIndex": {
        "base": 0,
        "overlay": 100,
        "modal": 200,
        "toast": 300,
        "tooltip": 400
      },
      "transitionTimingFunction": {
        "default": "cubic-bezier(0.4, 0, 0.2, 1)"
      }
    }
  }
};