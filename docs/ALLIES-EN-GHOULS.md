# Optional ally and ghoul deployment

Updated 26 October 2026.

During Sunset, you may deploy available allies and ghouls to city districts, with at most one ally or ghoul per district. Their bonuses apply to that district and adjacent districts. Allies have a cooldown; ghouls cost Hunger. Milan determines availability, costs, and effects. Deployment is optional: use **Done** in Milan to continue without deploying anyone. See the [official game manual, page 12](https://teburu.com/downloads/VtM/VTM_MU_GameManual.pdf#page=12).

## Using the linked board

1. Open the deployment step in Milan and scan the miniature using the virtual Core reader.
2. Once the adapter recognizes Milan's selected ally or ghoul screen, a district selector and **Place in Milan** button appear above our board. Choose a district and press the button, or drag the scanned miniature onto that district.
3. The adapter sends the destination through the existing sensor input route. Haven rooms and districts containing another recorded ally or ghoul are blocked. A player character may share the district.
4. Check Milan for acceptance and any cost. Scanning alone does not establish a board position.
5. If automatic confirmation is unavailable, the board keeps the request pending. Use **Milan accepted this placement** only after verifying that Milan accepted the requested location and any cost. Otherwise, use **Milan did not place it**. These buttons resolve the existing request without sending another sensor contact.

To skip deployment, use **Done** in Milan and respond to its confirmation prompt. The board does not advance the phase or choose a miniature or destination for you.

## State and responsibilities

The occupancy check uses the known board state. Miniatures that have not been observed or recorded may be missing, so this is not a complete campaign check. Milan remains responsible for recruitment, availability, Hunger, cooldowns, and bonuses; the local placement constraint does not execute these rules.

The public Milan module contains a headless destination validator. The private adapter handles screen recognition, sensor input, pending requests, and confirmation. Temporary reader contact remains separate from persistent board position. A pending request blocks repeat movement input until it is confirmed or rejected. Confirmations must match the pending miniature, destination, and request timestamp; stale and duplicate confirmations are rejected.

The inventory includes expansion allies and ghouls. This does not establish successful deployment in every expansion campaign. The selected deployment screen must be recognized before input is enabled. Original screenshots, OCR tools, and integration details remain in ignored `private/` storage.

## Validation

The recorded Android screen after Jurgen's scan showed **Allies**, **Ghouls**, **Cost**, and **Done**, rather than the preceding scan prompt. The adapter previously recognized only that prompt, leaving placement disabled after the scan. It now recognizes the selected deployment screen as well. A separate OCR pass reads the red role heading; **Fixer** was correctly read from the recorded Android screenshot. Confirmation dialogs do not enable placement.

The public suite passes all 79 tests, including companion occupancy, shared districts with player characters, and rejection of Haven destinations. Private tests cover sensor release, withholding unconfirmed positions, and rejecting stale or duplicate confirmations. Browser checks cover the district selector, active miniature, blocked destinations, explicit confirmation, and mobile layout. Adapter and browser acceptance checks use simulated responses and isolated state.

No live deployment was performed and no Hunger was spent, as requested by the user. Acceptance of an actual ally or ghoul placement in Milan remains to be checked during play. The linked board also loaded without browser errors after the local adapter was restarted.
