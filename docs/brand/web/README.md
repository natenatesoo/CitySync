# CitySync Brand Web & App Icons

This directory contains all web and app icon assets for the CitySync brand.

## Brand Colors
- **Gold**: #DD9E33
- **Navy**: #23128F
- **White**: #FFFFFF
- **Black**: #000000

## Generated Assets

### Open Graph Image
- **og-image.svg** (1200x630) - Social media share image with "CITY//SYNC" wordmark and tagline "Programmable Civic Coordination Infrastructure"

### Favicon Assets
- **favicon.svg** - SVG favicon for modern browsers (32x32 viewBox)
- **favicon.ico** - Traditional favicon format (32x32)
- **apple-touch-icon.svg** - Apple Touch Icon for iOS devices (180x180)

### App Icon SVGs
All icons use a navy (#23128F) background with two gold (#DD9E33) slashes in a parallelogram style.

- **icon-16.svg** - 16x16 (browser tabs, small displays)
- **icon-32.svg** - 32x32 (browser address bar, small icons)
- **icon-48.svg** - 48x48 (Windows taskbar, file icons)
- **icon-180.svg** - 180x180 (Apple Touch Icon, iOS home screen)
- **icon-192.svg** - 192x192 (Android/PWA icon, Chrome home screen)
- **icon-512.svg** - 512x512 (PWA splash screen, app stores)

## Implementation Guide

### Web Usage
Add to your HTML `<head>`:
```html
<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/path/to/favicon.svg">
<link rel="alternate icon" href="/path/to/favicon.ico">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" href="/path/to/apple-touch-icon.svg">

<!-- Open Graph -->
<meta property="og:image" content="/path/to/og-image.svg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
```

### PWA Manifest
Add to your `manifest.json`:
```json
{
  "icons": [
    {
      "src": "/path/to/icon-192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml",
      "purpose": "any"
    },
    {
      "src": "/path/to/icon-512.svg",
      "sizes": "512x512",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
```

## Design Details

### Icon Design
- **Base**: Square format with rounded corners (12-20% radius depending on size)
- **Background**: Navy (#23128F)
- **Mark**: Two gold parallelogram slashes (double-slash "//") representing the CitySync brand
- **Proportion**: Slashes fill approximately 50% of icon space
- **Scalability**: All icons are SVG-based for perfect scalability across all sizes

### OG Image Design
- **Dimensions**: 1200x630px (standard OpenGraph ratio)
- **Background**: Navy (#23128F) with subtle gold grid overlay
- **Typography**: Rajdhani font-family (with system font fallbacks)
- **Layout**: CITY//SYNC wordmark (white + gold) centered at top, tagline below

## Notes
- SVG formats are preferred for crisp rendering at any size
- favicon.ico is provided for legacy browser support
- All assets use the official CitySync brand color palette
- Rounded corners automatically handled by browsers for apple-touch-icon.svg
