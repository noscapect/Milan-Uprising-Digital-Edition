# Investigation marker update latency

Updated 26 October 2026.

Investigation markers are read from the visible Android city map. Unlike directly recognized instructions or active-character location screens, this route needs image matching and two matching observations. The earlier worker started at most once every five seconds and completed investigation and portrait recognition together. A measured full pass took approximately 5.2 seconds, explaining delays beyond ten seconds for two observations.

## Changes

- Investigation markers have their own worker, independent of the slower portrait worker. Its minimum scheduling interval is one second; actual throughput also depends on capture and processing time. There is at most one investigation job and one portrait job running at a time.
- The independently aligned map supplies the expected marker grid. Matching searches small areas around those positions instead of scanning the whole map for each marker size.
- Map registration, marker size checks, positional tolerances, the acceptance threshold, and the requirement for two matching observations remain in place. Failed recognition resets the candidate rather than confirming a prior match.
- A private Linux dependency cache reduces repeated import overhead. The existing mounted private dependencies remain the fallback. This does not add public demo dependencies or alter the official app.

Results remain scoped to the current input generation and expire. The reader does not infer off-screen markers or a complete campaign state. Portrait observations retain their own stability and freshness checks, including the guards used to confirm pending moves without replaying sensor input.

## Marker transitions and pending moves

A later live report exposed two additional causes that faster image matching alone could not fix: visual recovery only added markers, and a pending character move blocked marker updates. The browser also stopped polling while its movement request was awaiting a response.

The adapter now reads ordered **Next Encounter in …** and **Final Encounter in …** cards in the visible Android city-map feed. Two matching OCR observations identify the latest destination for each recognized origin. When the same visible sequence explicitly supersedes an earlier destination, the adapter removes the old Investigation-side marker and records the latest destination atomically. It does not remove a Restricted-side token or infer removal from a missing icon. Unknown destinations invalidate that origin's sequence. A stale positive image result cannot re-add a destination superseded by a stable explicit sequence.

Positive marker observations and explicit encounter transitions no longer wait for unrelated character confirmation. Character movement guards remain in place. The browser continues polling and displaying authoritative session changes during a movement request. Since 27 October it also projects the requested destination with a visible pending marker; confirmed session positions remain unchanged until acceptance. See [faster feedback](SNELLERE-TERUGKOPPELING.md).

The live Sempione → Portello case was verified after these changes: no Investigation marker remained in Sempione, one appeared in Portello, and the other four recorded markers were preserved. The outstanding Aristide move was separately confirmed from his visible expansion-character portrait in Sempione, without resending input. This does not establish complete off-screen encounter tracking; sequences must be visible and recognized.

## Validation and limits

Using a recorded Android city-map screenshot, the independent worker produced its first investigation observation in 2.47 seconds and two matching observations in 4.79 seconds. These are measured reader timings, not a guaranteed end-to-end delay. Tablet capture, OCR, scheduling load, animations, and browser polling can add time.

Regression checks retain the expected Cinque Giornate and Washington assignments, reject the previous incorrect Buenos Aires assignment, and verify idempotent marker updates. The latency check verifies that one observation cannot confirm a marker and that another input generation cannot consume the result. Tests use recorded images and isolated state; no gameplay input is sent.


## Explicit visual removal crosses — 27 October 2026

A recorded map showed the Investigation marker at Washington with Milan's red deletion cross, while the linked table still retained it. The existing positive marker reader intentionally did not remove anything merely because its normal icon was absent, but had no separate recognition for that explicit removal indicator.

The prepared reader now detects the red X at the independently calibrated Investigation grid position. It checks connected-component size, four diagonal arms, red-shape concentration, black outline and a bounded animation offset. Two matching observations in the same input generation are required. A deletion cross at an influence-counter position does not qualify. The resulting `removeInvestigation` instruction uses the existing atomic builder, which preserves Restricted-side tokens. Positive marker observations and older visible encounter destinations for that removed location are suppressed while the explicit removal is confirmed.

Recorded-image worker and adapter replay verify Washington removal, rejection of another generation, no removal for ordinary missing icons, preservation of Restricted and unrelated tokens, and idempotency. Removed physical token identities may be reused to represent other positively observed markers; correctness is checked by location and side rather than expecting a specific stock identity to remain unused. All 94 public tests and the encounter-transition regression pass.

For the current reported case, the existing confirmed component endpoint removed only the Investigation-side Washington token. A live browser check verified it was gone and the Portello marker remained, without app input or page errors. Automatic visual removal requires loading the updated adapter separately.
