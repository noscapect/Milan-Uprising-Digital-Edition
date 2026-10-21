# Onderzoeksregister

Gecontroleerd: 21 oktober 2026. Openbare informatie bewijst geen interoperabiliteit.

## Bevestigde basis

Primaire bron: [Xplored — Teburu Hardware](https://teburu.zendesk.com/hc/en-us/articles/25458765821979-Teburu-Hardware).

Samengevat: het bord heeft veertig sensoren in een 8 × 5 raster, met 90 mm onderlinge afstand. De Core communiceert via BLE met apps. Miniatuuridentificatie via RFID gebeurt bij de Core; magneten dienen voor positieherkenning op het bord. Dit zijn verschillende functies. Dobbelstenen bepalen hun bovenzijde met accelerometers en sturen hun uitkomst via de Core door.

Dit bevestigt de hardwarelaag, niet dat Milan veertig speelbare locaties gebruikt, noch dat iedere locatie één sensor is. Onze A1–H5 labels zijn geen officiële identifiers.

De [officiële gamepagina](https://games.teburu.com/vtm-milan-uprising) beschrijft de rol van de game-app. De [uitgeversvermelding van de app](https://apps.apple.com/us/app/teburu-vampire-the-masquerade/id6739258011) stelt fysieke game en Teburu als vereisten. Geen bordloze modus geverifieerd.

## Open vragen en veilige verificatie

| Onderdeel | Nog onbekend | Eerstvolgende verificatie |
| --- | --- | --- |
| Core | ondersteunde SDK/API; sessiestatus; gelijktijdige clients | officiële ontwikkelaarsdocumentatie zoeken; eventueel later toestemming vragen aan fabrikant |
| BLE | GATT UUID's, rollen, berichten, authenticatie, timing | alleen gepubliceerde interface of geautoriseerde waarnemingen van eigen hardware; geen services/packets verzinnen |
| Bord | sensorindex, oriëntatie, events bij optillen, identificatie van nieuw geplaatste pion | officiële diagnostiek en eigen bord systematisch vergelijken |
| RFID | registratieproces, identiteit versus campagnegegevens, toegestane alternatieven | documentatie en normale scanflow observeren; geen tags kopiëren of schrijven |
| Dice | pairing, dobbelsteen-ID, type, ongeldige worp, timing | eigen d6/d10 via officiële diagnostiek testen; demo-RNG is geen vervanging |
| App | handmatige modus, externe invoer, reconnect, vereiste hardwarechecks | officiële app op gekozen platform met bestaande hardware testen |
| Milan | locatieprofiel, sensor/locatie-relatie, stapelgedrag | eigen legale bord/documentatie vergelijken; geen scans in repository opnemen |

## Ondersteunende primaire bronnen

- [Officiële handleiding](https://teburu.com/downloads/VtM/VTM_MU_GameManual.pdf): referentie voor latere spel- en locatieverificatie; alleen beperkte indextekst was via webextractie leesbaar, geen mapping uit afgeleid.
- [Teburu diagnostiek-app, Xplored](https://play.google.com/store/apps/details?id=com.xplored.teburu.app): fabrikant biedt controles van sensoren en dobbelstenen.

## Beslisregel

Een BLE-radio of bekend raster is onvoldoende om een Core te emuleren. UUID's, payloads, identity en eventuele beveiliging zijn hier niet vastgesteld. Er is nog geen ondersteunde API vastgesteld in dit onderzoek. Kies bij ontbreken van een toegestane integratieroute een handmatige companion/sandbox; claim dan niet dat het fysieke bord is vervangen. Geen app-extractie, firmwarepatching of beveiligingsomzeiling.
