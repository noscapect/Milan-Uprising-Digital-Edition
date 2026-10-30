# Day-phase synchronization

## CityLife: isolate Control and exclude colored OCR icons — 30 October 2026

The live city feed showed four character moves to CityLife, Anarch Control, one Anarch Influence, and a Media Office bonus reveal. The moves had been applied, but Control and the bonus remained stale. OCR read the red cube as an extra `Z` in `CityLife has now Z 1 Anarch Influence` and read `Location` as `Locatiorv`. The former unsupported card also blocked the independent, correctly read Control announcement.

The calibrated reader now OCRs the feed's neutral light text separately from its colored symbols, preserving word coordinates. Both the Windows and bundled Tesseract backends read the recorded count and complete bonus phrase correctly after this preprocessing; no count is inferred from a malformed string. Independent positive Control announcements now have their own two-frame tracker. Only an unreadable Control card for the same district blocks that Control observation; an unreadable Influence card does not. A full-adapter regression proves the Control change applies while the malformed count remains unapplied, followed by the verified count and bonus after two clean observations.

The corrected reader is active in the current local installation. The compatibility worker reuses distinct timestamped observations already recorded by the adapter for named NPC and Control recovery, rather than taking extra map captures. Ordinary future adapter launches load the integrated guard. All thirty visible Influence counts and all positively recognized Control icons were compared with the current table without differences; the observed feed then had no synchronization issues. Local and LAN browsers confirm Anarch Control and the visible Media Office camera symbol. Milan stayed connected. All 150 public tests passed under Node 26 and bundled Node 22. This validates those observed categories, not a complete campaign snapshot or every possible app screen.

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

## Night-map recovery after clearing the table — 26 October 2026

A live Night 2 / Hour 1 screen exposed another header OCR failure: both the whole-frame read and the original header crop missed NIGHT. That prevented map calibration and all visual piece recovery after Clear board & resync. The private observer now retries a narrower text-only crop, excluding the calendar icon and phase dots. It still requires a complete recognized phase title, the existing map geometry checks, and matching observations.

The recorded failing frame now yields all 30 influence counters and 21 positive control observations. After restarting only the local adapter, live observation restored 50 components: 20 influence cubes, 21 control tokens, five Investigation markers and four characters. The four characters were confirmed at QT8 through explicit visible night-feed cards. A browser check confirmed their presence and no page errors; no scan, movement, dice input, or official-app change was sent. Hidden components and unsupported categories remain outside this recovery guarantee. All 88 public tests and the isolated map-recovery and scrolled-day checks passed.


## Additional character moves during encounters — 26 October 2026

The map feed can report completed character moves during an encounter without retaining the initial “Night has begun” card. The old phase-bound reader ignored these moves. A separate private reader now accepts complete, named “moved to” cards on the calibrated city map, regardless of the initial night announcement. It reads cards in displayed order and retains the newest destination for each character. A newer unreadable destination blocks that character's older destination. Requests to move are not treated as completed moves.

Two matching observations are required, and the resulting explicit moves use the existing atomic board-instruction builder. Stable visible portrait positions take precedence over conflicting historical feed cards. A character with a pending input request is excluded; unrelated confirmed moves can still synchronize. Other pieces remain intact, and no scan or sensor contact is replayed.

The recorded screen showed Rosa, Aristide, and Arianna moving from QT8 to Portello. Isolated tests verified the latest destinations, unknown-destination blocking, two observations, visible-map precedence, idempotency, and preservation of unrelated pieces. After restarting the local adapter, the live board showed all three at Portello and retained Jürgen at Washington. The browser had no page errors and sent no gameplay requests. All 88 public tests and the private day/night regressions passed. This validates the recorded completed-move cards, not every encounter instruction or an automatic choice of participants.

## Retaining explicit city-map influence outcomes

A subsequent live check found that Portello's 2 counter intermittently disappeared from table state: visual map readings alternated between zero and two while Milan's feed explicitly retained “Portello has now 2 Anarch Influence”. Increasing the rendered cube size did not address that separate synchronization issue.

The private adapter now reads explicit influence and control outcomes on calibrated city maps independently of the initial phase announcement. Two matching text observations can restore the count, and a contradictory full-map reading is rejected through the existing map-versus-instruction check. Isolated replay verified that repeated zero/two visual readings do not erase the confirmed two. This is limited to supported visible outcome cards; it does not infer hidden influence changes.

## “Move your character to any other Location”

The private adapter recognizes the recorded movement modal independently of the normal location screen. A bounded portrait read identifies the character in the modal; two matching observations enable that character only. For this request the adapter accepts another city district, rejects the current recorded district and Haven rooms, and uses the existing single sensor-contact/release route. It retains the old board position until Milan confirms the destination through a supported location screen, fresh visible map observation, or matching completed-move card. The adapter does not choose a destination.

On 26 October 2026 the recorded modal identified Arianna. Isolated checks covered portrait recognition, two observations, wrong-character/current-location/Haven rejection, contact release and confirmed commit. Live status and a browser check confirmed Arianna was movable; a drag was canceled with Escape without sending input or changing her position. All 88 public tests and existing input regressions passed. No live destination was selected by the agent; acceptance of the user's next move remains to be observed in Milan.

## Movement confirmation timeout reporting

A free-movement request for Aristide to City Life remained pending after Milan advanced to a check screen. That screen alone does not establish the accepted location. The adapter formerly reported the expired confirmation wait as an error, although the contact had already been sent and must not be replayed. The revised free-movement path returns an awaiting-confirmation result; the UI displays the pending message instead of claiming placement success. The prior position and duplicate-input block are retained until supported location evidence arrives.

Isolated input and browser checks passed, along with all 88 public tests. Activation of the server change is pending: automatic approval rejected the local adapter restart with “blocked by policy”, without a more specific reason. No restart workaround or repeated game input was attempted. The recorded request still needs a visible map/location confirmation; it must not be declared accepted solely because Milan continued to another screen.

## Last Haven placement followed by Sunrise companion cleanup

Arianna's pending Haven 3R request remained unresolved while the linked board still showed her at Washington. Milan had advanced to a calibrated map with explicit “Sunrise Phase has begun” and “Remove Fixer from map” cards. The previous confirmation policy expected another character's Haven prompt or Day, and missed this post-Haven cleanup scene.

The prepared private fix recognizes that bounded combination as a separate Sunrise companion-removal scene. Two matching observations can complete an already pending Haven move into its requested room, without inferring removal from a missing portrait or replaying input. Recorded-image replay verified the pending transition, rejection of missing phase/calibration, preservation of another character, and idempotency. All 88 public tests and existing input regressions passed. The server change remains unactivated because the earlier adapter restart was rejected by automatic approval; it must not be reported as live automatic coverage.

For the current user-reported case, the existing local confirmed-instruction endpoint corrected Arianna to the requested Haven 3R and cleared her pending request. A live browser check verified she was absent from Washington and present in Haven 3R, with no page errors and no official-app input sent.

## Day update blocked by “has flow” OCR — 26 October 2026

The background worker remained active and captured fresh Day frames, but one card read “Buenos Aires has flow O Camarilla Influence” instead of “has now 0”. The unsupported card blocked all five day outcomes and the full-map reconciliation. The prepared parser accepts the observed bounded now/flow substitution only within the existing exact influence-outcome grammar; location, faction and zero-to-three count validation remain required.

Recorded-frame checks read all five outcomes and reject unknown locations, out-of-range counts and other verbs. The 88 public tests and private day, pending-move and Sunrise regressions passed. The five current visible outcomes were copied through the existing confirmed-instruction endpoint: Camarilla influence zero in Solari, City Life and Buenos Aires, St. Ambrose influence two in NoLo, and Camarilla influence two in Duomo. A live browser check verified all five without game input. The permanent code correction still needs adapter activation; explicit restart approval was requested because the earlier automatic review rejected that action.

Activation follow-up: the user manually restarted the adapter. Live verification confirmed a new worker process, fresh successful observations, all five Day outcomes applied automatically, and full influence-map application. The browser matched all five outcomes without errors. Arianna remained in Haven 3R and no move request was pending. The previously prepared corrections are now loaded; the Sunrise transition and pending-input behavior retain their recorded/simulated validation limits until exercised live.

## General component placement follow-up

The recorded Night 3 Sunset card placed Agnese Della Luna at Cadorna. This named story miniature was absent because the previous readers covered characters, selected companion flows and markers, but not general named placements. The new component-outcome reader, validated arrangement builder, all-component correction controls and visible synchronization-issue reporting are documented in [placement synchronization](PLAATSINGSSYNC.md). All 90 public tests and the recorded/browser regressions passed. Activation still requires loading the updated private adapter; no full-app placement guarantee is asserted.

Placement follow-up activated: after the user's adapter restart, a new worker recognized Agnese's recorded card and automatically placed her on Cadorna. Live status and browser verification confirmed her miniature, no pending request or synchronization issues, and all 233 manual correction options. No gameplay input was sent. See PLAATSINGSSYNC.md for the validated automatic routes and remaining recognition limits.

## Faster feedback activation — 27 October 2026

The requested [faster feedback](SNELLERE-TERUGKOPPELING.md) is active after the user's adapter restart. Pending destinations are presentation-only, ordinary completed movement cards now confirm requests, and targeted location/portrait reads prioritize the requested character. Positive observations are tracked independently per component. Live timing fields confirm the new reader path is running. Contrast compensation on the masked movement-overlay path resolved an existing Orlando request at Portello automatically, without additional sensor input; a browser check confirmed the final state. Reader-only tests show seconds of remaining confirmation latency, so immediate preview must not be described as immediate app acceptance.

## Independent influence outcomes — San Siro

On 27 October Milan explicitly showed three Anarch influence at San Siro, while the table retained one. The reader recognized the three, but a separate Cadorna influence card lacked its count in OCR. The old city-summary guard rejected every outcome when any card was unsupported.

The prepared correction tracks recognized absolute influence outcomes independently. Two matching readings can update San Siro while Cadorna remains unresolved and visible as a warning. A malformed or duplicate card beginning with a known district's name blocks outcomes for that same district, preserving the prohibition on guessing a missing count. Different districts' recognized outcomes no longer wait for it. Full visual-map reconciliation retains its stricter consistency checks.

The current San Siro count was corrected through the existing confirmed-instruction route and a live browser check verified the displayed three without official-app input. Recorded-scene replay verifies two observations, independent application, preservation of Cadorna and other components, and idempotency. Public tests cover unrelated-card independence and blocking of ambiguous outcomes for the same district. The backend correction requires adapter activation separately from this live table correction.

Activation follow-up: after the user's restart, the new worker applied San Siro's independently confirmed three while the Cadorna missing-count warning remained present. A live browser check verified the displayed three, with no page errors or official-app input. All 94 public tests passed.

## QT8 location-bonus reveal

The QT8 **Possible Haven** feed card exposed another previously unsupported category: location-bonus reveals did not update the separate tile store. The current tile is now visible and verified in the browser. The prepared reader tracks explicit known reveal cards independently and applies the existing revision-checked tile operation after two matching observations, preserving actual Haven placement and other tile kinds. See LOCATIETEGELS.md for behavior and validation. Backend activation is separate from the current table correction.

## Washington Investigation removal

The reported stale Washington marker corresponded to an explicit red deletion cross on Milan's Investigation icon. The current token was removed through the confirmed component-copy endpoint. A separate positive red-X detector and per-marker two-observation removal path are prepared; Restricted tokens and unobserved markers remain preserved. See INVESTIGATION-LATENCY.md for recognition checks and recorded validation. The automatic backend path still requires activation.
