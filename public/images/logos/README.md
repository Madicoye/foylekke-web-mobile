# Foylekke Logo Files

This directory contains the PNG versions of the Foylekke brand logos.

## 📁 Logo Files Structure

```
public/images/logos/
├── foylekke-icon-40x40.png      # Small icon (40x40px)
├── foylekke-icon-64x64.png      # Large icon (64x64px)  
├── foylekke-full-standard.png   # Full logo standard size
├── foylekke-full-large.png      # Full logo large size
├── foylekke-text-standard.png   # Text only standard size
└── foylekke-text-large.png      # Text only large size
```

## 🎨 How to Generate Logo PNG Files

### Method 1: Using Browser Developer Tools (Recommended)

1. **Open the logo export page:**
   ```bash
   open logo-export.html
   ```

2. **For each logo variant:**
   - Right-click on the logo element
   - Select "Inspect Element" 
   - In DevTools, right-click on the highlighted element
   - Choose "Capture node screenshot"
   - Save with the appropriate filename

### Method 2: Using Browser Extensions

Install one of these extensions:
- **GoFullPage** - Full page screenshots
- **Awesome Screenshot** - Element capture
- **Nimbus Screenshot** - Selective capture

### Method 3: Using Screenshot Tools

Use any screenshot tool to capture each logo area and save with the correct dimensions.

## 📐 Logo Specifications

| File | Dimensions | Content | Use Case |
|------|------------|---------|----------|
| `foylekke-icon-40x40.png` | 40x40px | FL badge only | Navbar, favicons |
| `foylekke-icon-64x64.png` | 64x64px | FL badge only | App icons, large favicons |
| `foylekke-full-standard.png` | Auto width | FL + foylekke text | Website headers |
| `foylekke-full-large.png` | Auto width | FL + foylekke text (large) | Banners, marketing |
| `foylekke-text-standard.png` | Auto width | foylekke text only | Minimal layouts |
| `foylekke-text-large.png` | Auto width | foylekke text only (large) | Large headers |

## 🎨 Design Details

- **Colors:** Orange (#ed7519) to Purple (#d946ef) gradient
- **Font:** Montserrat Bold
- **Background:** Transparent PNG
- **Format:** High-resolution PNG for crisp display

## 🔧 Automated Generation (Optional)

If you have Node.js and want to automate:

```bash
# Install puppeteer (if not already installed)
npm install puppeteer

# Run the logo generation script
node scripts/generate-logos.js
```

## 📝 Usage in React Components

Once generated, use them like this:

```jsx
// Icon only
<img src="/images/logos/foylekke-icon-40x40.png" alt="Foylekke" />

// Full logo
<img src="/images/logos/foylekke-full-standard.png" alt="Foylekke" />

// Text only
<img src="/images/logos/foylekke-text-standard.png" alt="Foylekke" />
```

## 🚀 Next Steps

1. Generate the PNG files using one of the methods above
2. Place them in this directory with the exact filenames listed
3. Update components to use PNG logos instead of CSS logos if desired
4. Test across different devices and screen resolutions 