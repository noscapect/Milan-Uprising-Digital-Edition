# Gefaseerd ontwikkelplan

## Hoofddoel en eerstvolgende integratiemijlpalen

Bijsturing op 22 oktober 2026: bouw actief aan de virtuele fysieke tafel; fabrikantcontact is geen voorwaarde voor deze ontwikkeling. Onderzoek naar een echte emulator mag zelfstandig verder op beschikbare informatie, binnen de bestaande grenzen voor beveiliging en assets. Appcompatibiliteit blijft afzonderlijk te bewijzen.

- [x] Handmatige virtuele tafel met afzonderlijke pionnen, invloedskubussen en fiches, gedeelde zones, voorraadbediening en JSON-herstel voor hetzelfde profiel; zie CONTRACTEN.md uitbreiding 0.4.
- [x] Ongedaan maken en opnieuw uitvoeren van maximaal honderd lokale handelingen, inclusief leegmaken en behoud van worpuitkomsten; herstelgeschiedenis gescheiden van domeinevents.
- [x] Voeg de brongecontroleerde retailvoorraad toe met echte personage-/NPC-namen, factiekubussen, fichecombinaties en omkeerbare fiches; behoud aparte demo’s. Zie MILAN-CONTENT.md.
- [x] Voeg de dertig districtslabels en tien Havenvelden toe in een apart schematisch profiel, met handmatige opstellingsinvoer en atomaire voorraadtoewijzing. Zie KAART-EN-OPSTELLING.md.
- [x] Herontwerp de UI rond de fysieke kaart met volledige schermbreedte, compacte voorraad/locatie/sessie, zoom en apart voorbereidingsvenster; koppel repaint aan sessiewijzigingen voor toekomstige adapters. Zie TAFEL-LAYOUT.md.
- [ ] Verifieer de exacte retailkaartverbindingen, Havenwerking en officiële campagnebeginstand; de opstellingshulp is nog geen geverifieerde startpreset.
- [ ] Onderbouw Milan-locaties en de fysieke inventaris verder en vervang neutrale werkvoorraad/mapping waar geverifieerde gegevens beschikbaar zijn.
- [x] Vergelijk native BLE, remote/controller, SDK, logs/saves en vensterherkenning; voeg een read-only lokale randvoorwaardenprobe toe. Zie APP-KOPPELING-VOORONDERZOEK.md. Dit bewijst nog geen verbinding.
- [ ] Onderzoek zelfstandig welke echte appinvoer en terugkoppeling technisch beschikbaar zijn; houd de functionele tafelontwikkeling gaande.

De officiële Milan-app (later andere releases) moet uiteindelijk zonder fysieke spelonderdelen met de virtuele tafel werken. De app beheert regels en verhaal. Een eigen geautomatiseerde Milan-implementatie is optioneel en heeft lagere prioriteit dan een toegestane officiële-appbrug. De eerdere fasen hieronder beschrijven de tafelarchitectuur, niet de voltooiing van deze brug.

- [x] Verdiep openbare systeemwerking, appversiegeschiedenis, SDK-route en downloadbronnen; zie TEBURU-DEEPSEARCH.md.
- [x] Scheid tijdelijk sensorcontact, expliciete demo-identiteit en blijvende zoneplaatsing in een lokale simulatie; behoud referentieprofiel.
- [x] Voeg d10-interactieprofiel en herhaalde generieke interactie toe; geen echte sensor-/locatiemapping claimen.
- [x] Download en installeer op gebruikersopdracht de officiële Windows-build; leg statische metadata en beperkingen vast in INSTALLATIE-ONDERZOEK.md. Geen runtimevalidatie.
- [x] Bereid normale appvalidatie en gerichte fabrikantvragen voor; zie APP-VALIDATIE.md. Concept niet verzonden; tests niet uitgevoerd.
- [x] Inspecteer normale setupflow van de geïnstalleerde officiële Windows-app: Single/Main wachten op een Core, Controller vraagt een bestaande Main. Zie APP-VALIDATIE.md.
- [ ] Test de gedocumenteerde digitale dice zodra de voorafgaande setup bereikbaar is; nu geblokkeerd vóór campagneaanvang.
- [x] Neem de door de gebruiker beschikbaar gestelde SDK lokaal in en beoordeel deze statisch; alle bron en inhoudelijke bevindingen blijven onder private/sdk/.
- [ ] Valideer de private SDK-testproef en daarna de normale officiële appflow; leg runtimecompatibiliteit en een eventueel bruikbare verbinding afzonderlijk vast.

- [ ] Verifieer ondersteunde virtuele invoer of SDK-toepassing voor bestaande apps en voorwaarden voor publieke implementatie. De agent heeft geen aanvraag gedaan of overeenkomst aanvaard.
- [ ] Specificeer pas daarna een echte bridge: identiteit, positie/contact, sessiestart, capabilities en appgestuurde visuele updates; wijs regelautoriteit expliciet toe aan de officiële app.
- [ ] Bewijs campagne starten, interactie, worp en hervatten met ongewijzigde officiële app zonder fysieke spelonderdelen. Herhaal voor volgende release.

Huidige SDK-testblokkade: de passende Unity-editor is lokaal geïnstalleerd, maar stopt vóór import wegens ontbrekende actieve licentie. Normale activering door de gebruiker is gevraagd. Geen SDK-build of runtimecompatibiliteit bewezen; technische inhoud en logs blijven privaat.

De publieke SDK-aanvraag is gevonden. Dat voltooit niet het onderzoek naar een toegestane bridge. Onbewezen protocolstappen blijven open; geen verzonnen BLE-payloads of automatische SDK-aanmelding.

Bijgesteld op 21 oktober 2026: generiek tabletop-platform met Milan als eerste game-module. De eerdere uitvoeringsvolgorde hieronder is vervangen door de volgende drie fasen. Bestaande resultaten blijven behouden. De eerste sandboxdoorsnede is geïmplementeerd; geverifieerde Milan-reproductie blijft open. Zie CONTRACTEN.md.

## Fase 1 — Getrouwe digitale reproductie in 2D

### 1A — Eerstvolgend: specificatie vóór implementatie

- [ ] Inventariseer fysieke componenten, opstelling, handelingen en Milan-locaties met legale bronnen; markeer geverifieerd, onbekend en placeholder.
- [x] Definieer de bestaande demoreferentiesessie met pionnen en worpen; zie CONTRACTEN.md.
- [ ] Breid de referentiesessie uit met kaarten/fiches zodra inventaris, schemas en gebruiksrechten zijn vastgesteld. Verzin geen ontbrekende regels of scenario-inhoud.
- [x] Specificeer engineopdrachten, toestand, events, game-modulecontract en presentatieprojecties volgens ARCHITECTUUR.md.
- [ ] Specificeer versieerbare schema's voor borden, kaarten, fiches, personages, scenario's en releases met herkomst/rechten.
- [x] Leg vast welke toestand handmatig, door de Milan-module of eventueel door de officiële app wordt beheerd.

Acceptatie: reviewbare contracten en synthetische voorbeelden zonder Milan-afhankelijkheid in de kern; geverifieerde reproductiescope en open hiaten zijn traceerbaar.

### 1B — Kern, module en 2D-doorsnede

- [x] Migreer het bestaande prototype stapsgewijs naar engine, applicatie, Milan-module, data, UI, presentatie en adapters; behoud functies en regressietests.
- [x] Maak rastervorm, componenten, bezetting en dobbelsteentypen configureerbaar. Behandel 8 × 5 als sensorprofiel, niet als universeel spelbord.
- [x] Realiseer handmatige tafelopdrachten en bereid expliciete sandboxmodus voor.
- [x] Toets met een tweede synthetisch profiel met afwijkende geometrie/bezetting, zonder kernwijziging.
- [x] Rond browsercontrole en toetsenbordbediening af; de eerdere visuele controle is nu uitgevoerd, zie VALIDATIE.md.

Acceptatie: engine en module werken headless; UI en 2D gebruiken dezelfde opdrachten/projecties. Een neutrale doorsnede telt nog niet als geverifieerde Milan-reproductie.

### 1C — Reproductie verifiëren

- [ ] Vergelijk de referentiesessie stap voor stap met fysiek spel en toegestane officiële documentatie.
- [ ] Onderbouw locatie-, component- en actiegedrag; documenteer verschillen en ontbrekende informatie/rechten.
- [ ] Lever functionele handmatige 2D-reproductie van de geverifieerde scope met zichtbare beperkingen.

Acceptatie: ondersteunde fysieke handelingen hebben aantoonbare digitale equivalenten. Claim geen volledige reproductie of officiële appcompatibiliteit bij open hiaten. Ontbrekende inhoud blokkeert die inhoud, niet de generieke engine.

## Fase 2 — Automatisering en duurzame sessies

- [ ] Implementeer Milan-regels, beurten, kaartacties, doelen en validatie uitsluitend in de game-module, met bronverwijzingen en tests per regelgroep.
- [ ] Maak sandbox volwaardig met handmatige handelingen en structurele controles zonder volledige spelregelautomatisering.
- [ ] Voeg versieerbare opslag, gevalideerde import, migraties en herstel toe; behandel de huidige demo-export als apart legacyformaat.
- [ ] Bewaar worpuitkomsten/events en toets deterministische toestandsovergangen en replay.
- [ ] Overweeg AI na stabiele regels; AI gebruikt hetzelfde opdrachtcontract als spelers.

Acceptatie: regels zonder grafische dependencies, fouten zonder gedeeltelijke mutatie, hervatbare sessies en blijvend bruikbare sandbox.

## Fase 3 — Optionele visuele uitbreiding

- [ ] Voeg 3D toe boven dezelfde projecties; map logische zones naar presentatieposities.
- [ ] Voeg optionele animaties, effecten en interactieve omgevingen toe zonder regeluitkomsten van timing afhankelijk te maken.
- [ ] Behoud 2D en toets prestaties/toegankelijkheid.

Acceptatie: dezelfde referentiesessie en worpen leveren headless, met 2D en met 3D dezelfde toestand op zonder herschrijven van spelregels.

## Zelfstandig onderzoeksspoor — officiële app en Teburu

De eerdere compatibiliteits- en hardwaretaken blijven open en staan hieronder ter behoud. Ze mogen naast fase 1 lopen. Appbehoud blijft voorkeur; ontbrekende interoperabiliteit blokkeert de generieke kern of sandbox niet. Een echte adapter vereist een toegestane interface en reproduceerbare appvalidatie. Contracten en mocks bevatten eigen events, geen verondersteld Teburu-protocol.

## Bewaarde oorspronkelijke werkpakketten

Onderstaande nummers zijn historische werkpakketnummers, niet de nieuwe ontwikkelfasen. Opslag/gebruikersgemak schuiven naar fase 2; de eerdere uitsluiting van volledige regels is vervangen door bovenstaande fasering.

## 0 — Fundament (gereed)
- [x] Nederlandse documentatie en Codex-instructies.
- [x] Sensorindeling via fabrikant verifiëren; eigen notatie onderscheiden.
- [x] Lokaal 8 × 5 bord met pionnen, demo-dobbelstenen en export.
- [x] Domeinmodel isoleren en grenzen/bezetting testen.

## Werkpakket 1 — Compatibiliteitsroute onderzoeken
- [ ] Zoek officiële SDK/API, ontwikkelaarsondersteuning of gedocumenteerde alternatieve invoer. Leg ook een negatieve zoekuitkomst vast; geen API veronderstellen.
- [ ] Inventariseer met eigenaar appplatform/versie, beschikbare Core, bord en dobbelstenen wanneer hardwaretests nodig zijn.
- [ ] Controleer of de officiële app een bruikbare handmatige invoermodus heeft.
- [ ] Verifieer fysieke sensororiëntatie en mapping naar Milan-locaties met eigen hardware en officiële diagnostiek.

Acceptatie: bronnen en reproduceerbare bevindingen per route. Beslispunt: ondersteunde integratie, handmatige companion of alleen zelfstandige sandbox. Zonder toegestane route geen belofte van bordvervanging.

## 2 — Adaptercontract en simulatie
- [ ] Definieer transportonafhankelijk contract met beschikbaarheid, capabilities, errors en disconnects.
- [ ] Bouw mockadapter met fixture-replay van zelfgemaakte events.
- [ ] Test plaats/verplaats/verwijder, herverbinding en dubbele/vertraagde events.

Acceptatie: lokale mocks werken zonder hardware; eigen schema blijft expliciet onderscheiden van het werkelijke protocol.

## 3 — Toegestane hardwarevalidatie
- [ ] Alleen bij gedocumenteerde/toegestane interface: inventariseer BLE-services en vereisten op eigen apparaat zonder beveiliging te omzeilen.
- [ ] Bewijs correcte sensor-, identiteit- en worpverwerking; test eerst met behoud van echte Core en dice als die route wordt ondersteund.
- [ ] Leg vast of de officiële app de gekozen route werkelijk accepteert.

Acceptatie: reproduceerbare end-to-end sessie met echte app, versies en beperkingen. Stop bij ontbrekende toestemming of beveiligingsgrens. Geen firmwarewijziging of tagklonen.

## 4 — Bruikbare privétool
- [ ] Versiebeheer voor savebestanden, gevalideerde import, herstel en gebruikerstest.
- [ ] Alleen met toestemming eigen locatieprofiel/kaart toevoegen, inclusief herkomst.
- [ ] Installatie/starten vereenvoudigen; toegankelijkheid en grotere schermen toetsen.

Acceptatie: gebruiker kan starten, bord beheren en een sessie herstellen; compatibiliteitsstatus blijft zichtbaar. Regelautomatisering volgt nu in fase 2 van de herziene planning.
