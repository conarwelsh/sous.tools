PROJECT CONTEXT: @sous BRAND IDENTITY & DESIGN SYSTEM

1. CORE IDENTITY: "THE ATELIER"
   Concept: The intersection of Culinary Arts (Chef) and Software Engineering (Developer).
   Metaphor: The Kitchen as a Workshop (Atelier) / The Codebase as a Mise en place.
   Visual Tone: Precision, Dark Mode, Neon Accents, Technical but Organic.
2. VISUAL FUNDAMENTALS

Color Palette (Tailwind / CSS Variables):

- Background: hsl(240, 10%, 3.9%) (Approx #0B0B0E) - Deep, warm charcoal.
- Foreground: hsl(0, 0%, 98%) (White) - Primary text/lines.
- Brand Primary: #0091FF (Neon Blue) - Active elements, liquids, highlights.
- Brand Secondary: #FFFFFF (White) - Replaces "muted" for handles, headbands, prompts.
- Muted: #52525b (Zinc 600) - Subtle details (inner plate rims).

Environment States:

- Production: Brand Blue (#0091FF)
- Development: Emerald Green (#10b981)
- Staging: Purple (#a855f7)

Typography:

- Brand/Headings: Outfit (Weights: 700, 900)
- Code/Technical: Geist Mono
- UI/Body: Inter

3. THE "INVERSE FIDELITY" ENGINE (LOD SYSTEM)
   Icons must adapt geometry based on display size to maintain legibility and aesthetic balance.

LOD Level: Micro

- Size Range: 16px - 24px
- Padding Strategy: Tight (5%) - Maximize fill for browser tabs/trays.
- Design Rules: Remove fine details (rims, stems). Thicken strokes. Center key elements. Use abstract shapes for complex items (food blobs vs fruit).

LOD Level: Medium

- Size Range: 32px - 80px
- Padding Strategy: Safe (15-20%) - Standard breathing room.
- Design Rules: Standard fidelity. Balanced strokes.

LOD Level: Macro

- Size Range: > 80px
- Padding Strategy: Safe (20%) - Cinematic presentation.
- Design Rules: Add ornamental details (highlights, shadows, secondary rim lines, leaf stems). Unconstrained physics permitted where appropriate.

4. ICONOGRAPHY & DOMAINS (THE MATRIX)

A. The Core Brand (.tools)
Symbol: "The Morph" (Pot transforming into Cloud) or "Hat & Gear".
Logic: Represents the unified platform.

B. Sub-Brand Domains

1. sous.api -> "The Pot"

- Visual: A stockpot combined with a terminal window.
- Geometry: U-shaped pot body. Simple rim closure. Prompt is ">\_" (Caret + Underscore).
- Alignment: Top of Caret ">" aligns exactly with the pot's top rim.
- LOD Micro: Center ">" vertically. Hide "\_".
- LOD Macro: Standard placement.
- Animation (Subtle): Blink cursor.
- Animation (Loading): Caret ">" rotates 360 degrees around its center.

2. sous.atelier -> "The Flask"

- Visual: Erlenmeyer flask containing liquid and rising bubbles.
- Geometry: Triangle base, narrow neck, flared lip.
- Physics (Critical):
- Origin: Bubbles spawn at the absolute bottom of the liquid.
- Underwater: Bubbles are mathematically constrained to the funnel shape of the glass. Motion is fluid (sine wave), not jittery.
- Surface: Bubbles "pop" free upon reaching the top of the neck (y < pad) and spread outward/upward.

- LOD Micro: Liquid level @ 80% capacity.
- LOD Macro: Liquid level @ 50% capacity. Bubbles float freely outside the flask.

3. sous.docs -> "The Page"

- Visual: Document icon with folded corner + Food Illustrations (replacing code lines).
- Content Micro: Abstract organic blobs.
- Content Medium: Outline Apple & Carrot.
- Content Macro: Detailed Apple (Leaf) & Carrot (Stems).

4. sous.pos -> "The Terminal"

- Visual: Modern card reader (Squircle rect) + Credit Card.
- Animation: Card swipes vertically into the slot.

5. sous.kds -> "The Ticket"

- Visual: Kitchen Order Ticket with jagged bottom edge (sawtooth pattern).
- Content: Rectangular blocks representing order items.
- Animation (Loading): Item blocks flash in sequence.

6. sous.signage -> "The Display"

- Visual: 16:9 TV/Monitor on a stand.
- Content Micro: Abstract horizontal lines.
- Content Macro: The word "MENU" + Burger Icon.

C. Heritage Assets (Brand Variants)

"The Cloud" (Legacy)

- Visual: Chef Hat shaped like a Cloud sitting on a "plate" line.
- Geometry: Flat bottom, 3-hump top.
- Micro Fix: Scale UP significantly to fill 16px frame; hide the "plate" line.
- Animation (Subtle): Neon flicker (opacity).
- Animation (Loading): Self-drawing path (dash-offset).

"The Whisk" (Code)

- Visual: Wireframe whisk where the bulb is formed by "{ }" (curly braces).
- Geometry: Handle is White. Bulb is Brand Color.
- Animation (Subtle): Gentle rock (sine).
- Animation (Loading): Fast 3D spin on Y-axis.

"Hat & Gear" (The Mecha-Chef)

- Visual: Iconic Chef Hat sitting on top of a mechanical Cog (the "Head").
- Geometry:
- The Cog: Deeply nested inside the hat (y=72). Square teeth (50% tooth, 50% gap). Deep cut (r=15 inner, r=24 outer).
- The Hat: Solid fill (Background color) to mask the top half of the gear.
- Headband: Distinct white line separating Hat and Cog.

"Kitchen Line" (The Plate)

- Visual: Top-down perspective oval (Plate) with an EKG/Pulse line (Sauce/Garnish) inside.
- Detail: Inner rim line is Muted/Grey for depth.

5. IMPLEMENTATION NOTES (CANVAS/SVG)

- Drawing Order: Always draw background masks (e.g., Hat fill) before foreground strokes to ensure proper layering.
- Centering: For 16px icons, disable standard padding. Use "tight" mode to push strokes to the edge (1-2px padding).
- Animation Loops: Use requestAnimationFrame. Use "time" delta for smooth sine waves. Avoid Math.random() inside draw loops for position (causes buzzing); use it for initialization or phase offsets.
