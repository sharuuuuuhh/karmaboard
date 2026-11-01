# Karmayodha Frontend Redesign — Design Notes

## 1. Principles Applied from Skills
- **Anti-Generic & Clarity (tasteful-ui)**: Discard dark-mode by default, glows, and decorative noise. Deliver a calm, light, editorial-grade fintech dashboard with high data density and scanability.
- **Data & Numeric Discipline (ui-craft)**: 4/8px grid scale, `font-variant-numeric: tabular-nums` for all scores, ranks, and deltas; right-aligned figures; micro-motion < 200ms (lift 2px, scale 0.98).
- **Two-Size Rule per Card**: Cards maintain disciplined typography: card title (18px/700) + hero number (28-40px/700) with secondary labels (12px/500).
- **Accessible Contrast**: Every pastel card is paired with its specified high-contrast ink tone for icons, badges, and text, exceeding WCAG AA standards.
- **Graceful Device Framing**: Outer black frame (`#1B1B1D`) on >= 1200px desktop viewports, clean edge-to-edge responsive panel on mobile/tablet.

## 2. Token Definitions
- **Canvas & Shell**: `--page-backdrop: #E8F1FB`, `--app-frame: #1B1B1D` (r: 36px), `--content-panel: #FFFFFF` (r: 28px), `--sidebar-w: 72px`, `--logo-tile: #F7F0D8` (r: 18px).
- **Text & Grays**: Primary `#121214`, Secondary `#6B6B73`, Muted `#A0A0A8`, Table header `#8A8A93` (12px), Borders `1px #ECECF0`.
- **Group Pastels & Matching Inks**:
  - `TECH`: `#E6E1F2` / ink `#6D5BD0`
  - `LEADS`: `#F7DDE0` / ink `#D2455C`
  - `OPERATION`: `#F8EFCF` / ink `#B88A12`
  - `MEDIA`: `#DCEBF7` / ink `#2D7FB8`
  - `MARKETING`: `#D9EEDC` / ink `#2E9A57`
  - `CONTENT`: `#FBE2D0` / ink `#D8692B`
  - `CREATIVE`: `#EBDDF5` / ink `#9B4FC4`
- **Chart Card**: Tint `#DFEBFA`, Line `#4C9AEE`, Area fill `rgba(76, 154, 238, 0.18)` fading to transparent.
- **Promo Card**: `#232325`, Pill `#CFE6FF` (ink `#0F1A26`), fine line-art corners.
- **Status & Controls**: Up `#2E9A57`, Down `#D14343`, Neutral `#A0A0A8`. Pill radius (9999px), card radius (24px), tile radius (16px).
- **Font**: Manrope (fallback Inter, system-ui).

