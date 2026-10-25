# Synchronisatie zonder Codex

De koppeling voert de herkenning en bordopdrachten zelf uit in lokale programmacode. Er is geen model, chat, AI-API of handmatige Codex-opdracht nodig om een ondersteunde bordinstructie te verwerken. De officiële Milan-app blijft de uitkomst bepalen.

De private pc-adapter draait een eigen achtergrondtaak. Die leest het geautoriseerde appscherm, controleert de instructies en bewaart bevestigde wijzigingen. Een browser toont de opgeslagen tafel; het sluiten van de browser stopt de synchronisatie niet. Iedere leescyclus wordt afgerond vóór de volgende begint. Een leesfout wordt vastgelegd, waarna de taak bij de volgende cyclus opnieuw probeert. Een onbekend scherm blijft een onbekend scherm: de taak verzint geen wijzigingen.

## Starten op de ingerichte pc

Dubbelklik op **Milan Control Center** op het bureaublad. De launcher start ontbrekende bordservices en opent een lokaal startvenster op `http://127.0.0.1:5180/`. Daar vind je **Start Core**, **Stop Core**, **Open tabletop** en het actuele remote bordadres met toegangscode en kopieerknoppen. De verbindingsstatus wordt automatisch bijgewerkt. De code wordt uit de draaiende bordserver gelezen en is niet vast ingebouwd.

**Milan Speeltafel** blijft het bord rechtstreeks openen. De lokale launchers staan ook onder `private/integration/Start-Milan-Control.cmd` en `private/integration/Start-Speeltafel.cmd`. Al draaiende services worden hergebruikt.

De launcher vergelijkt procespaden na normalisatie van Windows- en Unix-scheidingstekens. Een eerder gestarte eigen service wordt daardoor ook bij herhaald dubbelklikken herkend. Opstartfouten worden gelogd en bij normaal starten als melding getoond, zodat een verborgen PowerShell-venster geen stille fout meer verbergt. Deze herstartcontrole is tweemaal uitgevoerd met dezelfde klassieke Windows PowerShell die de bureaubladsnelkoppeling gebruikt; de drie serviceprocessen bleven daarbij gelijk.

**Start Core** start zo nodig de lokale Core-service, start de ingerichte WSL-omgeving en draagt de reeds gedeelde, specifiek gecontroleerde Bluetooth-radio over. Daarna begint de Core uit te zenden. Meerdere startverzoeken delen dezelfde lopende voorbereiding. Een actieve Core wordt hergebruikt. De eerste installatie en het eenmalig delen van een nog niet voorbereide radio vereisen aparte inrichting; de knop voert geen installatie, computernaamwijziging of automatische administratorverhoging uit.

Hersteld op 26 oktober: na het wegvallen van USB-overdracht kon de HTTP-service bereikbaar blijven terwijl de Bluetooth-radio weer alleen door Windows werd beheerd. De startfunctie sloeg dan ten onrechte alle voorbereiding over. Bij een gestopte Core controleert **Start Core** nu opnieuw WSL en de radio-overdracht, ook als de service al luistert. Het voorbereidingsscript keert pas na deze controle terug bij een bestaande service. Een reeds actieve Core wordt nog steeds zonder herverbinding hergebruikt. De private starttests controleren ook deze combinatie van een bereikbare, gestopte service en een opnieuw te koppelen radio. Op de ingerichte pc is de overdracht hersteld en de Core weer gestart met advertising **Started**.

Laat Milan op de tablet open en houd de geautoriseerde USB-verbinding aangesloten. Voor bewegingen vanuit het bord moet de virtuele Bluetooth-Core verbonden zijn. **Stop Core** stopt de verbinding en uitzending, maar sluit het bord niet en geeft de radio niet automatisch terug aan Windows. Technische bediening blijft beschikbaar via **Technical diagnostics**. Het startvenster en de toegangscode zijn uitsluitend op de host-pc beschikbaar; ze worden niet via de remote bordrelay gedeeld.

De koppeling blijft draaien nadat de launcher en Codex worden gesloten. De pc moet aan blijven. Na een pc-herstart start je de launcher opnieuw; dit is geen automatisch gestarte Windows-service. Technische status en logs blijven lokaal onder genegeerd `private/`.

## Verificatie op 23 oktober 2026

- Een afzonderlijk Node-proces met de echte OCR-lezer en terugkoppeladapter heeft de opgenomen officiële Android-dagfase verwerkt, zonder browser of HTTP-verzoeken. Een geïsoleerde testsessie kreeg automatisch de drie verwachte invloedseindstanden. De echte campagne bleef ongewijzigd.
- De productieadapter is los van de interactieve toolterminal gestart via de launcher. Na beëindiging van de launcher bleef de achtergrondtaak cycli uitvoeren. Opnieuw starten hergebruikt hetzelfde proces.
- Tests controleren dat cycli niet overlappen, dat de taak na een fout doorgaat en dat stoppen op een lopende cyclus wacht. Met de Sunset-uitbreiding op 24 oktober slaagt de volledige projectsuite met 46 tests. Een aanvullende zelfstandige replayproef controleert QT8-controleverwijdering zonder browser of wijzigingen aan de echte campagne.

De zelfstandige uitvoering vergroot niet automatisch de herkenningsdekking. Voor de huidige grenzen, waaronder verborgen instructies en controleovernames, zie [dagfase-automatisering](DAGFASE-AUTOMATISERING.md).

## Controle van het Control Center op 24 oktober 2026

De echte lokale pagina toont de actieve Core en de actuele gegevens van de remote bordserver. De browsercontrole omvat desktop, telefoonbreedte, kopieeracties, verbindingsstatus en gesimuleerde start-/stopbediening. Een werkelijk herhaald startverzoek hergebruikte de verbonden Core zonder de verbinding te onderbreken. Voorbereiding na een ontbrekende service, gelijktijdige verzoeken en opnieuw proberen na een fout zijn daarnaast met afzonderlijke tests van de startfunctie gecontroleerd. De koude radio-overdracht is bij deze GUI-proef niet opnieuw uitgevoerd terwijl Milan verbonden was. De publieke suite slaagt met 49 tests; daarin wordt ook gecontroleerd dat de remote relay geen toegang geeft tot het startvenster of de bijbehorende API.


Na een appcrash kan de gebruiker op het bord **App restarted? Recover input** kiezen, of in het Control Center **Reset registrations / recover input**. De Android-adapter herkent bovendien een gewijzigde app-procesinstantie. Registratievoortgang is adviserend; de Core-lezerstatus bepaalt of een scan kan worden aangeboden. Zie [scanherstel](SAVEGAME-PERSONAGES.md).


## Snellere terugkoppeling bij scannen en plaatsen

De achtergrondadapter neemt beelden zelfstandig achter elkaar op. Een bordstatusverzoek leest de laatst verwerkte momentopname en wacht niet op een nieuwe screenshot, OCR of saveprofieluitlezing. De browser controleert de status iedere 250 ms; gelijktijdige verzoeken delen één lopende uitlezing. Ongewijzigde momentopnamen vervangen de sleepbare DOM-elementen niet. Bevestigde bordposities worden weergegeven vóór de afzonderlijke tegeluitlezing is voltooid.

Op de huidige tablet kostte de oorspronkelijke PNG-opname circa 2,9–3,1 seconden, plus circa 0,7 seconde herkenning per beeld. De private adapter kan nu verliesvrij gecomprimeerde ruwe pixels ophalen en rechtstreeks herkennen, met PNG als terugval voor niet ondersteunde apparaten. Warme proefmetingen kwamen uit op circa 1,3 seconde voor de opname en 0,5 seconde voor herkenning; een koude eerste herkenning kan langer duren. Het actuele statusendpoint antwoordde lokaal in 4–30 ms. Dat laatste meet alleen het ophalen van de verwerkte toestand, niet de tijd vanaf een spelactie in Milan.

Twee overeenkomende waarnemingen blijven vereist waar ze eerder als bevestiging nodig waren. Een snelle tijdelijke scanpresentatie is geen bevestigde plaatsing. Na een scan wordt een eerder begonnen beeldverwerking verworpen, zodat een oud beeld niet aan het nieuw gescande personage wordt toegewezen. Het geheel blijft afhankelijk van USB, appanimaties en herkenbaarheid; directe volledige synchronisatie wordt hiermee niet geclaimd.

Verificatie omvat gelijke OCR-uitvoer voor dezelfde pixels via de oude PNG-route en de nieuwe route, geserialiseerde langzame browserverzoeken, behoud van ongewijzigde sleepbare elementen en weergave van bevestigde plaatsingen zonder te wachten op trage tegeldata. De browserproef gebruikt gesimuleerde appantwoorden; de snelheidsmetingen gebruiken de aangesloten tablet zonder spelacties te versturen.
