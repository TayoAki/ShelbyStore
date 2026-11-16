---
name: Shelby
description: The Ball Box. One rope cap sold from a golf-ball box printed flat in two-ink flexo.
colors:
  base-ink: "#14213d"
  ink-2: "#3f4a64"
  ink-3: "#5d667c"
  paper: "#ffffff"
  wash: "#e7e9ee"
  crease: "#14213d59"
  clubhouse-navy-ink: "#2c4373"
  pine-ink: "#1e3b2f"
  pine-knockout: "#f1ece0"
  fescue-ink: "#cfc3a6"
  sleeve-red: "#c8302a"
  sleeve-red-tint: "#fbe9e7"
  in-stock: "#1d6a44"
  low-stock: "#a3341f"
typography:
  model:
    fontFamily: "Sofia Sans Extra Condensed, Sofia Sans Semi Condensed, ui-sans-serif, sans-serif"
    fontSize: "clamp(3.25rem, 1.9rem + 6vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.86
    letterSpacing: "-0.01em"
  panel-title:
    fontFamily: "Sofia Sans Extra Condensed, Sofia Sans Semi Condensed, ui-sans-serif, sans-serif"
    fontSize: "clamp(2.25rem, 1.6rem + 2.8vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.005em"
  figure:
    fontFamily: "Sofia Sans Extra Condensed, ui-sans-serif, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0em"
    fontFeature: "\"tnum\", \"lnum\""
  spec-line:
    fontFamily: "Sofia Sans Semi Condensed, Sofia Sans, ui-sans-serif, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.1em"
    fontFeature: "\"tnum\""
  lead:
    fontFamily: "Sofia Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Sofia Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Sofia Sans Semi Condensed, Sofia Sans, ui-sans-serif, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 650
    lineHeight: "1.1rem"
    letterSpacing: "0.08em"
  button:
    fontFamily: "Sofia Sans Semi Condensed, Sofia Sans, ui-sans-serif, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 750
    lineHeight: 1
    letterSpacing: "0.07em"
rounded:
  print: "2px"
  stripe: "3px"
  control: "4px"
  window: "28px"
spacing:
  keyline: "2px"
  crease: "1.5px"
  panel-pad-phone: "1.25rem"
  panel-pad: "2.25rem"
  box-gutter-phone: "0.75rem"
  box-gutter: "1.5rem"
  box-max: "90rem"
components:
  button-ink:
    backgroundColor: "{colors.base-ink}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 1.25rem"
    height: "3rem"
  button-keyline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.base-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 1.25rem"
    height: "3rem"
  button-keyline-hover:
    backgroundColor: "{colors.base-ink}"
    textColor: "{colors.paper}"
  button-add-to-bag:
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    height: "3.5rem"
    width: "100%"
  button-disabled:
    backgroundColor: "{colors.wash}"
    textColor: "{colors.ink-3}"
  field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.base-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0.75rem 0.875rem"
    height: "3rem"
  tag:
    textColor: "{colors.base-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.print}"
    padding: "0 0.5rem"
    height: "1.5rem"
  tag-edition:
    backgroundColor: "{colors.sleeve-red}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.print}"
    padding: "0 0.5rem"
    height: "1.5rem"
  panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.base-ink}"
    padding: "{spacing.panel-pad}"
  window:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.window}"
  ink-stripe:
    rounded: "{rounded.stripe}"
    height: "3rem"
---

# Design System: Shelby

## Overview

**Creative North Star: "The Ball Box"**

The site is a golf-ball box printed flat. Every page is one flattened box: a white coated board held inside a single heavy ink keyline, its panels butted edge to edge and separated by dashed fold creases. The cap is the model printed on the front panel and is seen only through a die-cut window; its measured spec runs down the side panel; the numbered holes and the Pair and Foursome sleeves are printed on the back. The page reads as packaging, not as a lifestyle hero over a grid of product cards.

Print is two-ink flexo. Navy is the base ink that sets type, keylines and the default front panel; each colourway's own ink floods whole panels; one sleeve-red is reserved for numbered editions. Type is one superfamily used the way a box is set: compressed bold caps for model names and every numeral, semi-condensed spaced caps for printed labels and controls, the regular width for running copy. Depth comes from the print, not from light: no drop shadows, no veils, no gradients.

Motion is one beat. Choosing a colour re-inks the front panel, swaps the window photo and recolours the rope and the crown drawing together on the same 0.42s exponential ease-out. Scrolling turns the box from its front to its side panel once. Nothing loops, ticks or scrolls on its own.

**Key Characteristics:**
- One flattened box per page: a 2px base-ink keyline round the whole, 1.5px dashed creases at every fold.
- Whole panels inked in a colourway's ink; type knocked out of dark inks.
- Photos only through die-cut windows (28px), never full bleed and never under text.
- Compressed 800-weight caps for model names, panel titles, prices and hole numerals.
- One braided rope line, in the chosen cap's rope colour, crossing the folds front to side to back.
- One motion beat (0.42s, cubic-bezier(.16, 1, .3, 1)) and one scroll-driven panel turn.

## Colors

Two-ink flexo on white board: a navy base ink everywhere, one colourway ink per panel, and a single red kept for numbered editions.

### Primary
- **Base Ink** (base-ink): the navy every page is printed in. Text, keylines, creases, the solid Add to bag on light panels, the footer flap, and the default front panel (Tour White prints on navy so the white cap sits in the window as a knock-out). Also the browser theme colour.

### Secondary
- **Colourway Inks** (clubhouse-navy-ink, pine-ink, fescue-ink): each floods an entire front panel when its colour is chosen, and pine carries The Foursome sleeve and long-form "stance" panels. Dark inks take knock-out type (white on navy, Pine Knockout cream on pine); Fescue takes base-ink type. Numbered editions add their own ink pairs (Azalea, Cypress, Haar) from the same colourway table in `web/src/lib/swatches.ts`, which is the normative source for every panel, knock-out and edge value.
- **Pine Knockout** (pine-knockout): the cream that type is knocked out in on pine.

### Tertiary
- **Sleeve Red** (sleeve-red): numbered editions only. The edition tag, the hole countdown's tag, the live-hole stripe. Never a sale colour, never decoration.
- **Sleeve Red Tint** (sleeve-red-tint): the ground of a live edition's unit on the holes plate.

### Neutral
- **Paper** (paper): the board and every uninked panel. The page ground is white.
- **Ink 2** (ink-2): secondary copy and figure captions on paper.
- **Ink 3** (ink-3): placeholders and disabled labels only.
- **Wash** (wash): disabled button fill and quiet rows.
- **Crease** (crease): base ink at 35% for dashed fold creases on light panels; dark panels re-set the crease to their knock-out colour at 40%.
- **In Stock / Low Stock** (in-stock, low-stock): status text only, next to a real stock count.

### Named Rules
**The Two-Ink Rule.** A panel is printed in at most its own ink plus one knock-out or base-ink colour. A second accent on a panel is a third ink and is not allowed.

**The Red Edition Rule.** Sleeve red appears only on numbered editions. If the thing is not a numbered hole, it is not red.

**The Whole-Panel Rule.** A colourway ink floods an entire panel or does not appear. No tinted strips, chips of ink on paper, or gradient washes; the ink stripes that choose a colour are the one place an ink sits small, and they are the colour control.

## Typography

**Display Font:** Sofia Sans Extra Condensed (with Sofia Sans Semi Condensed, ui-sans-serif)
**Body Font:** Sofia Sans (with ui-sans-serif, system-ui)
**Label/Control Font:** Sofia Sans Semi Condensed (with Sofia Sans)

**Character:** One superfamily set the way a box's print is set: the extra-condensed width shouts the model name and every number like a carton front, the semi-condensed width prints the small spaced-caps labels, and the regular width carries plain, warm running copy. There is no serif and no italic in this world.

### Hierarchy
- **Model** (800, clamp(3.25rem → 6rem), 0.86, uppercase): the product's name on a front panel and a sleeve's name. One per panel.
- **Panel Title** (800, clamp(2.25rem → 3.75rem), 0.92, uppercase): the heading of every other panel ("The crown sits lower.", "Six holes in 2027.").
- **Figure** (800, tabular lining, 1): prices (2.75rem on a panel, 1.75rem in the sticky strip), hole numerals (2.5rem on the plate), stock counts inline.
- **Spec Line** (700, 1rem, 0.1em, uppercase, tabular): the model's spec under its name, groups joined by " · " ("Mid crown · 11–11.5 cm · One size · No. 01"); breaks only after a dot.
- **Lead** (400, 1.125rem, 1.6): the paragraph under a panel title, max 56–60ch.
- **Body** (400, 1rem, 1.5): running copy; panel fine print at 0.9375rem / 1.5rem.
- **Label** (650, 0.8125rem, 0.08em, uppercase): spec plate keys, field legends, table heads, footer column heads.

### Named Rules
**The Compressed Numeral Rule.** Every price, hole number and count is set in the model face at 800 with tabular lining figures. Engineered digit cells (each digit in its own 1.5px keylined slot) are kept for the release countdown and measured counters only.

**The Heading Stands Alone Rule.** Nothing is printed above a heading. Tags and status sit in the spec line or meta line under it.

## Layout

The page is one box. On a phone it hangs 0.75rem in from each edge; from 48rem the gutter is 1.5rem; from 93rem it centres at a 90rem maximum. Inside it, panels stack edge to edge, each padded by the panel pad (1.25rem on a phone, 2.25rem from 48rem), and each fold is a 1.5px dashed crease, never a gap.

From 64rem the front and side panels open side by side as two equal columns in one row (the flattened box), joined by a vertical crease. Below that they stack, front first. The front panel is composed to put window, model name, spec line, ink stripes, price and Add to bag in the first phone viewport: the window takes clamp(240px, 100svh − 470px, 440px).

The one rope runs the reading order as a 14px braided cord: across the fold below the front and side panels on desktop; on a phone, a short crossing between the stacked front and side panels, a rail down the side panel's left edge, then the crossing into the back panel, so it stays one line.

Numbered things sit on a **plate**: a grid of units sharing 2px base-ink rules (holes in 2 → 3 → 6 columns; the spec in 1 → 2 → 3). A short last row simply stops. Content grids inside panels split 5:7 at desktop (window : copy). Internal rhythm uses 4, 8, 12, 16, 24 and 32px gaps.

### Named Rules
**The One Box Rule.** A page is one keylined box with creases, not a stack of separate cards with gaps between them. A new section is a new panel inside the box.

## Elevation & Depth

Flat. The system has no drop shadows and no elevation scale; depth is what printed packaging has: a heavier keyline round the box, dashed creases at the folds, and die-cut windows edged by a 1.5px inset ink line (in the panel's edge ink) so the photo reads as seen through the board. Dark inks advance, paper recedes. The one dimensional moment is motion, not light: as the side panel scrolls in it turns from a 10° X tilt (12° Y from 64rem) to flat, like a box being rotated in the hand.

### Named Rules
**The Printed Depth Rule.** Depth is drawn with ink (keylines, creases, window edges), never lit. No drop shadows, glows, blurred veils, or stacked layers.

## Shapes

Board is cut square with a slight die radius: 2px on printed tags, digit cells and focus rings, 3px on the ink stripes, 4px on buttons, fields and size buttons. Panels and the box itself are fully square (0). The only soft shape is the die-cut window at 28px, which is what makes a window read as cut through the board. Keylines are 2px solid base ink (1.5px on tags and window edges); folds are 1.5px dashed.

The cap itself is drawn, not iconed, where measurement matters: the side panel draws two cap profiles to one scale (11 units per centimetre) on a shared ruler baseline, the Rope Cap filled in the chosen crown colour with its rope, a 12 cm high crown dashed behind it.

### Named Rules
**The Die-Cut Rule.** Only windows are round. Anything else with a radius over 4px is not part of this box.

## Components

### Buttons
Printed ink blocks: spaced semi-condensed caps in a 2px keyline.
- **Shape:** gently cut corners (4px), 3rem tall, 1.25rem side padding; 2.25rem small, 3.25rem large, 3.5rem full-width Add to bag.
- **Ink (main CTA on paper):** base-ink fill, white type; hover deepens to #0b1427.
- **Keyline:** paper fill, base-ink keyline and type; hover fills with base ink and knocks the type out white. The outline variant is the same on transparent.
- **On ink:** on an inked panel the button is printed in the panel's knock-out colour with the panel ink as type (white on navy, cream on pine, navy on Fescue); hover dims to 94% brightness.
- **Active / Focus / Disabled:** press nudges down 1px; focus is a 2px base-ink outline at 3px offset (white on dark inks); disabled is wash fill, faint keyline, ink-3 type.

### Ink Stripes (colour control)
The front panel's colour picker is four equal stripes in a row (3rem tall, 3px corners), each painted in the cap's crown colour with a 5px band of its rope colour across it. The chosen stripe is ringed by a 2px panel-coloured gap and a 3px knock-out ring; the rest carry a faint 1.5px inset line. It is a radio group with arrow-key movement. Choosing one re-inks the panel on the beat.

### Tags
- **Printed tag:** transparent, 1.5px current-colour keyline, 2px corners, 1.5rem tall, 0.75rem spaced caps. Never a pill.
- **Edition tag:** sleeve-red block, white caps ("Hole 2 · 200 made"), same size. Only on numbered editions.

### Panels and the Box
- **Corner Style:** square.
- **Background:** paper, or a colourway ink set per panel (the panel exposes ink, knock-out, edge, button and crease colours together so everything inside re-inks at once).
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** inside the box, panels drop their own keyline and are divided by dashed creases.
- **Internal Padding:** the panel pad (1.25rem / 2.25rem).

### Die-Cut Window
Photo opening at 28px radius, white behind a contained product photo (6–8% inset), with an inset 1.5px edge in the panel's edge ink layered above the image. Photo arrows sit inside the window as small keyline buttons; the count is a figure on a white 2px-corner chip.

### Plate
A keylined grid of numbered units with shared 2px rules. Holes: a 2.5rem two-digit figure, the hole name, a label with its date or "Always in stock", and "Edition of 200". The spec plate: a label key over a body value.

### Inputs / Fields
- **Style:** paper fill, 2px base-ink-at-35% keyline, 4px corners, 3rem tall.
- **Focus:** keyline goes full base ink with a 3px base-ink-at-15% ring.
- **Error:** keyline in low-stock red.

### Navigation
A static top flap printed in base ink carries one line of real facts in small spaced caps (next hole, stock, shipping); nothing scrolls. Below it, a paper header with spaced-cap menu labels left, "SHELBY" set in the model face centred, and search, account and bag icons right; the bag count is a figure in a 1.5px keylined 2px tag. The footer is the box's bottom flap: a base-ink panel with knock-out type, the name in the model face, the tee-sheet form, and four label-headed link columns.

### Sleeves (The Pair, The Foursome)
Each is one inked panel: navy for The Pair, pine for The Foursome. A row of die-cut windows, one per cap; the sleeve's name in the model face; a spec line ("2 caps · $44 a cap · ships free"); the price figure and an on-ink button at the foot past a dashed crease.

### Crown Profiles (signature drawing)
Two side profiles on one ruler (0–12 cm, every second centimetre numbered in label type), drawn to the same scale. The Rope Cap in the chosen crown and rope colours in front; the 12 cm high crown dashed behind; each height marked by a hairline and a spaced-caps label. Fills transition on the beat.

### Sticky Add-to-Bag Strip
When the main Add to bag scrolls away, a paper strip with a 2px base-ink top keyline rises from the bottom on the beat: colour face, name and colour, price figure, ink button.

## Do's and Don'ts

### Do:
- **Do** keep each page inside one box: 2px base-ink keyline round it, panels butted edge to edge, 1.5px dashed creases at every fold.
- **Do** ink whole panels in a colourway's ink and knock the type out, taking every panel value from the colourway table.
- **Do** show product photos only through 28px die-cut windows with the inset edge line.
- **Do** set model names, panel titles, prices and hole numerals in Sofia Sans Extra Condensed 800 caps, numbers tabular and lining.
- **Do** print the spec as a spec line under the model name and as a keylined plate of units.
- **Do** run every state change on the one beat: 0.42s, cubic-bezier(.16, 1, .3, 1); colour, photo, rope and crown drawing change together.
- **Do** draw measurements to one honest scale on a shared baseline.

### Don't:
- **Don't** use drop shadows, glows, gradients, or veils over photos; depth is keylines, creases and window edges.
- **Don't** round anything but windows past 4px; no pills.
- **Don't** use sleeve red for anything but numbered editions.
- **Don't** print a label, kicker or eyebrow above a heading.
- **Don't** add tickers, marquees, looping motion, or a second scroll-driven effect; the panel turn is the one.
- **Don't** lay products out as a grid of floating product cards; put units on a keylined plate or a row of windows.
- **Don't** put text or tags on a photo.
- **Don't** add a serif, an italic, or a typeface outside the Sofia Sans family.
