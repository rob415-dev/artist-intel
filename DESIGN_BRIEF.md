# Artist Intel — Design Brief

> Drop this file into the root of your `artist-intel/` project on Day 1.
> Reference it in every Claude Code session by saying:
> "Follow the design system in DESIGN_BRIEF.md for all UI work."

---

## Visual Identity

**Product name:** Artist Intel
**Tagline:** The intelligence layer for music managers.
**Aesthetic direction:** Precision data tool. Clean, airy, professional — like a Bloomberg terminal
redesigned by a Scandinavian design studio. Not bubbly. Not corporate. Calm authority.

---

## Reference Images

Save the 5 reference screenshots to `/design-refs/` in your project root and reference them like:

```
"Follow the visual style in ./design-refs/ref1.webp through ref5.webp"
```

**What to take from each image:**
- `ref1.webp` / `ref2.webp` — Overall layout: left sidebar, metric strip across top, trend chart,
  expandable data table below, right rail panels. This is your dashboard structure 1:1.
- `ref3.webp` — Card floating treatment: white cards on warm gray background with soft shadow.
  Metric row typography. Status badge pill styling (NEEDS REVIEW, GOOD).
- `ref4.webp` — Right rail stat panel anatomy: large number + colored delta, tabular right-aligned
  breakdown rows, rounded pill bar chart shape, donut ring for ratio metrics.
- `ref5.webp` — Close-up of the right panel at larger scale. Use this for spacing and type size
  calibration on the stats breakdown list.

---

## Color Palette

```css
/* Page & layout */
--color-page-bg:        #E8E8EA;   /* warm gray — the "desk" the app sits on */
--color-app-bg:         #F4F4F6;   /* app shell background */
--color-surface:        #FFFFFF;   /* all cards, panels, table rows */
--color-surface-hover:  #F9F9FA;   /* card/row hover state */
--color-sidebar-bg:     #FFFFFF;   /* sidebar is white, not dark */

/* Borders */
--color-border:         rgba(0, 0, 0, 0.07);   /* card edges — barely visible */
--color-border-strong:  rgba(0, 0, 0, 0.12);   /* table dividers, input outlines */

/* Text */
--color-text-primary:   #111111;   /* headings, large numbers */
--color-text-secondary: #6B6B72;   /* labels, column headers, muted text */
--color-text-tertiary:  #9B9BA4;   /* timestamps, hints, placeholder */

/* Accent — Artist Intel brand (music industry energy, not generic SaaS blue) */
--color-accent:         #E8442A;   /* primary CTA, active nav, key highlights */
--color-accent-light:   #FDF0EE;   /* accent background tint */
--color-accent-hover:   #D13820;   /* CTA hover */

/* Deltas & status */
--color-positive:       #1A9E5C;   /* +% growth, GOOD badge text */
--color-positive-bg:    #EAF7F0;   /* GOOD badge background */
--color-negative:       #9B9BA4;   /* -% decline (muted, not alarming) */
--color-warning:        #E8442A;   /* NEEDS REVIEW badge text */
--color-warning-bg:     #FDF0EE;   /* NEEDS REVIEW badge background */

/* Chart line colors (matches reference multi-line trend chart) */
--color-chart-1:        #E8442A;   /* primary metric — listeners (coral/red) */
--color-chart-2:        #5B8EE8;   /* secondary metric — streams (blue) */
--color-chart-3:        #C0C0C8;   /* tertiary metric — followers (gray) */
```

---

## Typography

```css
/* Font stack */
--font-sans: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'DM Mono', 'Fira Code', monospace;

/* Scale */
--text-xs:   11px;   /* column headers (UPPERCASE + letter-spacing) */
--text-sm:   12px;   /* timestamps, badges, secondary labels */
--text-base: 13px;   /* body text, table rows, sidebar nav items */
--text-md:   14px;   /* card labels, form inputs */
--text-lg:   22px;   /* metric numbers (monthly listeners, streams) */
--text-xl:   28px;   /* hero stat numbers (right rail, featured metric) */

/* Weights */
--weight-normal:  400;
--weight-medium:  500;
--weight-bold:    600;

/* Special rules */
/* All metric numbers: font-variant-numeric: tabular-nums */
/* Column headers: text-transform: uppercase; letter-spacing: 0.06em; font-size: 11px; color: var(--color-text-secondary) */
/* Delta tags (+5%, -2%): font-size: 12px; font-weight: 500; no background — just colored text inline */
```

**Font install (add to layout.tsx):**
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

---

## Layout System

```
┌─────────────────────────────────────────────────────────┐
│  Page bg: #E8E8EA                                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  App shell: rounded-2xl, shadow-sm               │   │
│  │  ┌──────┐  ┌────────────────────┐  ┌──────────┐  │   │
│  │  │      │  │   Main content     │  │  Right   │  │   │
│  │  │ Side │  │                    │  │  Rail    │  │   │
│  │  │ bar  │  │  Metric strip      │  │          │  │   │
│  │  │      │  │  Trend chart       │  │  Stats   │  │   │
│  │  │ 220px│  │  Data table        │  │  panels  │  │   │
│  │  │      │  │                    │  │  240px   │  │   │
│  │  └──────┘  └────────────────────┘  └──────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

- **Sidebar width:** 220px fixed, white background, no border — separated by the page bg showing through
- **Right rail width:** 240px fixed
- **Main content:** fluid, min 560px, padding 24px
- **App shell:** `border-radius: 16px`, `box-shadow: 0 4px 32px rgba(0,0,0,0.08)`
- **Search bar:** spans full top, height 44px, background `#F4F4F6`, border none, radius 8px

---

## Component Specs

### Metric strip (top of dashboard)
Horizontal row, no card wrapper, each metric separated by a subtle divider.

```
[Label]        [Label]        [Label]
[Large number] [+delta]       [Large number] [-delta]

e.g.
Monthly Listeners    Streams 30d    Followers    Playlists
1,284,500  +8.2%    4.2M  +12%    48,300  +3%   127  +4
```

- Label: `11px, uppercase, #6B6B72, letter-spacing 0.06em`
- Number: `22px, font-weight 600, #111111, tabular-nums`
- Delta positive: `12px, font-weight 500, #1A9E5C` (no background)
- Delta negative: `12px, font-weight 500, #9B9BA4` (muted, not red)
- Divider: `1px solid rgba(0,0,0,0.07)`, vertical, 32px tall

### Trend chart
- Recharts `LineChart`, no CartesianGrid, no fill area
- Three lines: listeners (coral `#E8442A`), streams (blue `#5B8EE8`), followers (gray `#C0C0C8`)
- Stroke width: 1.5px
- Dots: visible only on hover, 4px radius, filled white with 2px colored stroke
- X-axis: month labels only, `11px, #9B9BA4`
- Y-axis: percentage labels right-aligned, `11px, #9B9BA4`
- Tooltip: white card, `border-radius: 8px`, `box-shadow: 0 2px 12px rgba(0,0,0,0.12)`, shows all 3 values
- Active point: vertical dashed line `rgba(0,0,0,0.15)` + filled circle badge (coral, white text, the date number inside)

### Data table (artist tracks / pitch history)
- `border-collapse: separate; border-spacing: 0`
- Column headers: uppercase, 11px, `#9B9BA4`, `letter-spacing: 0.06em`, border-bottom `1px solid rgba(0,0,0,0.07)`
- Row height: 48px
- Row separator: `1px solid rgba(0,0,0,0.05)` bottom border only
- Hover: `background: #F9F9FA`
- Expandable rows: clicking shows an inset panel with `background: #F9F9FA`, `border-left: 3px solid var(--color-accent)`, padding 16px
- Live/new row indicator: `6px filled circle, color: var(--color-accent)` before the date

### Status badges (pitch status, track performance)
```css
/* NEEDS REVIEW / PENDING */
.badge-warning {
  background: #FDF0EE;
  color: #E8442A;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 4px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* GOOD / SENT / ACTIVE */
.badge-positive {
  background: #EAF7F0;
  color: #1A9E5C;
  /* same padding/sizing */
}

/* NEUTRAL / DRAFT */
.badge-neutral {
  background: #F0F0F2;
  color: #6B6B72;
}
```

### Right rail stat panel
White card, `border-radius: 12px`, `padding: 16px`, `border: 0.5px solid rgba(0,0,0,0.07)`.

Structure:
```
[Platform name]  [...]  [7D ▾]      ← header row
──────────────────────────────
[Label]
[Large number]  [+delta]            ← hero metric (white inner card)

[Label]
[Number]  [donut ring]              ← secondary metric with visual

──────────────────────────────
[Stat name]              [value]    ← tabular breakdown rows
[Stat name]              [value]
[Stat name]              [value]
```

- Tabular rows: `font-size: 13px`, value right-aligned with `font-variant-numeric: tabular-nums`
- Inner white cards (hero metrics): `background: white`, `border-radius: 8px`, `padding: 12px 14px`
- Donut ring: SVG circle, `stroke-width: 6`, two-tone (coral + light gray), 44px diameter
- Bar chart (pill style): bars are fully rounded (`border-radius: 100px`), highlighted bar is solid blue `#5B8EE8`, inactive bars are `#E8E8EA`, bar width 12px
- Time selector: `7D ▾` — `12px, #6B6B72`, dropdown chevron, clickable

### Sidebar nav
- No background color difference from app — separated spatially
- Active item: white card `border-radius: 8px`, `padding: 8px 12px`, very subtle shadow `0 1px 4px rgba(0,0,0,0.06)`
- Active item text: `#111111, font-weight 500`
- Inactive text: `#6B6B72, font-weight 400`
- Icons: 16px, Lucide outline style, color inherits from text
- Section groups with expand/collapse chevron for sub-items
- Sub-items: `padding-left: 28px`, `font-size: 12px`, `color: #9B9BA4`
- Logo: top-left, 32px icon, no text

### CTA buttons
```css
/* Primary (coral — matches accent) */
.btn-primary {
  background: #E8442A;
  color: white;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.btn-primary:hover { background: #D13820; }

/* Secondary (ghost) */
.btn-secondary {
  background: transparent;
  color: #111111;
  border: 1px solid rgba(0,0,0,0.15);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
}
.btn-secondary:hover { background: #F4F4F6; }
```

---

## Spacing System

```
4px   — icon-to-text gap, badge internal padding
8px   — tight component spacing (icon margins, small gaps)
12px  — card internal padding compact, badge padding horizontal
16px  — card padding standard, form field gap
24px  — section spacing, main content padding
32px  — between major dashboard sections
48px  — page-level vertical rhythm
```

---

## Cards

```css
.card {
  background: #FFFFFF;
  border-radius: 12px;
  border: 0.5px solid rgba(0, 0, 0, 0.07);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03);
  padding: 20px 24px;
}

/* Compact card (right rail inner) */
.card-sm {
  border-radius: 8px;
  padding: 12px 14px;
}
```

No heavy shadows. The cards float, not press. The shadow is almost invisible — you feel it more than see it.

---

## Motion & Interactions

- **Page load:** Stats numbers count up from 0 over 600ms using an easing curve (`ease-out`). Do this once on mount.
- **Hover states:** `transition: background 150ms ease, border-color 150ms ease` — nothing slower than 200ms.
- **Expandable rows:** `max-height` transition, `300ms ease-in-out`.
- **Chart tooltip:** appears instantly (no animation — data tools need zero latency on hover).
- **Skeleton loaders:** use a `shimmer` animation (`background: linear-gradient(90deg, #F0F0F2 25%, #E8E8EA 50%, #F0F0F2 75%)`) for all loading states. Match the exact shape of the real content.
- **No page transitions.** Route changes should feel instant.

---

## What NOT to do

- No dark sidebar (the references are all-white — this is the look)
- No purple gradients or generic SaaS blues as primary accent
- No heavy drop shadows (the cards barely float)
- No colored backgrounds on the page body (warm gray only)
- No large hero banners or marketing sections inside the app shell
- No rounded buttons with radius > 10px (keep them slightly squared)
- No Inter or Roboto — use DM Sans
- No inline chart labels (use tooltip only)
- No more than 3 lines on the trend chart
- Don't center-align table data — left for text, right for numbers, always

---

## How to Use This Brief in Claude Code

**At the start of every Claude Code session, paste:**

```
Follow the design system in DESIGN_BRIEF.md for all UI work.
Primary accent: #E8442A. Font: DM Sans. Cards: white with 0.5px border
and very subtle shadow. Page bg: #E8E8EA. Sidebar: white, 220px.
No dark mode. No Inter. Tabular-nums on all stat figures.
```

**When building a specific component, reference it directly:**

```
"Build the artist metric strip following the Metric Strip spec in
DESIGN_BRIEF.md. The 4 metrics are: Monthly Listeners, 30d Streams,
Followers, Active Playlists."
```

**When sharing new reference images in terminal:**

```
"The attached screenshot shows the exact card style I want.
Match the shadow depth, border opacity, and inner spacing.
Apply it to the pitch history table."
```

---

*Design reference: marketing-intelligence.com dashboard by Shakuro (seen in uploaded refs).*
*Adapted for Artist Intel — music industry data tool.*