# Recreate the supplied Figma design

## What will change
- Rebuild the main screen to match the supplied desktop and mobile screenshots: cream canvas, editorial headline, mural-led intro, compact header, three-choice vibe selector, outlined itinerary panel, mint total callout, and separate PayPal checkout.
- Preserve all existing behavior: AI-generated and custom itineraries, stop selection, dynamic totals, PayPal capture, and the digital pass confirmation.
- Adapt the same structure responsively so desktop uses the two-column introduction while mobile follows the stacked phone layout.

## Technical details
- Update `src/routes/index.tsx` structure and Tailwind classes while retaining the existing state and payment logic.
- Update semantic color, type, surface, and shadow tokens in `src/styles.css` to match the screenshots.
- Update the root font links in `src/routes/__root.tsx` for the editorial serif and clean sans pairing.
- Use the existing Austin friends image already stored with the app; the uploaded screenshots remain visual references only.
- Verify the page at desktop and mobile widths, including vibe switching, stop totals, custom generation states, and PayPal rendering.
