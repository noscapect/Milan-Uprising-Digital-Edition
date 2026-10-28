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

## Automatic return at the end of nightly deployment

### Restoring placements after Load game

The private adapter also reads **Scenario setup → Ghouls placement / Allies placement**. These screens show existing campaign positions rather than a new Sunset deployment. Two matching, positively recognized map portraits restore the visible companions to the linked table without sending a scan or sensor input. Missing portraits do not remove other pieces. The recorded Fixer screen identifies City Life; other layouts and obscured portraits remain unverified. Continue through the setup in Milan after checking the board.

Deployment and removal are separate synchronization events. The original integration recorded deployment but did not synchronize the end of that deployment, leaving Fixer in City Life after Milan had reached Day and no longer showed him on the map.

The adapter now automatically returns deployed allies and ghouls to stock after two matching, calibrated observations of Milan's **NIGHT … DAY** phase heading. It covers all 15 companion types in the base and expansion inventory. No user removal action is required. Phase confirmation is independent of changing feed cards, so scrolling or animating influence outcomes do not keep companions on the board. Observations must belong to the same night and input generation; one frame, other phases, errors, and uncalibrated screens do not trigger this cleanup.

Only ally and ghoul positions are cleared. Characters, influence, control, Investigation/Restricted tokens, and their faces are preserved. Recruitment, Hunger, availability, and cooldown remain in Milan. Stale pending companion deployment requests are abandoned without replaying sensor input. Repeated Day observations do not produce repeated changes.

This policy handles the end-of-night return observed in the reported Day case. It is not evidence of automatic detection of every possible mid-night story-driven companion removal. A missing portrait on a partial map alone is not a removal signal.

### Optional correction outside the recognized Day flow

After verifying a removal in Milan, open **Pieces → Stock → Copy an ally / ghoul removal**, choose the miniature, and press **Copy removal from Milan**. Only currently placed companions appear in this selector. The action returns that miniature to our stock; it does not change Milan, recruitment, Hunger, or cooldown. The adapter checks the component category, expected location, current revision, and any pending placement for that miniature before accepting the change. Stale requests are rejected. Other pieces and faces remain unchanged, and the explicit removal is recorded privately for diagnosis.

The earlier manual Fixer correction used the user's confirmation. It has now been superseded for normal end-of-night cleanup by the automatic Day-phase route. The correction control remains optional for situations outside that recognized flow.

## State and responsibilities

The occupancy check uses the known board state. Miniatures that have not been observed or recorded may be missing, so this is not a complete campaign check. Milan remains responsible for recruitment, availability, Hunger, cooldowns, and bonuses; the local placement constraint does not execute these rules.

The public Milan module contains a headless destination validator. The private adapter handles screen recognition, sensor input, pending requests, and confirmation. Temporary reader contact remains separate from persistent board position. A pending request blocks repeat movement input until it is confirmed or rejected. Confirmations must match the pending miniature, destination, and request timestamp; stale and duplicate confirmations are rejected.

The inventory includes expansion allies and ghouls. This does not establish successful deployment in every expansion campaign. The selected deployment screen must be recognized before input is enabled. Original screenshots, OCR tools, and integration details remain in ignored `private/` storage.

## Validation

The recorded Android screen after Jurgen's scan showed **Allies**, **Ghouls**, **Cost**, and **Done**, rather than the preceding scan prompt. The adapter previously recognized only that prompt, leaving placement disabled after the scan. It now recognizes the selected deployment screen as well. A separate OCR pass reads the red role heading; **Fixer** was correctly read from the recorded Android screenshot. Confirmation dialogs do not enable placement.

The public suite passes all 79 tests, including companion occupancy, shared districts with player characters, and rejection of Haven destinations. Private tests cover sensor release, withholding unconfirmed positions, and rejecting stale or duplicate confirmations. Browser checks cover the district selector, active miniature, blocked destinations, explicit confirmation, and mobile layout. Adapter and browser acceptance checks use simulated responses and isolated state.

No live deployment was performed by the agent during the initial implementation checks and no Hunger was spent. During subsequent user play, Fixer was recorded in City Life and later reported absent in Milan's Day phase. The linked board loaded without browser errors after the local adapter restarts.

The removal tests use isolated state and mocked browser responses. They verify removal of the selected companion, preservation of other components and faces, stale-request rejection, idempotency for an already absent miniature, and the explicit UI action. Fixer's return from City Life to stock was then applied to the live linked table following the user's report; no sensor or official-app command was sent.

Automatic cleanup has separate tests: a recorded calibrated Day screen removes a deployed Fixer and an expansion ally without any user removal request, including while feed text is changing. A pending companion placement is cleared, other components are preserved, and repeated observations are idempotent. Public tests cover all 15 companion types and the refusal to clean up on unconfirmed or non-Day contexts. The full public suite now passes 88 tests. The live adapter exposes its confirmed phase and applied cleanup in board status; the current Fixer was already off board before automatic cleanup was activated.

## Recovering Jürgen on the active city map

The private map reader also restores Fixer (Jürgen) from a positively recognized, unobscured portrait on the calibrated active city map. Two matching portrait observations and a stable influence-map reading are required. This copies his existing app position to the linked table; it does not deploy him, send a scan/contact, or spend Hunger. Missing portraits keep the last position, occupied companion districts and Haven destinations are rejected, and Day-phase cleanup retains priority. Recognition of other companion portraits on this active-map path remains unverified.

Validation on 26 October 2026: a recorded Night 2 / Hour 1 image identified Jürgen in Washington; a separate image without him produced no Fixer placement. Isolated replay checked relocation, repeated observations, idempotency, missing portraits, unconfirmed observations, and invalid Haven destinations. The live adapter then restored Jürgen in Washington automatically, and a browser check confirmed his miniature was visible without page errors or gameplay requests. All 88 public tests, existing map recovery, and automatic Day cleanup passed.
