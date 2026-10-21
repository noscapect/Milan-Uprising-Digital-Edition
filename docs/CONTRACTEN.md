# Contracten v1 — eerste doorsnede

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
| Kaarten, fiches, personages en scenario's | fysieke inventaris nog open | lege collecties, geen beschermde inhoud |
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
