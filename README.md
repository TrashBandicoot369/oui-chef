# Chef Alex J — Private Dining & Events Website

A modern, responsive website built with Next.js 14, TypeScript, and Tailwind CSS showcasing Chef Alex J's private dining and catering services.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🎨 Font Management System

This project uses a global font controller implemented with `next/font/google` and CSS variables for optimal performance and flexibility.

### Current Font Configuration

| Font Family | Usage | Weight(s) | CSS Variable | Tailwind Class |
|-------------|-------|-----------|--------------|----------------|
| **Anton** | Display text, headers, logo | 400 | `--font-display` | `font-display` |
| **Bitter** | Body text, paragraphs | 400, 500 | `--font-sans` | `font-sans` |
| **Oswald** | Buttons, call-to-actions | 500 | `--font-button` | `font-button` |

### Font Implementation Details

#### 1. Font Imports (`app/layout.tsx`)
```tsx
import { Cherry_Cream_Soda, Roboto, Oswald } from 'next/font/google'

const cherryCreamSoda = Cherry_Cream_Soda({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const roboto = Roboto({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const oswald = Oswald({
  weight: '500',
  subsets: ['latin'],
  variable: '--font-button',
  display: 'swap',
})
```

#### 2. Global Application
```tsx
<html className={`scroll-smooth ${cherryCreamSoda.variable} ${roboto.variable} ${oswald.variable}`}>
```

#### 3. Tailwind Configuration (`tailwind.config.js`)
```js
fontFamily: {
  display: ["var(--font-display)", "cursive"],
  sans: ["var(--font-sans)", "sans-serif"],
  button: ["var(--font-button)", "sans-serif"],
}
```

## 🔧 How to Change Fonts

### Option 1: Replace Existing Fonts

1. **Update font imports in `app/layout.tsx`:**
```tsx
// Replace with your desired Google Font
import { Your_New_Font } from 'next/font/google'

const yourNewFont = Your_New_Font({
  weight: ['400', '700'], // Specify needed weights
  subsets: ['latin'],
  variable: '--font-display', // Keep same CSS variable
  display: 'swap',
})
```

2. **Update the className in the HTML element:**
```tsx
<html className={`scroll-smooth ${yourNewFont.variable} ${roboto.variable} ${oswald.variable}`}>
```

### Option 2: Add New Font Categories

1. **Add new font import:**
```tsx
const newCategoryFont = New_Font({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-new-category',
  display: 'swap',
})
```

2. **Add to HTML className:**
```tsx
<html className={`scroll-smooth ${cherryCreamSoda.variable} ${roboto.variable} ${oswald.variable} ${newCategoryFont.variable}`}>
```

3. **Update Tailwind config:**
```js
fontFamily: {
  display: ["var(--font-display)", "cursive"],
  sans: ["var(--font-sans)", "sans-serif"],
  button: ["var(--font-button)", "sans-serif"],
  newCategory: ["var(--font-new-category)", "sans-serif"], // Add new font
}
```

4. **Use in components:**
```tsx
<h1 className="font-newCategory">Your text</h1>
```

### Font Usage Examples

```tsx
// Display font (Cherry Cream Soda)
<h1 className="font-display text-4xl">Chef Alex J</h1>

// Body font (Roboto) - Default
<p className="font-sans">This is body text</p>

// Button font (Oswald)
<button className="font-button uppercase">Book Event</button>
```

## 🖼️ Image Management

### Image Structure
```
public/
  images/
    optimized/           # Compressed WebP images
      IMG_6969.webp     # Hero background
      IMG_6253.webp     # About section
      IMG_8262.webp     # Event highlight 1
      IMG_8301.webp     # Event highlight 2
      IMG_8355.webp     # Event highlight 3
      IMG_8386.webp     # Event highlight 4
      IMG_8436-Edit.webp # Event highlight 5
      IMG_8223.webp     # Event highlight 6
```

### Adding New Images

1. **Compress images to WebP format** for optimal performance
2. **Place in `/public/images/optimized/`** directory
3. **Update image sources** in `app/page.tsx`:
```tsx
<img src="/images/optimized/your-image.webp" alt="Description" />
```

## 🎨 Design System

### Color Palette
```css
primary1: '#91c5f9'     /* Light blue accent */
primary2: '#ffe6d7'    /* Warm peach background */
primary3: '#61e786'    /* Fresh green highlights */
accent1: '#000000'     /* Pure black text */
accent2: '#1a1a1a'      /* Dark gray elements */
```

### Typography Scale
- **Display**: Cherry Cream Soda (headers, logo)
- **Body**: Roboto (paragraphs, general text)
- **Button**: Oswald (call-to-actions, buttons)

## 📱 Responsive Design

- **Mobile-first approach** using Tailwind CSS
- **Breakpoints**: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- **Fluid typography** with responsive font sizes
- **Flexible grid layouts** that adapt to screen size

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Fonts**: next/font/google
- **Icons**: Emoji-based
- **Images**: Optimized WebP format

## 📦 Dependencies

```json
{
  "next": "14.0.0",
  "react": "^18",
  "react-dom": "^18",
  "tailwindcss": "^3.3.0",
  "typescript": "^5"
}
```

## 🚀 Deployment

This project is optimized for deployment on:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Any static hosting service**

### Build Commands
```bash
npm run build  # Builds the application
npm start      # Serves the built application
```

## 📄 Project Structure

```
oui-chef/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout with fonts
│   └── page.tsx             # Home page component
├── public/
│   └── images/
│       └── optimized/       # Compressed images
├── tailwind.config.js       # Tailwind configuration
├── package.json             # Dependencies
└── README.md               # This file
```

## 📞 Support

For questions about font configuration or project setup, refer to:
- [Next.js Font Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [Tailwind CSS Font Family](https://tailwindcss.com/docs/font-family)
- [Google Fonts](https://fonts.google.com/)

---

Built with ❤️ for Chef Alex J's culinary experiences. 