# Gefaseerd ontwikkelplan

## 0 — Fundament (gereed)
- [x] Nederlandse documentatie en Codex-instructies.
- [x] Sensorindeling via fabrikant verifiëren; eigen notatie onderscheiden.
- [x] Lokaal 8 × 5 bord met pionnen, demo-dobbelstenen en export.
- [x] Domeinmodel isoleren en grenzen/bezetting testen.

## 1 — Compatibiliteitsroute onderzoeken (eerstvolgend)
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

Acceptatie: gebruiker kan starten, bord beheren en een sessie herstellen; compatibiliteitsstatus blijft zichtbaar. Volledige spelimplementatie valt buiten deze eerste scope.
