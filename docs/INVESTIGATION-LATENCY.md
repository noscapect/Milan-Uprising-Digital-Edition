# Investigation marker update latency

Updated 26 October 2026.

## Garibaldi placement and registration drift — 31 October 2026

The next report exposed a missing Garibaldi marker after the visible **Città Studi — Next Encounter in Garibaldi** outcome. Two routes failed: the encounter reader still required the observer's full-map geometry, and the image reader's 2,400-feature registration drifted by several pixels on the highlighted map. The latter could pass its map-anchor minimum yet miss most of the tightly bounded marker grid. The earlier scene-gate corrections alone did not address this registration error.

Encounter cards now use the shared recognized-feed eligibility, including the calibrated Masquerade layout when observer geometry is unavailable. Ordered destinations, unknown-destination rejection and the adapter's two-observation requirement remain in place. Image registration now uses 12,000 features while preserving the existing geometry, marker-position and matching tolerances. On the reported image this increased registered anchors from 46 to 427 and recovered all eight visible Investigation destinations, including Garibaldi, instead of only two.

The active recovery reader was updated to combine independently confirmed visual and explicit encounter outcomes, suppress superseded positive destinations and apply revision-checked marker-only corrections. It is bound to the existing adapter process; the integrated source is also staged in the portable adapter. Garibaldi was placed automatically, Città Studi remained empty, and the seven previous markers were preserved. The shared browser verified all destinations without JavaScript errors. No gameplay input, Core restart or app modification occurred.

Recorded-image regressions cover the highlighted Garibaldi map, the dimmed movement overlay and the Città Studi removal cross. They recognized the expected eight/six/seven positive markers respectively and the explicit removal, with 407–556 registration anchors and approximately 1.9–2.4 seconds per read on this PC. These are reader measurements, not guaranteed end-to-end timings. Public parser and real-adapter replay regressions cover first-read preservation, second-read placement, ordered relocation to a later destination, idempotence, unrelated markers and Restricted-token preservation. Private evidence remains under `private/placement-sync-recovery/`.

All 166 public tests passed with `--test-concurrency=1`. The initial broad `node --test` run discovered 546 tests including temporary copies and exposed one existing replay timing race: successive synthetic observations could share the same millisecond. The setup-tile replay now explicitly waits for distinct capture timestamps; its focused rerun passed alongside the encounter and full-adapter regressions.

## Recovery after setup and movement overlays — 31 October 2026

A reported table had no Investigation tokens while the official app showed several behind its movement dialog. Whole-frame OCR supplied no ordinary city-map geometry on this dimmed scene, so the general piece workers were neither scheduled nor consumed. The adapter now also accepts the complete movement prompt in its calibrated dialog bounds. Both workers receive the existing dimming-compensation flag; marker matching and positive removal recognition explicitly exclude patches covered by the dialog. Map registration, matching thresholds, two independent observations, freshness and input-generation checks remain required. Missing or covered icons never imply removal.

When the user exposed the normal map, the running adapter recovered eight positively observed locations: Barona, Cinque Giornate, Città Studi, Corvetto, Isola, Monumentale, Navigli and San Siro. The shared board rendered all eight without JavaScript errors. No gameplay or sensor input was sent and the Core was not restarted. The recorded movement image independently recognizes six uncovered markers; the other two were covered. A temporary recovery probe was stopped after checking the restored table. The integrated overlay correction is staged in source and the local portable adapter for its next start; this is distinct from the normal-map recovery already observed live.

Validation: `node --test` passed 543 discovered tests, including temporary copies. The public suites passed 163 tests with `--test-concurrency=1`. Focused tests cover calibrated prompt recognition, unsupported/error layouts, adapter application of stable Investigation observations during movement, Restricted-token preservation and idempotence. Private captures and logs remain under `private/investigation-recovery/`.

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

### Missed Città Studi removal — 31 October 2026

The follow-up to the Cadorna correction exposed a separate Investigation removal in Città Studi. The red-X reader recognized it correctly in two distinct captures, but no piece worker ran because portraits obscured the observer's map-border calibration. The earlier Cadorna correction had addressed Influence, Control and bonus cards without resolving this separate visual removal.

The piece-worker context now also accepts the calibrated city scene's complete Night/Hour, Suspicion and Masquerade headings. The image worker must still independently register the map artwork and pass the existing red-X shape and grid checks before producing a removal. This does not accept the observer's unclear Influence counters or weaken their full-map validation. Unsupported sizes, incomplete headings and error screens remain excluded.

A temporary reader is active for the current adapter process and stops when that process exits. It requires two independent captures, uses the existing board-instruction builder to preserve Restricted-side tokens, and submits only revision-checked table corrections. It removed the Investigation-side Città Studi token; all seven other markers remained. The browser verified both removal and preservation without JavaScript errors. No sensor input or Core restart occurred. The integrated correction is staged for the next adapter start. Private screenshots, reader output and logs remain under `private/cadorna-recovery/` and `private/investigation-recovery/`.

A recorded map showed the Investigation marker at Washington with Milan's red deletion cross, while the linked table still retained it. The existing positive marker reader intentionally did not remove anything merely because its normal icon was absent, but had no separate recognition for that explicit removal indicator.

The prepared reader now detects the red X at the independently calibrated Investigation grid position. It checks connected-component size, four diagonal arms, red-shape concentration, black outline and a bounded animation offset. Two matching observations in the same input generation are required. A deletion cross at an influence-counter position does not qualify. The resulting `removeInvestigation` instruction uses the existing atomic builder, which preserves Restricted-side tokens. Positive marker observations and older visible encounter destinations for that removed location are suppressed while the explicit removal is confirmed.

Recorded-image worker and adapter replay verify Washington removal, rejection of another generation, no removal for ordinary missing icons, preservation of Restricted and unrelated tokens, and idempotency. Removed physical token identities may be reused to represent other positively observed markers; correctness is checked by location and side rather than expecting a specific stock identity to remain unused. All 94 public tests and the encounter-transition regression pass.

For the current reported case, the existing confirmed component endpoint removed only the Investigation-side Washington token. A live browser check verified it was gone and the Portello marker remained, without app input or page errors. Automatic visual removal requires loading the updated adapter separately.
