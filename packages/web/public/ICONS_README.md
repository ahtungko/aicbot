# PWA Icons

This directory should contain the following icon files for the PWA to work properly:

## Required Icons

1. **pwa-192x192.png** - 192x192 pixel icon
2. **pwa-512x512.png** - 512x512 pixel icon
3. **apple-touch-icon.png** - 180x180 pixel icon for iOS
4. **favicon.ico** - Standard favicon

## Generating Icons

You can use the provided `pwa-icon.svg` as a base to generate the required PNG files.

### Using Online Tools

1. Visit https://realfavicongenerator.net/
2. Upload your SVG or design
3. Generate all required icon sizes
4. Download and place in the `public` directory

### Using Command Line (if imagemagick is installed)

```bash
# Generate 192x192
convert pwa-icon.svg -resize 192x192 pwa-192x192.png

# Generate 512x512
convert pwa-icon.svg -resize 512x512 pwa-512x512.png

# Generate apple touch icon
convert pwa-icon.svg -resize 180x180 apple-touch-icon.png
```

### Using Node.js (sharp package)

```javascript
const sharp = require('sharp');

sharp('pwa-icon.svg').resize(192, 192).toFile('pwa-192x192.png');

sharp('pwa-icon.svg').resize(512, 512).toFile('pwa-512x512.png');

sharp('pwa-icon.svg').resize(180, 180).toFile('apple-touch-icon.png');
```

## Notes

- Icons should have a transparent or colored background
- Consider creating maskable icons for better Android support
- Test icons on both light and dark backgrounds
- Ensure icons are recognizable at small sizes

For now, a simple SVG template is provided. Generate the PNG files using your preferred method.
