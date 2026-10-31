# Placement synchronization and manual corrections

The linked table copies observed official-app outcomes. It does not have a complete campaign-state interface. Hidden pieces and unrecognized app wording cannot be guaranteed to synchronize automatically.

## Named placements

The reader handles complete, known-component feed cards of the forms **[name] placed in [district]**, **placed at**, **moved to**, and **moved from [origin] to [destination]**. Completed player-character movement retains its separate reader and portrait-precedence rules. Explicit **Remove [name] from map** and **[name] removed from map** cards are supported. Cards are read in displayed order, the newest recognized instruction for each component wins, and an unreadable newest destination blocks an older placement. Two matching observations and calibrated map geometry are required. No missing-portrait inference is used.

### Agnese moved from Washington to Duomo — 30 October 2026

The observed four-line card `Agnese Della Luna / moved from / Washington to / Duomo` was previously ignored: only the shorter `moved to` form was recognized. A shared headless parser now matches complete known origin/destination names; splitting at the first `to` would incorrectly split Washington itself. Unknown newer routes suppress older placements. Known NPC movement is handled by the component reader without an erroneous unknown-character warning from the separate player reader.

Two fresh live observations confirmed the correction, and Agnese was copied to Duomo without sensor or official-app input. The temporary recovery worker handles named NPC outcomes while the existing adapter remains running; subsequent normal launches use the integrated parser. An isolated replay through the full adapter verified the two-read guard, preservation of an unrelated miniature and a Restricted token, and idempotence. The browser confirms Agnese in Duomo and absent from Washington. All 147 public tests passed with Node 26 and the bundled Node 22. General NPC portrait tracking on the ordinary city map remains unsupported; this fix relies on explicit feed outcomes.

Agnese Della Luna is a named story miniature in the inventory, not one of the scannable ally-role miniatures. Her recorded Sunset card, **Agnese Della Luna placed in Cadorna**, exposed the previous omission. The new reader and isolated adapter replay place her at Cadorna without scanning or sending movement to Milan.

## Any inventory component

Open **Pieces → Stock → Copy a placement or removal from Milan** when a placement is not recognized automatically. Search any of the 233 components, choose its confirmed district or Haven room and optional side, then use **Copy placement**, **Copy removal**, or **Copy side**. Verify the official app before copying. These controls change only our table; they do not deploy a miniature, spend Hunger, execute a game action, or send sensor input. Multiple identical markers have individual inventory identities; select the intended available token rather than inventing an extra copy.

Copies require the current table revision. Invalid identities, destinations, sides, duplicate components, and invalid companion occupancy are rejected before any state change. Other placements and sides are preserved. A deliberate manual correction for a miniature also clears its obsolete pending request without replaying input.

## Coverage and limits

### Cadorna Influence, Control and bonus — 31 October 2026

The official app showed Anarch Control, zero Anarch Influence and a Media Office reveal in Cadorna. The table retained old Anarch/Camarilla cubes and the other Control side. The observer supplied readable explicit outcome cards but no accepted full-map geometry, so the city-summary and bonus readers ignored them. These readers now share the established calibrated Masquerade-feed eligibility used by named miniature outcomes. This permits explicit known outcomes without treating unclear or covered map counters as a complete Influence map. Unknown layouts and network-error screens remain rejected; two independent observations are still required by the adapter.

Two recorded observations and two inspected images confirmed the Cadorna outcomes and absence of other Influence cubes there. The existing revision-checked component API removed the two obsolete cubes and recorded Anarch Control; the tile API recorded the visible Media Office bonus. The browser confirmed Cadorna's Control and absence of Influence cubes without JavaScript errors. No sensor or official-app input was sent. The corrected readers are staged for the next adapter start; the current session was corrected through the table-only APIs without restarting the Core. Private evidence is under `private/cadorna-recovery/`.

`node --test` passed all 544 discovered tests, including temporary copies. The focused parser test covers the observed OCR `O` for zero and rejection of unsupported displays/errors. The isolated real-adapter regression verifies first-read preservation, second-read Influence/Control/bonus updates, idempotence and preservation of another miniature and a Restricted token.

| Category | Current route |
| --- | --- |
| Player characters | App-led sensor input, completed-move cards, positively recognized portraits and supported Haven transitions |
| Named NPCs / story miniatures | Explicit named placement/removal cards; manual copy for other wording |
| Allies and ghouls | Confirmed deployment, supported setup portraits, Fixer map portrait, explicit named cards, Day cleanup; manual copy for other cases |
| Influence and Control | Calibrated visual readings, recognized absolute outcomes, and existing validation |
| Investigation markers | Positive visual markers and ordered encounter cards; other token sides are never inferred from absence |
| Other tokens and expansion pieces | Exact named cards when unambiguous, otherwise the all-component copy controls |

Unknown placement/removal cards and adapter validation errors are exposed as synchronization issues. The visible connection message directs the user to check an unsynchronized instruction. This is partial synchronization, not a claim that every current or future campaign screen is understood. Occluded portraits, pooled-token wording without an identity, arbitrary story instructions and unseen removals still require checking against Milan.

## Verification

On 26 October 2026 all 90 public tests passed. The new tests place and remove every component, validate sides and session replay, and check atomic rejection and preservation of unrelated pieces. Private recorded-image tests cover Agnese, two observations, explicit removal, unknown instructions and stale revisions. Browser fixture checks cover NPC placement, token placement and side, removal, and the visible warning. Existing character movement, influence retention, companion setup/cleanup, encounter-marker and map-recovery checks also pass. These isolated checks do not establish live acceptance of every official-app phase.

Activation and live verification are recorded separately after restarting the local adapter; source and tests alone do not establish that the running adapter has loaded this change.

## Live activation

After the user's manual adapter restart on 26 October 2026, the background reader recognized Agnese's card across matching observations and placed `npc-agnese-della-luna` at Cadorna automatically. Live status reported the outcome applied, no synchronization issues and no pending move. Browser verification confirmed the miniature on Cadorna, all 233 correction choices, filtering and a fitting mobile layout, without page errors or gameplay requests. Automatic coverage remains limited to recognized explicit outcomes and the existing supported visual readers; the all-component correction controls cover user-verified exceptions.

## NPC-opstelling bij hervatten — 28 oktober 2026

De private adapter herkent nu ook **Scenario setup → NPC placement**. De bestaande geometrisch gecontroleerde portretlezer zoekt daarbij NPC-iconen op de kaart. Twee gelijke waarnemingen plaatsen het herkende onderdeel op onze tafel; ontbrekende portretten verwijderen niets. Dit leest de zichtbare hervatopstelling, geen volledige campagnesave.

Live gecontroleerd op het geladen spel: Agnese Della Luna stond in Milan in Washington, terwijl onze tafel nog Cadorna bewaarde. Na activering corrigeerde de achtergrondadapter dit automatisch naar Washington. De browsercontrole bevestigde de miniatuur op Washington zonder paginafouten. De geïsoleerde NPC- en companionproeven en alle 94 publieke tests slagen. Andere NPC-portretten en verborgen delen van de geladen stand zijn niet met deze ene live proef gevalideerd.

### Ontbrekende setupplaatsingen — 31 oktober 2026

De volledige schermuitlezing miste de goudkleurige titel **NPC PLACEMENT** en startte daardoor de setup-portretlezer niet. De observer leest nu ook het vaste titelvak met een goudkleurmasker en accepteert uitsluitend de expliciet herkende titels NPC/Allies/Ghouls Placement onder Scenario setup. De portretlezer gebruikt meer beeldkenmerken: de gedetailleerde kaart verdrong eerder Helena's kleine portret uit het kenmerkenbudget. Geometrie-, schaal- en districtcontroles blijven behouden.

De correctie is in de lopende lokale adapter geactiveerd zonder appinvoer of herstart van de Core. Twee overeenkomstige live waarnemingen plaatsten Agnese in Duomo, Helena in Isola, Leandro in Calvairate en Ruslana in Corvetto. De gedeelde bordpagina toonde alle vier op hun bevestigde locatie, zonder JavaScript-fouten. De vastgelegde afbeelding is ook met beide OCR-backends gecontroleerd. Een geïsoleerde adaptertest controleert de twee-waarnemingenregel, idempotentie, behoud bij ontbrekende portretten en opeenvolgende NPC-, ally- en ghoul-setup. Live ally-/ghoul-setup blijft met deze NPC-proef onbewezen. Afbeeldingen, waarnemingen en runtimeback-up blijven onder `private/`.

Validatie: `node --test` slaagde met 542 ontdekte tests, inclusief tijdelijke kopieën. De publieke suites slaagden afzonderlijk met 162 tests en `--test-concurrency=1`; een eerdere gelijktijdige run had één tijdelijke `copyfile`-fout in een bestaande adaptertest.


## Unconfirmed character movement recovery — 30 October 2026

An unconfirmed character move no longer blocks subsequent characters indefinitely. Fresh, stable active-character feedback for another character abandons the old attempt without confirming its destination or replaying sensor input. When Milan remains on the original location screen for the same character, fresh stable origin feedback after eight seconds also releases the attempt. Missing observations, an error screen, an unchanged timestamp or an unstable character observation do not release it. These checks do not establish district adjacency or implement Milan movement rules.

The linked board now offers a visible **Milan did not accept this move · clear pending attempt** button. Rejection matches the exact miniature, destination and request timestamp, preserves confirmed positions, and does not allow manual acceptance of character moves. Companion acceptance remains separately validated.

Validation: all 159 public tests passed. An isolated Edge check verified the visible rejection button, exact rejection request and cleared pending preview without sending real game input. The current portable session received a temporary recovery guard using the same policies and existing revision-checked table-only API; subsequent launches load the integrated adapter. Private observations and recovery logs stay under `private/`.


## Masquerade character relocations — 30 October 2026

Completed player-character movement cards are now also read on the calibrated 2560 × 1600 Masquerade screen. Previously the reader required ordinary city-map geometry, so explicit movement outcomes on this event screen were ignored. Recognition requires the Masquerade heading and complete known-character/known-destination outcomes in the established right-hand feed. It retains two distinct matching observations; prompts to choose a destination, unsupported displays and error screens are not treated as completed movement. The Confirm button is not required because its OCR can disappear between captures.

The four visible Corvetto outcomes were copied using the revision-checked table-only API after two distinct app observations. No sensor, scan or dice input was sent. Private evidence remains under `private/masquerade-recovery/`. A temporary reader supports the running portable session; subsequent launches load the corrected integrated reader. The public suite passed all 160 tests before the final removal of the unreliable Confirm-button gate; the four focused reader tests also passed after that adjustment.


## Helena Varga placement and map-counter noise — 30 October 2026

A standalone map counter to the left of the indented miniature-card text was merged into Helena's placement, making the destination unreadable. The shared completed-outcome feed reader now excludes standalone numeric map counters outside that text lane. It preserves numbers within destination text or the card lane: unknown destinations still fail recognition. The same feed boundaries and Masquerade support are used for named component outcomes and player-character relocations.

Two distinct matching observations confirmed Helena at Isola and the existing revision-checked table-only API recorded that placement. No sensor input was sent. A temporary targeted reader supports this running session; the corrected integrated reader is staged in the portable installation for subsequent launches. The parser regression covers the observed counter, inline/within-lane unknown destinations and the event-screen layout. Private observations remain under `private/helena-recovery/`.
