# Faster movement feedback and confirmation

Implemented 27 October 2026. The official app remains authoritative; no app or hardware change is required.

## Immediate presentation

A dropped miniature appears immediately at its requested destination with a dashed amber outline and a waiting badge. This is a presentation projection only. The confirmed session, exports and event history retain the previous position until Milan confirms the move. Other boards can display the same pending request received through status polling. A rejected input with no pending request restores the confirmed appearance. A timeout retains the pending appearance and duplicate-input block instead of claiming a successful placement.

## Targeted confirmation

During a pending character move, the observer first reads the ordinary location heading and active-character footer. It requires the undimmed navigation and the End Turn control; modals fall back to full OCR so error and movement dialogs are not mistaken for an underlying location screen. Existing character and district validation remains in place.

A separate target-character vision worker starts as soon as frames are available during a pending move. It does not wait for the general five-second portrait schedule and does not process unrelated portraits, companion templates or Investigation markers. The known movement-dialog rectangle is excluded from map registration and portrait matching. Its dimmed background receives bounded contrast compensation before matching; portrait and alignment acceptance thresholds remain unchanged. Without this exclusion, the large dialog portrait could be incorrectly interpreted as a miniature at an underlying map location. Map alignment, portrait thresholds, two positive observations, freshness and input-generation checks remain required.

Completed movement cards now confirm ordinary moves as well as the special any-other-location flow. Fresh matching evidence can confirm the requested character independently of unrelated scene stability. No second sensor contact is sent.

Positive character positions, named component instructions and visual Investigation positions are confirmed per item. An unrelated changed item does not reset another item's matching observations. Disappearance remains insufficient evidence for removal. A pending character no longer prevents copying a different positively recognized character's position.

## Measurements

Measurements use local recorded images and browser fixtures; they are not a guaranteed live end-to-end delay.

- Pending destination preview appeared in 4–5 ms after release in the browser fixture. The confirmed session remained unchanged; rejection, delayed confirmation and prevention of duplicate requests were verified.
- The target-only reader confirmed Rosa at Portello behind the recorded movement dialog after 4.45 seconds for two reads in the first run. A later run with dimming compensation and a live worker running took 6.95 seconds. It excluded the dialog portrait and rejected old evidence and a different input generation.
- Investigation marker confirmation remained about 4.75 seconds for two reads in its recorded-image check.
- Three warm/cold mixed location-reader runs gave medians of 442 ms for full OCR and 413 ms for bounded OCR. This is a small OCR improvement; the targeted scheduling and additional confirmation routes address larger waits.
- Three raw tablet captures took 1.49–1.56 seconds each. Capture, OCR, scheduling and animations still add latency beyond reader-only figures.

The observer exposes capture and reader durations in `observation.readTiming`; targeted map evidence includes its duration and confirmation state. Existing movement logs retain sent and confirmed times for later live comparison.

All 92 public tests passed, including per-item stability and immutable pending projections. Private checks cover ordinary movement cards, popup masking, focus fallback, generation/freshness guards, marker latency, component outcomes, rejected/pending/confirmed browser flows, and existing movement constraints. Activation of the private backend requires an adapter restart; live gameplay confirmation timings must be measured separately after activation.


## Live activation

The user restarted the adapter on 27 October. Live status exposed the new capture/reader timing fields and active target worker. A pre-existing Orlando request was initially still pending because the dialog dimmed his map portrait. After adding and testing contrast compensation within the known movement-overlay path, two positive target observations confirmed Orlando at Portello automatically and cleared the request, without new game input. A live browser check confirmed his position and removal of the pending appearance, with no page errors. This resolves a backlog request; its original sent-to-confirmed interval is not a new latency benchmark.


## Still-active movement at the origin

A later Arianna case was not a delayed accepted placement: the pending request named Bande Nere, but the calibrated visible portrait remained at Portello and the same character's any-other-location dialog remained active. The current table was corrected to that observed origin through the existing confirmed-instruction route, clearing the obsolete request without replay.

The prepared follow-up always obtains a fresh observation before sensor input rather than accepting a cached stable location screen. It can abandon an unconfirmed attempt only when the same character's recognized movement dialog remains active and two fresh positive origin observations have a pair beginning at least eight seconds after the original observation. It retains the observed origin, does not claim destination acceptance, and sends no input. Missing portraits, different characters, error screens, early observations and positive destination evidence cannot trigger this origin recovery.

Recorded-scene replay verified two observations, preserved another character and enabled the next move. Direct policy tests cover the negative guards. Existing input, preview and ordinary-card checks and all 92 public tests pass. This follow-up requires an adapter restart before it is active.

Activation follow-up: the user restarted the adapter. A new worker process returned fresh successful observations, no pending request or synchronization issues, and Arianna's movement enabled from Portello. The follow-up code is loaded; automatic origin recovery retains its recorded-replay validation scope until the next matching live case.

## Independent influence confirmation

Influence outcomes now also have independent observation tracking in the prepared San Siro follow-up. A missing count in one district is kept unresolved while a separate twice-read absolute count can be applied. Ambiguous or duplicate cards for the same district still block that district. This addresses a different cause from OCR speed: a correctly read outcome must not be discarded because another card is incomplete.
