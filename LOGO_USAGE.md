# ROSCO Logo Usage Guide

## Logo Assets

All logo files live in `/public/`:

| File | Source | Description |
|------|--------|-------------|
| `AppLogo.png` | `Design Files/Design 1/AppLogo.png` | Square app icon (240×240) — used in app headers & notifications |
| `Design_1.svg` | `Source Files/Design 1/Design_1.svg` | Full vector logo with text — used in marketing/branding |
| `Design_1.png` | `Source Files/Design 1/Design_1.png` | Full raster logo with text — fallback for Design_1.svg |
| `icon-192.png` | Generated from AppLogo.png | PWA icon 192×192 |
| `icon-512.png` | Generated from AppLogo.png | PWA icon 512×512 |
| `apple-touch-icon.png` | Generated from AppLogo.png | iOS home screen icon 180×180 |
| `favicon.ico` | Generated from AppLogo.png | Browser favicon (16×16 + 32×32) |
| `favicon-16x16.png` | Generated from AppLogo.png | Favicon 16×16 |
| `favicon-32x32.png` | Generated from AppLogo.png | Favicon 32×32 |

## Usage by Context

### App Headers / Navigation
- **Admin dashboard** (`app/admin/layout.tsx`): `AppLogo.png` — compact icon in header nav
- **Handyman app** (`app/handyman/layout.tsx`): `AppLogo.png` — compact icon in header nav

### Marketing & Branding
- **Landing page** (`app/page.tsx`): `Design_1.svg` — full logo with wordmark
- **Marketing page** (`app/marketing/page.tsx`): `Design_1.svg` — full logo with wordmark
- **Sign-up intent** (`app/signup-intent/page.tsx`): `Design_1.svg` — full logo with wordmark
- **Payment success** (`app/pay/[invoiceId]/success/page.tsx`): `Design_1.svg` — full logo
- **Demo page** (`app/demo/page.tsx`): `Design_1.svg` — full logo with wordmark

### PWA / System Icons
- **PWA manifest** (`public/manifest.json`): `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`
- **Browser favicon**: `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`

### Push Notifications
- **FCM notifications** (`app/api/send-notification/route.ts`): `AppLogo.png` — icon + badge

## Regenerating Icons

If AppLogo.png is updated, regenerate icons with:

```bash
PUBLIC=./public
sips -z 192 192 "$PUBLIC/AppLogo.png" --out "$PUBLIC/icon-192.png"
sips -z 512 512 "$PUBLIC/AppLogo.png" --out "$PUBLIC/icon-512.png"
sips -z 180 180 "$PUBLIC/AppLogo.png" --out "$PUBLIC/apple-touch-icon.png"
sips -z 32 32 "$PUBLIC/AppLogo.png" --out "$PUBLIC/favicon-32x32.png"
sips -z 16 16 "$PUBLIC/AppLogo.png" --out "$PUBLIC/favicon-16x16.png"
magick "$PUBLIC/favicon-16x16.png" "$PUBLIC/favicon-32x32.png" "$PUBLIC/favicon.ico"
```

## Source Files

Original design files are in `~/Downloads/LOGO ROSCO/`:
- `Design Files/Design 1/AppLogo.png` — app icon source
- `Source Files/Design 1/Design_1.svg` — vector source
- `Source Files/Design 1/Design_1.ai` — Illustrator source
- `Source Files/Design 1/Design_1.psd` — Photoshop source
