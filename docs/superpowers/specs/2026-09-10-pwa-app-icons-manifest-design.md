# PWA and Mobile App Icons Setup Design

**Date**: 2026-09-10  
**Status**: Approved (Option A: Safe-zone Padding)

## Overview
Configure mobile home screen bookmarking / PWA installation icons and metadata for Oasis on both iOS (Safari) and Android (Chrome), as well as desktop/mobile browser tabs.

## Asset Generation Plan
From source image `media_1789030645712.png` (710×714 sketch of clock & figure):
1. **Padded Master Image**:
   - Add ~8% safe-zone margin around the image using the sampled background color of the paper texture (`#f4f4f4` / average border tone).
   - Ensure a 1:1 square canvas.
2. **Generated Files**:
   - `public/favicon.ico`: Multi-size (16x16, 32x32, 48x48)
   - `public/favicon-32.png`: 32x32 PNG for crisp browser tab rendering
   - `public/apple-touch-icon.png`: 180x180 PNG for iOS Safari "Add to Home Screen"
   - `public/icons/icon-192.png`: 192x192 PNG for Android Home Screen & PWA manifest
   - `public/icons/icon-512.png`: 512x512 PNG for Android splash screen and high-res icon

## Web App Manifest Configuration
Create `public/manifest.json`:
- `name`: "Oasis - Beating the Burnout"
- `short_name`: "Oasis"
- `start_url`: "/"
- `display`: "standalone"
- `background_color`: "#ffffff"
- `theme_color`: "#ffffff"
- `icons`:
  - `icon-192.png` (192x192, `image/png`, `any`)
  - `icon-512.png` (512x512, `image/png`, `any`)

## HTML Shell Configuration
In `index.html`, inject:
- `<link rel="icon" type="image/x-icon" href="/favicon.ico" />`
- `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />`
- `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />`
- `<link rel="manifest" href="/manifest.json" />`
- `<meta name="theme-color" content="#ffffff" />`
- `<meta name="apple-mobile-web-app-capable" content="yes" />`
- `<meta name="apple-mobile-web-app-status-bar-style" content="default" />`
- `<meta name="apple-mobile-web-app-title" content="Oasis" />`

## Verification
- Inspect generated images and dimensions.
- Validate `manifest.json` syntax.
- Verify `index.html` loading and preview in browser subagent.
