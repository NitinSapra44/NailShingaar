import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ["Cormorant Garamond", "serif"],
        serif: ["Cormorant Garamond", "serif"],
        sans: ["Quicksand", "sans-serif"],
        script: ["Great Vibes", "cursive"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Brand palette
        "rose-gold": {
          DEFAULT: "hsl(var(--rose-gold))",
          light: "hsl(var(--rose-gold-light))",
          dark: "hsl(var(--rose-gold-dark))",
        },
        nude: {
          DEFAULT: "hsl(var(--nude))",
          light: "hsl(var(--nude-light))",
        },
        beige: {
          DEFAULT: "hsl(var(--beige))",
          light: "hsl(var(--beige-light))",
        },
        champagne: {
          DEFAULT: "hsl(var(--champagne))",
          light: "hsl(var(--champagne-light))",
        },
        cream: "hsl(var(--cream))",
        // Keep old names for backwards compat with remaining references
        rose: {
          DEFAULT: "hsl(var(--rose-gold))",
          light: "hsl(var(--rose-gold-light))",
          dark: "hsl(var(--rose-gold-dark))",
        },
        lavender: {
          DEFAULT: "hsl(var(--champagne))",
          light: "hsl(var(--champagne-light))",
          dark: "hsl(var(--rose-gold-dark))",
        },
        peach: {
          DEFAULT: "hsl(var(--nude))",
          light: "hsl(var(--nude-light))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-up": "fade-up 0.6s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out",
        float: "float 4s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      backgroundImage: {
        "gradient-rose": "linear-gradient(135deg, hsl(var(--rose-gold-light)) 0%, hsl(var(--nude-light)) 100%)",
        "gradient-champagne": "linear-gradient(135deg, hsl(var(--champagne-light)) 0%, hsl(var(--cream)) 100%)",
        "gradient-nude": "linear-gradient(180deg, hsl(var(--nude-light)) 0%, hsl(var(--cream)) 100%)",
      },
      boxShadow: {
        "rose-gold": "0 10px 40px -10px hsl(var(--rose-gold) / 0.35)",
        champagne: "0 10px 40px -10px hsl(var(--champagne) / 0.35)",
        soft: "0 4px 20px -4px hsl(var(--foreground) / 0.08)",
        card: "0 10px 40px -10px hsl(var(--rose-gold) / 0.25)",
        glow: "0 0 28px hsl(var(--rose-gold) / 0.45)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
