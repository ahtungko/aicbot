#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const sizes = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 }
];

const publicDir = path.join(__dirname, 'public');

console.log('Creating placeholder icon files...');
console.log('Note: These are placeholder files. Replace with actual PNG icons for production.');

sizes.forEach(({ name, size }) => {
  const filePath = path.join(publicDir, name);
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.125}" fill="#4F46E5"/>
  <g transform="translate(${size/2}, ${size/2})">
    <circle cx="0" cy="${-size*0.08}" r="${size*0.12}" fill="white" opacity="0.9"/>
    <ellipse cx="0" cy="${size*0.04}" rx="${size*0.16}" ry="${size*0.12}" fill="white" opacity="0.9"/>
  </g>
  <text x="${size/2}" y="${size*0.85}" font-family="Arial, sans-serif" font-size="${size*0.12}" font-weight="bold" fill="white" text-anchor="middle">AI</text>
</svg>`;
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`Created: ${name} (${size}x${size}) - SVG placeholder`);
});

console.log('\nPlaceholder icons created successfully!');
console.log('For production, convert these to actual PNG files using:');
console.log('- Online tools: https://realfavicongenerator.net/');
console.log('- Command line: ImageMagick, rsvg-convert, or sharp (Node.js)');
