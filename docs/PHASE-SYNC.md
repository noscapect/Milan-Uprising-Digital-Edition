# Day-phase synchronization

Updated 26 October 2026.

## Recognizing a scrolled day feed

The Android day screen can retain **NIGHT 1 DAY** at the top while its action feed scrolls past the initial “Day has begun” card. Whole-frame OCR also missed the dim word NIGHT in a recorded frame, leaving only “I DAY”. The former pipeline consequently classified a valid map as an unknown screen and did not update its influence counters.

The private observer now retries the fixed phase-title crop with increased contrast when whole-frame OCR misses NIGHT. It requires a recognized complete phase heading before using the recovery. Map calibration still verifies the visible map anchors and boundaries; a loose “DAY” word elsewhere on screen is insufficient.

The day-summary reader accepts the phase heading without requiring the initial feed card to remain visible. It recognizes explicit faction-control gains and bounded OCR substitutions O/0 and I/1 in influence counts. Unknown locations, invalid counts, and unsupported instructions remain blocked. Two matching observations are required before applying the visible changes.

## Text outcomes and map measurements

Explicit visible influence outcomes and control announcements can be applied even while an enlarged or animated cube prevents a consistent full-map measurement. This does not lower visual counter thresholds. A full visual map is accepted only when its counters and current instructions agree. Partial text updates do not establish a complete campaign snapshot.

Recognition of the day phase also resolves an outstanding final Haven placement through the existing phase-transition confirmation. No sensor input is replayed.

## Validation

The recorded scrolled screen produced these explicit outcomes: Ripamonti had zero Camarilla influence; NoLo, Bande Nere, and Solari each had one St. Ambrose influence; St. Ambrose controlled Solari. An isolated replay confirmed all five changes, preserved unrelated components, completed Aristide's pending placement into Haven 2R, and rejected unknown control destinations. Repeated observations did not change the revision again.

The live linked board was checked against the same displayed outcomes after the adapter restart. Its four influence updates, Solari control, and Aristide's Haven position matched, the pending request was cleared, and the full visual influence map was subsequently verified. The browser had no page errors. No gameplay input was sent during verification. The 86 public tests and the private day/night and movement regressions passed; the older night fixture was updated to use the current expansion profile.
