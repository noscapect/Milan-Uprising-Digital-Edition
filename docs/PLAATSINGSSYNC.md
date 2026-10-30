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
