# Contracten v1 — eerste doorsnede

## Uitbreiding 0.6 — benoemde kaart en atomaire opstelling

Afzonderlijk pakket `milan-city` versie `0.6.0`, profielschema 2. De retail- en demopakketten blijven behouden. Zones hebben optioneel `area` (ID), `attributes` (unieke IDs) en `sourceId` (bestaande bron). De presentatie kiest een eigen schematische indeling; deze velden maken geen sensorprotocol of aangrenzendheidsgraaf. `boardEvidence` en `campaignSetup` zijn versie-1-Milan-metadata; officiële beginstand en sensormapping zijn daarin expliciet onbewezen. Zie KAART-EN-OPSTELLING.md.

Nieuwe generieke opdracht `table.arrange {placements: [{componentId, zoneId}], faces: [{componentId, faceId}]}` vervangt alle plaatsingen en ficheszijden atomair. Niet genoemde onderdelen gaan naar voorraad; niet genoemde zijden krijgen hun eerste profielwaarde. IDs, duplicaten, zonecapaciteit en toegestane zijden worden gecontroleerd vóór commit. Bestaande events en worpen blijven behouden; de opstelling voegt één event en revisie toe. De applicatie biedt `arrange(payload)`. Undo/redo en export/import volgen dezelfde toestand en replay.

De afzonderlijke Milan-builder `buildCampaignArrangement(profile, input)` vertaalt handmatige setupinvoer naar deze generieke opdracht. Vier verschillende personages, lokale invoergrenzen en eindige retailvoorraden worden daar gecontroleerd. De engine kent geen factienamen of Milan-startregels. Een volledige matching wijst de controlefiches toe zonder ongewenste gulzige tekorten. Het formulier is geen automatische campagne- of regelmodus; `sandbox` blijft de enige modus.

## Uitbreiding 0.5 — retailinhoud en componentzijden

Nieuw profiel `retail-core` versie `0.5.0`, gegevensschema 2; schema 1 blijft geaccepteerd en oudere profielen blijven ongewijzigd. Schema 2 vereist `sources` (unieke id, titel, HTTPS-url), `componentGroups` (unieke id, label, optionele beschrijving) en per component een geldige `sourceId` en `groupId`. Optionele `color` en `shortLabel` zijn presentatiegegevens. `faces` is optioneel en bevat precies twee unieke `{id, label, color?}`-objecten. Bronnen en inventaris staan in MILAN-CONTENT.md. De collecties `characters`, `cards`, `tokens` en `scenarios` blijven gereserveerd voor latere inhoudsschema’s; deze fysieke personages en fiches staan in `components`.

Alleen schema-2-sessies krijgen `state.faces`, met voor elk tweezijdig onderdeel de ID van de actieve zijde. Beginwaarde is de eerste profielzijde, geen voorgeschreven spelopstelling. Nieuwe opdracht: `component.flip {componentId}`. Deze wisselt de zijde zonder plaatsing te veranderen; onbekende of eenzijdige onderdelen worden atomair geweigerd. De applicatie biedt `flip(componentId)`. Projecties leveren afgeleide `faceId`, `faceLabel` en kleur; de domeintoestand bevat uitsluitend zijde-IDs, geen kleuren of grafische objecten. Undo/redo, reset en gevalideerde import gebruiken dezelfde toestand/eventreplay. Het sessie-exportformaat blijft schema 1, met de bestaande exacte pakket-/moduleversiecontrole; oude profielen en exports krijgen niet stilzwijgend een `faces`-veld.

## Herstelgeschiedenis — aanvulling op 0.4

De applicatie biedt `undo()` en `redo()` met maximaal honderd lokale stappen. Geldige opdrachten en `reset()` bewaren de voorgaande onveranderlijke toestand. Fouten bewaren ook de bestaande herstelmogelijkheden. Een nieuwe geslaagde handeling wist de redo-reeks; opnieuw uitvoeren gebruikt de eerdere toestand en genereert geen nieuwe willekeur.

Herstelgeschiedenis is applicatietoestand, geen engine-event of Teburu-protocol. De projectie bevat `canUndo` en `canRedo`. Export bevat alleen de actieve sessietoestand en bijbehorende eventreeks. Een geslaagde import en het starten van een nieuw profiel beginnen zonder herstelgeschiedenis; een mislukte import verandert niets. Ongedaan gemaakte handelingen worden niet meegeëxporteerd. De UI biedt herstel uitsluitend op de handmatige tafel en het referentieprofiel; sensorcontact en inputtrace worden niet teruggedraaid.

## Uitbreiding 0.4 — virtuele tafel en hervatten

Componenten ondersteunen nu `kind: piece | cube | token` met dezelfde generieke plaats/verplaats/verwijder-opdrachten. Het type bepaalt uitsluitend de presentatie; geen Milan-regel of capaciteit wordt door het type opgelegd. Optioneel `shortLabel` is een presentatielabel. De inhoudscollectie `tokens` blijft leeg en gereserveerd voor latere spelgegevens; losse fiches zijn nu expliciete componenten in `components`, geen nieuw tokenschema.

Het nieuwe profiel `virtual-table` versie `0.4.0` gebruikt een synthetische werkvoorraad van vier pionnen, twaalf invloedskubussen en acht fiches; zonecapaciteit 32 is een werktafelkeuze. De veertig zones zijn eigen A1–H5-sensorlabels, geen geverifieerde Milan-locatiekaart. Referentie- en sensorstudieprofielen blijven behouden. De projectie levert ook zonecapaciteit en alle individuele bewoners; vormgeving blijft buiten de domeintoestand.

`restoreSession(saved)` ondersteunt nu `tabletop-session` schema 1 voor hetzelfde geregistreerde module-/pakket-ID en dezelfde versies. De applicatie voert de complete eventreeks uit vanaf een lege sessie en vergelijkt de gereconstrueerde toestand met de opgeslagen toestand. Volgorde, eventschema, actor, opdrachtvalidatie en vastgelegde worpen worden gecontroleerd. Alleen na volledig slagen wordt de lopende sessie vervangen. Geen nieuwe willekeur bij hervatten. Onbekende/legacyformaten, afwijkende eindtoestand en `inputSimulation` worden geweigerd. De browser begrenst het bestand op 2 MB; de applicatie accepteert maximaal 10.000 events. Sensorstudies kunnen nog niet worden hervat. Migraties en automatische opslag ontbreken. Dit is herstel van onze eigen tafel, geen import van officiële app-saves.

Onderstaande oudere doorsneden beschrijven de historische scope; deze uitbreiding vervangt de beperkingen tot uitsluitend `piece` en uitsluitend export.

## Uitbreiding 0.3 — lokale interactiestudie

Nieuw opdracht-type component.interact {componentId, zoneId}: vereist dat de pion al in de genoemde zone staat, legt alleen een intentie vast en verandert geen plaatsing. De sandbox voert geen Milan-actie of regel uit. Bestaande commandotypes en referentieprofiel blijven behouden.

De virtual-core-adapter gebruikt onze eigen expliciete demomapping en demopion-ID's. Register selecteert identiteit, touch maakt een eigen domeinopdracht en release beëindigt alleen tijdelijk contact. Contact moet worden vrijgegeven vóór volgende invoer/identiteitsselectie. Dit is een vereenvoudigde testworkflow, geen vastgestelde Core-statemachine. Capabilities tonen BLE/RFID/appverbinding als false. Trace is eigen simulatorlog, geen pakketdump.

Het interaction-study-pakket biedt d10 en capaciteit vier als demo-keuze; neutral-demo blijft ongewijzigd. Export krijgt bij de simulator een inputSimulation-veld naast de bestaande sessie-envelop. Import/herstel blijven niet ondersteund. Er worden geen officiële RFID-identiteiten aangemaakt, gekloond of geëxporteerd.

Vastgelegd vóór migratie. Scope: uitsluitend bestaande neutrale demo; geen nieuwe aannames over het fysieke spel. Engineversie 1, modulecontract 1, gegevensschema 1. Uitbreidingen vereisen expliciete versie- en compatibiliteitskeuzes.

## Inventaris en autoriteit

| Onderdeel | Status | Autoriteit |
| --- | --- | --- |
| 8 × 5 sensorraster | geverifieerd in ONDERZOEK.md | profieldata, geen engineconstante |
| Sensororiëntatie en Milan-locaties | onbekend | geen mapping geïmplementeerd |
| Vier pionnen en d6/d10 | bestaande synthetische demo, geen complete componentenlijst | lokale sandbox |
| Retailminiaturen, invloedskubussen en fiches | aantallen en identiteiten geverifieerd in uitbreiding 0.5 | afzonderlijk retailpakket, handmatige plaatsing/zijden |
| Kaarten, karakterstatistieken en scenario's | niet geïmplementeerd | geen beschermde verhaalinhoud; officiële app blijft beoogde autoriteit |
| Spelregels en beurtverloop | niet geïmplementeerd | alleen sandbox beschikbaar |
| Officiële app | niet verbonden | beheert geen lokale toestand |

Referentiesessie: plaats p1 op A1; verplaats naar H5; plaats p2 op A1; weiger p1 naar bezet A1 zonder mutatie; verwijder p2; voer vastgelegde d6-uitkomst 4 in; exporteer. Vergelijking met fysiek Milan blijft open.

## Gegevens en module

JSON-profiel bevat schemaVersion, gameId, releaseId, version, provenance, zones (id, label, capacity), components (id, label, kind), dice (toegestane zijdeaantallen), cards, tokens, characters, scenarios en presentation (grid met kolommen en zonevolgorde). Lege inhoudscollecties zijn bewust; hun verdere schemas worden vóór het vullen gespecificeerd. IDs zijn uniek. Geen scripts of externe assets. Presentatievelden worden niet naar de domeinstaat gekopieerd.

Een vertrouwde module bevat id, version, contractVersion, modes, setup(profile) en validate(state, command, profile). De applicatie registreert modules; er wordt geen willekeurige code uit JSON geladen. Deze eerste Milan-module biedt alleen sandbox; regelsmodus wordt expliciet geweigerd. Validate mag structurele checks aanvullen, nooit vervangen.

## Opdrachten en toestand

Opdracht: {type, actorId, expectedRevision, payload}. Eén lokale actor: local. Types: component.place {componentId, zoneId}, component.remove {componentId}, dice.record {sides, value}. Een geslaagde opdracht retourneert een nieuwe toestand met oplopende revisie en één event {sequence, schemaVersion, type, actorId, payload}. Validatiefouten gooien een fout zonder inputmutatie. Geen klok of willekeur in de engine.

Toestand: engineVersion, gameId, moduleVersion, packageVersion, mode, revision, placements (componentId → zoneId of null), events. Alles JSON-serialiseerbaar. De renderer krijgt een afgeleide kopie van zones, labels en bezetting, plus afzonderlijke presentatiegegevens. Alleen opdrachten wijzigen de sessie.

Export: format tabletop-session, schemaVersion 1, module-identiteit, pakket-identiteit en state. Alleen export in deze doorsnede; nog geen import, migratie of herstel. De oude demo-export blijft beschikbaar via de bewaarde legacydemo. Verwar beide formaten niet.

## Uitbreiding 0.7 — optioneel lokaal artwork

`GET /local-artwork/catalog.json` geeft een gefilterde catalogus met `available`, `assets`, `components`, `zones`, `groups`, `faces` en `branding`; ontbrekend/ongeldig lokaal pakket geeft `available:false`. Assetwaarden zijn uitsluitend lokale PNG-routes. Geen private bronpaden in deze response. `withArtwork` verrijkt alleen de afgeleide presentatie; engine, opdrachten en sessie-envelop veranderen niet. Locatiebeelden staan alleen aan voor het gecorrigeerde `city.json`-profiel 0.7.0. Zie [ARTWORK.md](ARTWORK.md).


## Presentatie-uitbreiding — fysieke tafelweergave

Geen wijziging aan engine-, profiel- of saveversies. De bestaande gecorrigeerde kaart 0.7 krijgt een optionele fysieke renderer met alleen presentatiegeometrie. De schematische renderer en oudere profielen blijven beschikbaar. `tabletop.subscribe(listener)` geeft een unsubscribe-functie en meldt geslaagde statewijzigingen, inclusief import en herstel; geen melding bij een geweigerde opdracht. De callback krijgt geen mutable domeintoestand. Dit is een eigen applicatiecontract voor andere invoerbronnen, geen app- of Teburu-protocol.

## Presentatie-uitbreiding — slepen

`installPieceDrag` vertaalt pointerinvoer naar één bestaande plaatsingsopdracht na loslaten op een ander bordvak. De preview verandert geen domeintoestand. Een optionele `tabletop.canMove(componentId)` kan invoer vooraf beperken; de adapter blijft verantwoordelijk voor opdrachtvalidatie en bevestiging. Tijdens slepen stelt de controller externe hertekeningen uit. Miniaturen blijven op de fysieke kaart zichtbaar ongeacht het aantal overige onderdelen. Engine, profielen en sessieformaat veranderen niet.

## Milan-module — expliciete invloedseindstanden

`buildInfluenceArrangement(profile, state, updates)` accepteert unieke `{zoneId, faction, count}`-combinaties voor stadsdistricten, met gehele aantallen van nul tot drie. De pure builder controleert voorraad en geeft `{changed, placements, faces}` terug voor één bestaande `table.arrange`-opdracht. Alleen de benoemde factie-invloed verandert; andere plaatsingen en zijden blijven behouden. De aanroeper slaat de opdracht over bij `changed:false`. Dit is overname van expliciete gegevens, geen automatische Milan-regels. Zie [dagfase-onderzoek](DAGFASE-AUTOMATISERING.md).

`buildBoardInstructions(profile, state, {influence, removeControl})` combineert dezelfde invloedseindstanden met expliciete controleverwijdering uit unieke stadsdistricten. Controleverwijdering verwijdert uitsluitend de betrokken controlefiches. Alle validatie gebeurt vóór de bestaande atomaire opdracht. De applicatie voert geen fase- of factiebeslissingen uit.

`createPollingWorker({run, interval, onState})` biedt een zelfstandige seriële achtergrondtaak. `start()` begint zonder browserverzoek; fouten worden gemeld en de volgende cyclus wordt opnieuw gepland. `stop()` wacht op de lopende cyclus en voorkomt vervolgruns. De private appadapter gebruikt deze generieke taak buiten engine en UI.
