# Teburu en Milan Uprising — technisch onderzoek

Onderzocht op 21 oktober 2026. Alleen openbare bronnen; geen app uitgepakt, hardware uitgelezen, SDK aangevraagd of overeenkomst geaccepteerd. Dit verslag vervangt eerdere aannames waar hieronder expliciet aangegeven.

## Einddoel en conclusie

Het einddoel is de officiële Milan-app, en later andere officiële releases, gebruiken met een virtuele tafel zonder fysieke spelonderdelen. De officiële app blijft eigenaar van verhaal, spelregels en campagne. Onze tafel moet uiteindelijk een toegestane invoer-/weergavebrug bieden. Een eigen spelimplementatie of losse sandbox vervult dit einddoel niet.

De openbare bronnen verklaren de werking op systeemniveau, maar leveren geen bewezen route om de officiële app een virtuele Core te laten accepteren. BLE UUID's, payloads, authenticatie, sessiehandshake, RFID-gegevensformaat en echte sensornummering zijn niet vastgesteld. Geen werkende bordemulatie geclaimd.

## 1. Core, sensoren en spelpositie

[S1 — Xplored Hardware](https://teburu.zendesk.com/hc/en-us/articles/25458765821979-Teburu-Hardware) beschrijft 40 magneetgevoelige sensorplaatsen in een 8 × 5 raster. De Core verzorgt RFID-identificatie en BLE naar de app. Eén sensor detecteert één miniatuur tegelijk; dat is geen maximum van één personage per spelzone. Na registratie kan een pion binnen de zone opzij, waarna een andere dezelfde sensor gebruikt. Het systeem onthoudt de logische spelpositie. Niet iedere fysieke miniatuur hoeft slim te zijn; appgestuurde stukken kunnen volgens de app worden neergezet en bevestigd. De hardwarepagina beschrijft algemene Teburu-werking, niet alle Milan-details.

**Toegepast:** tijdelijke sensorcontacten en blijvende zoneplaatsing zijn afzonderlijk gemodelleerd in een lokale inputsimulator. Sensor vrijgeven verwijdert geen personage. De interactiestudie laat vier demopionnen één zone delen. Vier is onze democapaciteit, geen bewezen Milan-spelregel. De oorspronkelijke één-pion-per-cel-demo blijft apart beschikbaar.

## 2. Identificatie en context

[S2 — Xplored Core/Board troubleshooting](https://teburu.zendesk.com/hc/en-us/articles/25458704157595-Troubleshooting-your-Teburu-Core-and-Board) onderscheidt de RFID-scan op de Core van positiedetectie op het bord. Een verkeerd actief personage kan verkeerde toewijzing veroorzaken. Bordoriëntatie telt; sommige sensoren zijn in een spelcontext niet actief.

**Gevolg:** een contact bevat niet automatisch een betrouwbare RFID-identiteit. Onze simulator gebruikt expliciete selectie van een synthetische demopion, zonder tags of echte identifiers. De echte identiteitstoewijzing en eventtiming blijven onbekend. A1–H5 blijft een zelfgekozen demonstratiemapping, geen officiële sensor- of Milan-locatiemapping. Een herhaald contact in dezelfde zone levert alleen een eigen interactie-intentie op; geen verzonnen Milan-actie.

## 3. Dobbelsteenradio versus BLE

[S3 — Nordic Semiconductor, 1 augustus 2022](https://www.nordicsemi.com/Nordic-news/2022/08/Xploreds-Teburu-employs-nRF52833-and-nRF52805-SoCs) beschrijft nRF52833 in het bord en nRF52805 met IMU in dobbelstenen. Dice en LED Ring gebruiken volgens die historische hardwarebeschrijving Nordic ESB op 2,4 GHz; de Core/bordkant gebruikt BLE richting app. Dit is fabrikantinformatie over het ontwerp van toen, geen garantie dat ieder later model of firmware identiek is. Een Bluetooth-adapter alleen betekent dus niet dat originele dobbelstenen rechtstreeks met onze browser communiceren.

**Toegepast:** alleen lokale RNG, geen nepverbinding met dice. Het Milan-interactieprofiel biedt d10. De neutrale referentiedemo behoudt d6/d10.

## 4. Wat de officiële Milan-app al kan

[S4 — Xplored versiegeschiedenis in de App Store](https://apps.apple.com/us/app/teburu-vampire-the-masquerade/id6739258011) vermeldt sinds versie 1.0.4 digitale worpen via het dobbelsteengebied van het Main Device tijdens checks. Versie 1.0.6 repareert digitale worpen; latere vermeldingen beschrijven Main/Controller en Remote-situaties. De 1.0.9-notities verplaatsen hardwarediagnostiek naar de aparte Teburu-app. Dit corrigeert de te algemene eerdere aanname dat altijd fysieke dice nodig zijn. Het bewijst niet dat de Core- of setupvereisten vervallen, of dat elke platformbuild gelijk werkt. De storebeschrijving blijft fysieke game en Teburu vereisen.

**Toegepast:** officiële digitale worpen zijn eerste te testen route; eigen worpen zijn alleen simulatorinvoer. In een echte appbrug mogen onze RNG en regels geen tweede autoriteit vormen. Historische instructies voor Hardware Test binnen de game kunnen verouderd zijn.

## 5. SDK bestaat, richting en toestemming nog niet bewezen

[S5 — officiële SDK-aanvraag](https://www.teburu.com/request-sdk/) is bereikbaar via de actuele site. [S6 — gelinkte overeenkomst](https://www.teburu.com/uploads/media/documents/policy/en_teburu_sdk_agreement.pdf) noemt vertrouwelijkheid, beperkingen op openbaarmaking en amateurgebruik. Er is niets aangevraagd of geaccepteerd. De SDK wordt aangeboden voor games ontwikkelen op Teburu; dat bewijst geen mogelijkheid of toestemming om de Core te vervangen voor een bestaande officiële app. Vertrouwelijke SDK-inhoud hoort niet in deze publieke repository.

**Volgende verificatie:** vraag via een door de gebruiker goedgekeurde route of een ondersteunde virtuele invoermodus, ontwikkelaarsbrug of bordloze testmodus voor bestaande games bestaat. Dit verslag is geen juridisch oordeel over rechten of interoperabiliteit.

## 6. Waarom een browserknop ‘Bluetooth verbinden’ dit niet oplost

[S7 — Chrome Web Bluetooth-documentatie](https://developer.chrome.com/docs/capabilities/bluetooth) beschrijft de browser als Central die verbinding maakt met GATT-servers. Dat is de richting om hardware uit te lezen. Het bewijst geen browserondersteuning om ons als een Core naar een officiële game-app te adverteren. Voor zo'n route kan een native/helper- of externe peripheral-laag nodig zijn; dat is een architectuurhypothese, pas te kiezen bij toegestane protocolinformatie en hostondersteuning. Er zijn geen verzonnen UUID's of BLE-writes geïmplementeerd.

## 7. Milan-componenten en appverantwoordelijkheid

[S8 — officiële fysieke inventaris](https://teburu.zendesk.com/hc/en-us/articles/25458904976667-Physical-components-VTM) noemt voor retail één d10, zeven karakterminiaturen, twee allies, twee ghouls, invloedskubussen en verschillende tokens. [S9 — officiële introductie](https://teburu.zendesk.com/hc/en-us/articles/25458903969819-Introduction-to-VTM-Milan-Uprising) noemt vier personages bij één tot vier spelers en Chronicle als campagne. Vier demopionnen hebben dus een onderbouwde groepsgrootte, maar vervangen niet de echte karakteridentiteiten of inventaris. Niet alle onderdelen zijn sensorgevolgde pionnen. Uitbreidingen veranderen de componentenset; daarom blijven releases apart configureerbaar.

De [openbare gamehandleiding](https://teburu.com/downloads/VtM/VTM_MU_GameManual.pdf) is lokaal geraadpleegd, inclusief visuele controle van pagina 9 en 12: verplaatsen gebruikt aangrenzende locaties; markers/kubussen vertegenwoordigen aanvullende toestand. Geen kaartafbeeldingen, scans of spelteksten zijn in de publieke broncode opgenomen. De aangrenzendheid en oriëntatie van de kaart zijn niet uit afbeeldingen geraden.

## 8. Officiële downloads

[S10 — actuele downloadpagina](https://www.teburu.com/game-apps/) biedt Milan-links. Windows-link https://xplo.red/VtM-Win-Download leidde bij een HEAD-controle naar https://teburu.com/downloads/VtM/BuildWindows/VTMTEBURU_v1.0.9.zip met HTTP 200. Alleen bereikbaarheid en bestandsnaam gecontroleerd; niet geïnstalleerd, uitgevoerd, inhoudelijk gevalideerd of herverdeeld. Voor Android: https://play.google.com/store/apps/details?id=com.xplored.teburu.vtm. Gebruik de officiële pagina voor actuele downloads; niet onze publieke repository als appdistributie.

## 9. Verdieping en beperkingen van het bronnenonderzoek

- Gerichte zoekopdrachten naar Teburu + GitHub/BLE/GATT/UUID/emulator/reverse engineering leverden geen geverifieerde openbare implementatie van een Milan-compatibele virtuele Core op. Dat is geen bewijs dat zo'n project nergens bestaat. Veel resultaten betreffen Japanse woordlijsten of een andere Teburu-app.
- Community-/Reddit SDK-verwijzingen zijn als zoekspoor gebruikt; technische implementatiekeuzes hierboven steunen op primaire bronnen.
- [S11 — Xplored octrooipublicatie WO2021019587A1](https://patents.google.com/patent/WO2021019587A1/en) beschrijft het concept van identificatie plus magnetische positiecontext. Een octrooi is geen shipping-protocolspecificatie of toestemming. Er zijn geen octrooiconclusies over juridische status getrokken.
- [S12 — historische Hardware Testing](https://teburu.zendesk.com/hc/en-us/articles/26772665489179-Hardware-Testing) beschrijft sensor-, dice- en LED-tests en het noteren van app/firmwareversies. Gebruik de nieuwere S4-diagnostiekroute eerst; bestaande instructies zijn versieafhankelijk.
- Geen vertrouwelijke Discord-inhoud, accountgegevens, geheime SDK-documenten of appbinary als bron gebruikt.

## 10. Beslispunten en acceptatie voor het echte einddoel

1. Controleer de officiële Windows-app via de normale UI: startscherm, Corevereiste, Main/Controller/Remote, digitale dice en eventuele toegestane handmatige invoer. Noteer versie en resultaat. Geen installatie/appwijziging in deze onderzoeksstap.
2. Verifieer bij Xplored of SDK/andere interface juist bestaande officiële apps ondersteunt en wat publiek gedeeld mag worden. Een SDK voor nieuwe games is niet automatisch onze bridge.
3. Pas bij een toegestane route: specificeer echte berichten, identities, sessiestart en respons; kies native of andere transportlaag op bewijs. Houd vertrouwelijke data buiten de publieke repo.
4. Bewijs met de ongewijzigde officiële app: campagne starten, toegestane karakterregistratie, bewegen/interactie, digitale worp, appgestuurde markers op onze tafel en sessie hervatten, allemaal zonder fysieke spelonderdelen.
5. Herhaal voor een andere release met alleen een nieuw profiel/adapterconfiguratie waar mogelijk. Pas dan spreken van een werkende digitale bordvervanger.

Tot die test blijft de status: lokale gedragsstudie, geen werkende officiële-appbrug. Een gebrek aan ondersteunde integratie wordt een expliciet haalbaarheidsprobleem, niet stilzwijgend een verschuiving naar een eigen spelclone.
