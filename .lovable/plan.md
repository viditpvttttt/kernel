# Kernel premium redesign and reliability plan

## Outcome
Rebuild Kernel around the selected premium boutique direction while preserving the uploaded pearl RGB ambience, making account entry and chat reliably usable, and integrating the supplied media and illustration references.

## Build
- Replace the current symbol-led identity with the uploaded thin Kernel lettering across navigation, account entry, chat, footer, and favicon treatment.
- Restructure the landing page with Stripe/Ramp-style pacing: a focused editorial opening, interactive chat preview, product proof bands, illustrated capability scenes, and a cinematic download chapter.
- Place the first uploaded recording directly beneath the desktop download and web-app actions as the primary full-width product film, with restrained framing and playback controls.
- Add an interactive default chat modal built from the existing AI chat elements, with example messages, model context, composer, open/close behavior, and a clear path into the real web app.
- Enrich the ambience using the supplied RGB references: spectral edge lighting, thin chromatic paths, particle-field accents, soft bloom, grid texture, and focus-driven light—kept sparse and premium.
- Add original monochrome editorial illustrations with small spectral accents, inspired by the attached Claude-style reference without copying its artwork.
- Carry the same system into account entry and the authenticated chat: thin dividers, pearl surfaces, calm typography, deliberate user-message contrast, spectral focus feedback, and responsive mobile layouts.

## Reliability
- Fix account entry so email/password and managed Google sign-in complete cleanly and return to the intended public callback before opening chat.
- Fix chat startup so session resolution, thread loading, empty state, expired sessions, and query failures always resolve to a usable screen rather than an indefinite wake/loading state.
- Preserve private thread access, model switching, streaming replies, voice entry, thread search, rename, and delete behavior.

## Technical details
- Store the uploaded film through the project asset system and reference its generated pointer.
- Keep AI Elements as the transcript, message, loading, and composer foundation.
- Use semantic design tokens for the RGB system and respect reduced-motion settings.
- Keep all existing protected data access and row-level privacy rules unchanged.

## Verification
- Check landing, account entry, signed-out chat redirect, signed-in thread creation, message streaming, error recovery, modal interaction, film playback, and mobile/desktop layouts.
- Run the project checks and inspect the live preview for visual overlap, loading failures, and console errors.
