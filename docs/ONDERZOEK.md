# Onderzoeksregister

Gecontroleerd: 21 oktober 2026. Openbare informatie bewijst geen interoperabiliteit.

Actuele runtime-uitkomst op 22 oktober 2026: de normale Windows-setup is inmiddels deels uitgevoerd. Single Device en Main Device wachten op een Core; Controller vraagt koppeling met een bestaande Main. Er is geen campagne gestart. Zie [APP-VALIDATIE.md](APP-VALIDATIE.md) voor de uitgevoerde stappen; eerdere passages over niet starten beschrijven de voorafgaande onderzoeksfase. De aangeleverde SDK wordt afzonderlijk en uitsluitend privaat getest.

Vervolg 22 oktober 2026: [statische controle van de officiële Windows-installatie](INSTALLATIE-ONDERZOEK.md) bevestigt Windows x64, Unity-runtime en de aanwezigheid van een Bluetooth WinRT-plug-in. Geen app gestart of officiële-appcompatibiliteit bewezen. De normale setupflow en digitale worpen blijven te testen.

## Verdieping en correcties

Vervolg kaartonderzoek op 22 oktober 2026: officiële bordfoto’s in Gamefound-updates 42 en 59 tonen dertig stadsdistricten naast tien Havenvelden. De districtnamen, globale plaatsing en attribuuticonen zijn verwerkt in een eigen schematisch profiel; geen foto/artwork overgenomen. De exacte grensverbindingen, sensorindex en volledige officiële campagnebeginstand blijven ongeverifieerd. [KAART-EN-OPSTELLING.md](KAART-EN-OPSTELLING.md) beschrijft de bronbewijzen en onderscheidt de nieuwe handmatige opstellingshulp van een echte startpreset.

Op 22 oktober 2026 is de openbare retailinventaris verwerkt tot een apart pakket met 132 losse onderdelen. De huidige officiële gamepagina onderbouwt de personagenamen; de handleiding is visueel gecontroleerd op pagina 6, 12 en 13 voor kleuren en onderdeelbetekenis. Zie [MILAN-CONTENT.md](MILAN-CONTENT.md) voor bronnen en de expliciete grens tussen geverifieerde voorraad en nog onbekende locatiekaart/opstelling.

Op 22 oktober 2026 zijn de publieke SDK-pagina, documentatie-index, systeemeisen, FAQ en Milan-versiegeschiedenis opnieuw gecontroleerd. De FAQ beschrijft remote deelname met fysieke hardware bij de host; dit is geen bordloze route. Een publieke invoerinterface voor bestaande apps is niet gevonden binnen deze controle. [APP-VALIDATIE.md](APP-VALIDATIE.md) bevat directe bronnen, een nog niet uitgevoerd testprotocol en niet-verzonden fabrikantvragen.

Zie [TEBURU-DEEPSEARCH.md](TEBURU-DEEPSEARCH.md) voor het uitgevoerde bronnenonderzoek en de toegepaste wijzigingen. Een officiële SDK-aanvraagroute bestaat; ondersteuning voor virtuele invoer in bestaande apps is niet vastgesteld. Sensorcontact, identiteit en blijvende spelpositie zijn afzonderlijke zaken. De één-pion-per-sensorgrens is geen universele één-pion-per-zonegrens. De officiële Milan-versiegeschiedenis noemt digitale worpen en nieuwere diagnostiek via de aparte Teburu-app. Oudere algemene hardwareclaims moeten daarom per appversie worden getoetst.

Einddoel: ongewijzigde officiële game-app gebruiken zonder fysieke spelonderdelen. Sandbox is een onderzoeksinstrument. Echte Core-emulatie en de terugkoppeling van app-toestand naar de virtuele tafel blijven onbewezen.

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

Een BLE-radio of bekend raster is onvoldoende om een Core te emuleren. UUID's, payloads, identity en eventuele beveiliging zijn hier niet vastgesteld. De SDK bestaat, maar is niet aangevraagd of beoordeeld als oplossing voor bestaande officiële apps. Zonder toegestane integratieroute blijft het einddoel onvervuld; gebruik sandbox alleen als expliciet tussenresultaat. Geen app-extractie, firmwarepatching of beveiligingsomzeiling.


## Vervolg: tweerichtingskoppeling, 22 oktober 2026

[APP-KOPPELING-VOORONDERZOEK.md](APP-KOPPELING-VOORONDERZOEK.md) vergelijkt de verbindingsroutes en beschrijft nieuwe statische aanwijzingen: BLE-/netwerk-/WebRTC-assemblies in het installatiemanifest en 45 locatie-presentatiebestanden. Geen bestanden of configuraties overgenomen als protocolmapping. Een read-only Windows-probe bewaart eigen randvoorwaarden en Bluetooth-capabilities uitsluitend onder `private/integration/`.

Voorkeursrichting voor onderzoek is een optionele native helper met afzonderlijke appinvoer en toestandsterugkoppeling. Normale appflow eerst testen; remote deelname en de SDK bewijzen nog geen bordloze sessie. Een BLE-Core-route alleen garandeert geen invloedstoestand. App niet gestart, gewijzigd of verbonden; er zijn geen serviceprofielen of officiële berichten geïmplementeerd. Het advies en de volgende experimenten vereisen geen voorafgaand fabrikantcontact.
