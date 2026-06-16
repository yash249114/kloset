# Kloset — Brand Logo Concepts

---

## Brand Strategy

| Attribute | Direction |
|---|---|
| **Category** | Luxury fashion rental marketplace |
| **Audience** | Women 18–40, wedding & occasion wear, designer-conscious |
| **Emotional promise** | Access to heritage luxury without ownership — wear legacy, return the rest |
| **Archetype** | The Curator — tasteful, restrained, confident |
| **Visual world** | Warm ivory, champagne gold, deep charcoal, editorial photography, cinematic space |
| **Core metaphor** | The wardrobe door that opens to endless luxury — circulation, access, transformation |

---

## Concept 1 — Wordmark Logo

**Name:** KLOSET Wordmark

**Concept:** A refined, editorial wordmark built from custom geometric letterforms. The typography sits between Didot and a modern geometric — sharp hairlines meet generous curves. The tracking is tight, the capitals commanding. A subtle hairline gap in the counter of the "O" suggests an open wardrobe door, visible only on close inspection.

**Color palette:** Charcoal `#2C2C2C` on ivory `#FAF7F2`

**Typography:** Custom letterforms, display serif, 100% uppercase, tight tracking `-0.04em`

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                  K L O S E T                        │
│                                                     │
│  luxury fashion rental                              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 200" width="600" height="200">
  <rect width="600" height="200" fill="#FAF7F2"/>
  <g fill="#2C2C2C">
    <!-- K -->
    <path d="M40 160V40h18v46l38-46h22L76 96l48 64h-22L56 112v48H40z"/>
    <!-- L -->
    <path d="M108 160V40h18v104h60v16H108z"/>
    <!-- O -->
    <path d="M193 100c0 34 14 60 40 60s40-26 40-60-14-60-40-60-40 26-40 60zm18 0c0-24 8-44 22-44s22 20 22 44-8 44-22 44-22-20-22-44z"/>
    <!-- S -->
    <path d="M342 96c18-4 30-12 30-26 0-16-14-26-36-26-22 0-38 10-42 28h18c2-10 12-16 24-16 14 0 20 6 20 14 0 8-6 12-22 16l-8 2c-18 4-32 14-32 30 0 18 14 30 38 30 22 0 38-10 42-28h-18c-2 10-12 16-24 16-12 0-18-6-18-14 0-8 6-12 20-16l8-2z"/>
    <!-- E -->
    <path d="M396 160V40h72v16h-54v36h48v16h-48v36h56v16h-74z"/>
    <!-- T -->
    <path d="M492 160V56h-40V40h96v16h-38v104h-18z"/>
  </g>
  <text x="300" y="184" text-anchor="middle" font-family="'DM Sans', sans-serif" font-size="10" letter-spacing="6" fill="#C9A96E" text-transform="uppercase">luxury fashion rental</text>
</svg>
```

---

## Concept 2 — Monogram Logo (K)

**Name:** The Wardrobe Door

**Concept:** The letter "K" constructed from two angled wardrobe doors meeting at a central spine. The negative space between the upper and lower arms forms a subtle diamond — suggesting a precious gem or garment hanging in repose. The mark is pure geometry: straight lines, precise 45° angles, intentional voids. This works as a standalone icon, a watermark, and a pattern tile.

**Color palette:** Champagne gold `#C9A96E` on charcoal `#2C2C2C`

**Construction:** Each arm is a 6-unit-wide rectangle. The spine is 4 units. Angles are locked at 45°.

```
        ┌─────────────┐
       ┌│             │
      ┌││             │
     ┌│││             │
    ┌││││             │
   ┌│││││             │
  ┌││││││             │
  │││││││             │
  │││││││             │
  │││││││             │
  │││││││             │
  ││││││└──────────────
  │││││└───────────────
  ││││└────────────────
  │││└─────────────────
  ││└──────────────────
  │└───────────────────
  └────────────────────
```

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" fill="#2C2C2C"/>
  <g fill="none" stroke="#C9A96E" stroke-width="8" stroke-linecap="square" stroke-linejoin="miter">
    <!-- Top arm of K -->
    <line x1="50" y1="30" x2="50" y2="170"/>
    <!-- Spine -->
    <line x1="50" y1="100" x2="160" y2="30"/>
    <!-- Bottom arm of K -->
    <line x1="50" y1="100" x2="160" y2="170"/>
  </g>
  <!-- Negative space diamond highlight -->
  <polygon points="88,82 105,65 122,82 105,99" fill="#C9A96E" opacity="0.3"/>
</svg>
```

---

## Concept 3 — Luxury Icon Logo

**Name:** The Fold

**Concept:** An abstract icon representing a piece of folded luxury fabric — a saree or gown in its simplest geometric reduction. Three overlapping planes create depth through tonal variation in champagne gold. The form suggests both a garment on a hanger and the folded state of a returned rental. It is the visual embodiment of "wear and return" — a cycle of elegance.

**Color palette:** Three tones of gold — deep `#A68B4E`, mid `#C9A96E`, light `#E8D5B0`

**Usage:** Social profile, favicon, watermark, hang tag emblem

```
          ┌───────────────────────┐
         ┌│                       │
        ┌││                       │
       ┌│││                       │
       ││││                       │
       ││││                       │
       ││││                       │
       ││││                       │
       ││││                       │
       │││└────────────────────────
       ││└─────────────────────────
       │└──────────────────────────
       └───────────────────────────
```

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" fill="#FAF7F2"/>
  <g transform="translate(100,100)">
    <!-- Back fold (deep gold) -->
    <path d="M-40,-60 L40,-60 L60,-20 L-20,-20 Z" fill="#A68B4E"/>
    <!-- Middle fold (mid gold) -->
    <path d="M-20,-20 L60,-20 L40,30 L-40,30 Z" fill="#C9A96E"/>
    <!-- Front fold (light gold - the returned garment) -->
    <path d="M-40,30 L40,30 L20,70 L-60,70 Z" fill="#E8D5B0"/>
    <!-- Subtle crease line -->
    <line x1="-20" y1="-20" x2="-40" y2="30" stroke="#2C2C2C" stroke-width="1" opacity="0.15"/>
    <line x1="60" y1="-20" x2="40" y2="30" stroke="#2C2C2C" stroke-width="1" opacity="0.15"/>
  </g>
</svg>
```

---

## Concept 4 — App Icon Logo

**Name:** Kloset Monogram — App Mark

**Concept:** The signature "K" monogram from Concept 2, simplified and centered inside a squircle (rounded square with continuous radius). The background is a warm champagne gold gradient, evoking a precious metal surface. The mark is reversed out in warm white. This is designed for iOS and Android home screens, notification badges, and tab bar icons.

**Shape:** Squircle — rounded rectangle with `continuous` corner smoothing (CSS `border-radius: 22%`)

**Color palette:**
- Background: Linear gradient `#C9A96E` → `#B8965A`
- Mark: Warm white `#FFFCF8`

**Sizes supported:** `1024×1024`, `512×512`, `180×180`, `152×152`, `120×120`, `76×76`, `48×48`

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="appGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C9A96E"/>
      <stop offset="100%" stop-color="#A68B4E"/>
    </linearGradient>
  </defs>
  <!-- Squircle background -->
  <rect x="0" y="0" width="200" height="200" rx="44" ry="44" fill="url(#appGrad)"/>
  <!-- Monogram K in warm white -->
  <g fill="none" stroke="#FFFCF8" stroke-width="10" stroke-linecap="square" stroke-linejoin="miter">
    <line x1="55" y1="35" x2="55" y2="165"/>
    <line x1="55" y1="100" x2="155" y2="40"/>
    <line x1="55" y1="100" x2="155" y2="160"/>
  </g>
  <!-- Diamond accent -->
  <polygon points="90,82 105,67 120,82 105,97" fill="#FFFCF8" opacity="0.35"/>
</svg>
```

---

## Concept 5 — Premium Black-Gold Version

**Name:** Kloset Noir

**Concept:** The full brand lockup in its most prestigious form. The wordmark is set in all-caps, tightly tracked, with a thin champagne gold rule separating the brand name from the descriptor. This version lives on premium touchpoints: black packaging, tissue paper, embossed tags, VIP cards, and lookbook covers. The mark sits above the wordmark as a crown — the folded icon from Concept 3 rendered as a blind emboss (monochrome).

**Color palette:** Pure black `#0A0A0A` + champagne gold `#C9A96E` + warm white `#FFFCF8`

**Usage:** Premium packaging, credit-card inserts, lookbook covers, flagship store signage, VIP invitations

```

                          ◇
                         / \
                        /   \
                       /     \
                      /       \
                     /         \
                    ─────────────

                    K L O S E T
                    ─────────────
               LUXURY FASHION RENTAL
```

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300" width="600" height="300">
  <rect width="600" height="300" fill="#0A0A0A"/>
  <g transform="translate(300, 60)">
    <!-- Folded icon mark (simplified) -->
    <path d="M-30,-40 L30,-40 L40,-10 L-20,-10 Z" fill="#C9A96E" opacity="0.8"/>
    <path d="M-20,-10 L40,-10 L25,20 L-35,20 Z" fill="#C9A96E" opacity="0.6"/>
    <path d="M-35,20 L25,20 L10,40 L-50,40 Z" fill="#C9A96E" opacity="0.4"/>
  </g>
  <text x="300" y="145" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-size="48" font-weight="600" fill="#FFFCF8" letter-spacing="14">KLOSET</text>
  <!-- Gold rule -->
  <line x1="180" y1="165" x2="420" y2="165" stroke="#C9A96E" stroke-width="1"/>
  <text x="300" y="195" text-anchor="middle" font-family="'DM Sans', sans-serif" font-size="10" font-weight="500" fill="#C9A96E" letter-spacing="8">LUXURY FASHION RENTAL</text>
</svg>
```

---

## Logo System Summary

| Concept | Type | Primary Use | Mark | Colorway |
|---|---|---|---|---|
| 1 | Wordmark | Website header, primary brand signature | Custom letterform wordmark | Charcoal / Ivory |
| 2 | Monogram | Favicon, social avatar, watermark | Geometric K with door negative space | Gold / Charcoal |
| 3 | Icon | Hang tag, seal, pattern tile | Abstract folded fabric planes | Three-tone gold / Ivory |
| 4 | App Icon | iOS/Android home screen | K monogram in gold squircle | Gold gradient / Warm white |
| 5 | Premium Lockup | Packaging, VIP, lookbook, emboss | Icon + wordmark + gold rule | Black / Gold / White |

---

## Color Architecture

| Swatch | Hex | Role |
|---|---|---|
| Ivory | `#FAF7F2` | Primary background, print canvas |
| Champagne Gold | `#C9A96E` | Primary accent, monogram, icon, CTA |
| Deep Gold | `#A68B4E` | Shadow, depth, secondary gold |
| Light Gold | `#E8D5B0` | Highlight, tertiary accent |
| Charcoal | `#2C2C2C` | Primary text, UI surface |
| Noir (Premium) | `#0A0A0A` | Premium packaging, dark mode extreme |

## Typography Architecture

| Role | Font | Weight | Style |
|---|---|---|---|
| Wordmark / Display | Playfair Display | 600 (Semibold) | Uppercase, `letter-spacing: 0.08em` |
| Body / UI | DM Sans | 300–700 | Mixed case |
| Tagline / Meta | DM Sans | 500 (Medium) | Uppercase, `letter-spacing: 0.15em` |
| Monogram | Custom geometric | — | Constructed from 45° angles + straight lines |

---

## Anti-Patterns (Do Not)

- Do not use a generic hanger icon as the logo
- Do not use a dress form or mannequin silhouette
- Do not use sparkles, stars, or crowns
- Do not use purple/blue gradients (the "AI fashion" cliché)
- Do not stretch or distort the monogram proportions
- Do not place the wordmark on a busy photographic background without a scrim
- Do not mix the gold monogram with any accent color other than charcoal, ivory, or black
