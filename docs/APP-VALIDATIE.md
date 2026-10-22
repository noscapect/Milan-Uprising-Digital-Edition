# Officiële app — verificatieprotocol

Opgesteld op 22 oktober 2026. Status: normale Windows-setup deels uitgevoerd; gekoppeld spelen nog niet bewezen. Doel: de ongewijzigde Windows-app met een virtuele tafel gebruiken, zonder fysieke spelonderdelen. Dit protocol beschrijft onderzoeksvragen, geen veronderstelde appschermen of ondersteunde interface.

## Openbare bevindingen

- De [officiële systeemeisen](https://www.teburu.com/requirements/) noemen Windows 10 of nieuwer, minimaal 2 GB RAM en Bluetooth 4.1 of nieuwer. Dit zijn algemene eisen, geen geslaagde compatibiliteitstest van onze computer.
- De [officiële FAQ](https://www.teburu.com/faq/) beschrijft remote deelname met één fysieke Teburu bij de host. Dit documenteert geen volledig bordloze sessie.
- Dezelfde FAQ noemt lokale automatische opslag in een `SaveGames`-map. De precieze locatie en werking voor deze Windows-build moeten nog worden waargenomen. Maak onze eigen sessie-export niet gelijk aan een officiële app-save.
- De [SDK-aanvraagpagina](https://www.teburu.com/request-sdk/) richt zich op eigen amateurgames. De pagina bewijst geen virtuele invoer voor bestaande games.
- De [documentatie-index](https://www.teburu.com/documentation/) biedt algemene productdocumenten en een SDK-overeenkomst; daarin is geen publieke integratiehandleiding voor onze toepassing aangetroffen op de indexpagina.
- De [Milan-versiegeschiedenis](https://apps.apple.com/us/app/teburu-vampire-the-masquerade/id6739258011) beschrijft digitale worpen op het Main Device tijdens een ability check. Gebruik dit als Windows-testhypothese; platformgelijkheid is niet vastgesteld.

Gerichte openbare zoekopdrachten naar SDK/simulator en Milan/digitale worpen/remote op de officiële domeinen leverden geen aanvullende geverifieerde invoer-API op. Dit bewijst niet dat zo'n interface niet bestaat. Er is geen SDK aangevraagd of overeenkomst geaccepteerd.

## Uitvoering en bewijsvorm

Gebruik alleen normale UI-bediening en een afzonderlijke testsessie. Leg datum, Windows-versie, getoonde gameversie, downloadhash en aanwezige hardware vast. De downloadidentiteit staat in [INSTALLATIE-ONDERZOEK.md](INSTALLATIE-ONDERZOEK.md).

Noteer per test de werkelijk gekozen stappen, schermtekst, resultaat en eerstvolgende blokkade. Uitkomsten zijn `geslaagd`, `geblokkeerd`, `mislukt` of `niet uitgevoerd`. Een onbereikbaar scherm betekent `geblokkeerd`, niet dat de functie ontbreekt.

Eventuele screenshots, logs, apparaatnamen, identifiers en eigen hardwarewaarnemingen blijven uitsluitend onder `private/app-validatie/`. Neem geen appbestanden of spelinhoud op in publieke testfixtures. Publiceer hooguit een korte geanonimiseerde conclusie.

| ID | Handeling via normale UI | Vast te stellen | Huidige status |
| --- | --- | --- | --- |
| A01 | Start via de bestaande snelkoppeling | Bereikbaar startscherm en getoonde gameversie; eventuele opstartfout | Geslaagd: startscherm bereikbaar; UI toont V.1.0.9. |
| A02 | Bekijk de aangeboden setupkeuzes | Werkelijk beschikbare rollen, handmatige invoer en hardwarevrije opties | Geslaagd voor menukeuzes: Single/Multiple Devices, Main/Controller. Geen bordloze invoer in de bekeken instellingen. |
| A03 | Probeer een nieuwe testsessie zonder Core | Laatst bereikbare stap en expliciete hardwarevereiste | Geblokkeerd: Single Device en Main blijven bij Plug the board / Searching; geen campagne gestart. |
| A04 | Bekijk remote deelname als die wordt aangeboden | Vereist deze een actieve host of fysieke tafel? Geen joincode publiceren | Deels bekeken: Controller vraagt QR- of verbindingscode van een Main. Geen host gekoppeld; remote sessie niet getest. |
| A05 | Bereik een ability check via de aangeboden normale route | Klik op het dobbelsteengebied van het Main Device; noteer of de app zelf resultaten bepaalt | Geblokkeerd door voorafgaande setup; Windows-digitale worp niet getest. |
| A06 | Test registratie, plaatsing en herhaald contact via een gedocumenteerde invoerroute, als die beschikbaar is | Welke invoer accepteert de app zonder fysieke onderdelen? Zonder zo'n route: geblokkeerd | Geblokkeerd; geen werkende virtuele invoerverbinding. |
| A07 | Observeer een appgestuurde wijziging | Welke locatie-/marker-/componenttoestand kan via een ondersteunde route naar onze tafel? Alleen visueel zien bewijst geen adapter | Geblokkeerd; geen echte game-toestand ontvangen. |
| A08 | Sluit normaal af en hervat de testsessie | App bewaart en herstelt voortgang; daarna consistentie met de virtuele tafel vaststellen | Campagnehervatting niet uitgevoerd; er is nog geen campagne gestart. |

Geen firmwarewijziging, apppatch, verborgen debugmodus of verondersteld BLE-bericht gebruiken om een geblokkeerde test alsnog te laten slagen.

## Beslisregels voor vervolgimplementatie

- Alleen digitale worpen werken: de app kan worpautoriteit blijven; identiteit en tafelinteractie blijven afzonderlijke open problemen.
- Alleen remote deelname werkt: bruikbaar als companion bij een host, maar het doel zonder fysieke onderdelen is niet bewezen.
- Geen ondersteunde invoerroute gevonden: leg de exacte blokkade vast en laat Xplored de mogelijkheden verduidelijken. Geen transport implementeren op basis van DLL-namen.
- Een interface wordt gedocumenteerd en toegestaan: specificeer eerst identiteit, contact versus positie, sessiestart, capabilities, fouten/herverbinding en appgestuurde updates; pas daarna een adapter implementeren.
- Einddoel pas bewezen wanneer campagne starten, registratie/interactie, appgestuurde worp, tafelupdates en hervatten samen reproduceerbaar werken zonder fysieke spelonderdelen.

## Conceptvragen voor Xplored

Onderstaand concept is niet verzonden. Het vraagt uitsluitend om publieke informatie; het is geen SDK-aanvraag of acceptatie van voorwaarden.

Onderwerp: Ondersteunde virtuele tafel voor de ongewijzigde Milan Uprising Windows-app

Wij onderzoeken een onafhankelijke virtuele tafel die de officiële Milan Uprising-app eigenaar laat van regels, verhaal en campagne. We gebruiken de officiële Windows-download met archiefnaam 1.0.9. Het doel is spelen zonder fysieke Teburu, miniaturen of dobbelstenen, met behoud van de ongewijzigde officiële app.

1. Biedt deze bestaande app een ondersteunde bordloze modus, handmatige invoer, virtuele Core of ontwikkelaars-/testinterface?
2. Is de aangeboden Teburu SDK hiervoor geschikt, of uitsluitend voor het ontwikkelen van nieuwe games op fysieke Teburu-hardware?
3. Zo ja: welke publieke documentatie beschrijft sessiestart, karakteridentificatie, positie/interactie en appgestuurde updates naar een externe tafel?
4. Kunnen digitale worpen in de Windows-app zonder fysieke dice worden gebruikt, en blijven daarvoor een Core of andere hardwarechecks vereist?
5. Wat mag in een openbare onafhankelijke implementatie worden gedeeld, zonder vertrouwelijke SDK-inhoud of beschermde spelassets op te nemen?
6. Als deze route niet wordt ondersteund: bestaat er een officieel alternatief dat wel bij dit doel aansluit?


## Uitgevoerde normale Windows-controle

Op 22 oktober 2026 is de ongewijzigde Windows-app normaal gestart en via de zichtbare menu's bediend. De eerste-startmelding is met expliciete gebruikersbevestiging afgehandeld. De versieaanduiding op het setupscherm is V.1.0.9. Single Device en Multiple Devices → Main Device leiden naar de Core-zoekstap. Multiple Devices → Controller Device toont koppeling via een QR-code of verbindingscode van een bestaande Main. Er is geen werkende bordloze sessie gestart.

In deze Windows-build is Hardware Test zichtbaar in het instellingenmenu; de bekeken pagina zoekt eveneens een Core. Dit wijkt af van de eerder geraadpleegde App Store-versienotities en bevestigt dat platformgelijkheid niet mag worden aangenomen. De bekeken instellingen bevatten taal/audio/privacy en tutorials, zonder aangetroffen handmatige bordloze invoeroptie. Dit bewijst niet dat iedere mogelijke approute is uitgesloten.

Screenshots en runtimegegevens staan uitsluitend in de genegeerde private werkmap. Vertrouwelijke SDK-bevindingen blijven afzonderlijk privaat. Geen firmware, appbinary of verborgen configuratie gewijzigd. SDK-voorbeeldtests zijn een afzonderlijke stap en worden niet als officiële-appcompatibiliteit beschouwd.
