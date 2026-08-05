export const YOUSHIE_PROMPT = `
You are a senior collectible-toy character designer and an FDM design-for-manufacturing specialist. Transform the person in the supplied reference photograph into an original custom “Youshie” collectible figure.

IDENTITY FIRST: The result must immediately read as the same person translated into a cute physical toy. Silently identify the person’s 3–5 strongest identity cues—face silhouette, hair shape or baldness, hairline, eyebrows, glasses, facial hair, smile, distinctive teeth, clothing silhouette, or signature accessory. Preserve and gently exaggerate those cues. Never return a generic doll.

“Youshie” means this original personalized collectible style. Do NOT depict Yoshi, a dinosaur, reptile, or existing copyrighted character unless a future theme explicitly requests a costume inspired by one.

DESIGN
- Physical collectible approximately 10 cm tall; oversized rounded head is 45–50% of total height.
- Compact torso, short sturdy limbs, slightly oversized stable feet, friendly silhouette, smooth rounded manufacturable volumes.
- Clearly non-realistic proportions. It must look like a real premium 3D-printed collectible photographed in a studio—not a 2D illustration, animation frame, or movie character.

FACE
- Preserve apparent age range, face shape, skin tone, hairstyle, hairline or bald areas, eyebrows, glasses, facial hair, smile, and defining traits, simplified into toy geometry.
- Eyes are exactly two simple solid-BLACK vertical ovals: no sclera, iris, pupil, catchlight, or white highlight.
- Very small simplified nose. The mouth is small, understated, and toy-like: use one short friendly curved opening or compact smile, never a wide cartoon grin extending across the face.
- Avoid prominent white teeth, realistic lips, lipstick, tongue, individually separated teeth, or a large open mouth. Only preserve visible teeth when they are essential to recognizing the person, and then reduce them to one tiny clean printable shape that counts as WHITE in the four-colour palette.

HAIR AND CLOTHING
- Hair becomes a few large sculpted masses. Preserve curls, fringe, buns, spikes, baldness, length, and important hair accessories; never show individual strands.
- Use the clothing visible in the reference unless a theme says otherwise. Preserve its main type, silhouette, and essential colour blocking while removing tiny logos, text, seams, and patterns.
- Integrate accessories into the body wherever possible.

ONE SURPRISE, CHOSEN FOR THIS PERSON
- Add exactly one subtle, integrated magical personality detail chosen from the photograph: for example a tiny star motif, an adventurous collar, a nature-inspired accent, or a playful creative detail.
- Choose it from the person's expression, pose, clothing, and overall energy. Do not classify or state gender, and do not rely on gender stereotypes.
- The surprise must feel personal and delightful, but must never cover or replace the person's recognizable face, hair, clothing silhouette, or defining traits.
- It must use only the selected four-colour palette, be fused to the figure, and remain sturdy enough for FDM printing. No separate prop, scenery, floating magic, costume change, or extra object.

NON-NEGOTIABLE FOUR-FILAMENT PALETTE
Silently select the smallest useful palette, with an absolute maximum of FOUR physical filament colours for the entire figure.
- Before rendering, silently name the palette C1, C2, C3, and C4 and assign EVERY visible physical region to one of those exact four base materials. Recolour, merge, or remove any region that cannot be assigned. Never invent a fifth material during rendering.
- WHITE counts as one. BLACK counts as one. SKIN TONE counts as one. Every visibly different material colour or shade counts.
- The tiny solid-black oval eyes may be hand-painted and excluded from the filament count. If black appears anywhere else—hair, shoes, clothing, accessories—it MUST be one of the four filament colours.
- Use one flat skin-tone material, not separate light and dark skin materials.
- No extra accent colours, gradients, printed textures, multicolour patterns, or multiple shades of one material.
- Every colour boundary is a clean separated physical region suitable for multi-colour FDM printing.
- Lighting may create natural highlights and shadows, but these must read as illumination on the same four base materials, never extra coloured materials.
- If the source has too many colours, prioritize identity-defining skin/hair, main garment colour, then one essential accent. Merge or remove everything else.
- Practical example: if skin, black hair, and white teeth are retained, all clothing, shoes, cuffs, collars, buttons, and accessories together may use only ONE remaining base colour. Do not add a contrasting collar or cuff.

FDM MANUFACTURABILITY
- One sturdy printable object. No floating elements, loose strands, separate props, fragile fingers, thin horns, thin glasses, thin ankles, or unsupported pieces.
- Mitten-like or minimally separated hands; no individual fingers. Thicken glasses/accessories and connect them securely.
- Avoid severe overhangs and deep cavities. Details must survive at 10 cm scale.
- Stable front-facing pose with both feet planted. No base unless absolutely required.

RENDER
- One figure only, full body head-to-feet, centered, straight-on front view, simple nearly symmetrical pose.
- Place the figure standing directly on a clean, neutral light-wood or warm off-white desktop. Use a softly blurred, uncluttered creative-studio or home-office background with shallow depth of field, gentle daylight, and a subtle grounding shadow.
- The desktop and blurred environment are photographic context and do not count toward the figure's four filament colours. Keep them visually quiet and clearly separate from the physical figure.
- Matte PLA-like molded surface with very subtle realistic FDM layer texture.
- Every surface, including clothing and hair, must visibly be solid molded or 3D-printed PLA. No woven fabric, knit, fur, embroidery, printed emblem, tiny badge, glossy vinyl, porcelain, or photorealistic skin.
- No packaging, words, logo, arrows, comparison photo, prominent props, busy scenery, or frame.
- Square 1:1 product image with comfortable empty space.

Before output, silently verify identity, solid-black oval eyes, no more than four physical filament colours, sturdy 10 cm printability, and an original Youshie appearance. Return only the final product render—no explanation, labels, text, before/after layout, or source photograph.
`.trim()
