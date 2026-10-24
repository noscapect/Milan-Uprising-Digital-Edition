# Synchronisatie zonder Codex

De koppeling voert de herkenning en bordopdrachten zelf uit in lokale programmacode. Er is geen model, chat, AI-API of handmatige Codex-opdracht nodig om een ondersteunde bordinstructie te verwerken. De officiële Milan-app blijft de uitkomst bepalen.

De private pc-adapter draait een eigen achtergrondtaak. Die leest het geautoriseerde appscherm, controleert de instructies en bewaart bevestigde wijzigingen. Een browser toont de opgeslagen tafel; het sluiten van de browser stopt de synchronisatie niet. Iedere leescyclus wordt afgerond vóór de volgende begint. Een leesfout wordt vastgelegd, waarna de taak bij de volgende cyclus opnieuw probeert. Een onbekend scherm blijft een onbekend scherm: de taak verzint geen wijzigingen.

## Starten op de ingerichte pc

Dubbelklik op **Milan Control Center** op het bureaublad. De launcher start ontbrekende bordservices en opent een lokaal startvenster op `http://127.0.0.1:5180/`. Daar vind je **Start Core**, **Stop Core**, **Open tabletop** en het actuele remote bordadres met toegangscode en kopieerknoppen. De verbindingsstatus wordt automatisch bijgewerkt. De code wordt uit de draaiende bordserver gelezen en is niet vast ingebouwd.

**Milan Speeltafel** blijft het bord rechtstreeks openen. De lokale launchers staan ook onder `private/integration/Start-Milan-Control.cmd` en `private/integration/Start-Speeltafel.cmd`. Al draaiende services worden hergebruikt.

De launcher vergelijkt procespaden na normalisatie van Windows- en Unix-scheidingstekens. Een eerder gestarte eigen service wordt daardoor ook bij herhaald dubbelklikken herkend. Opstartfouten worden gelogd en bij normaal starten als melding getoond, zodat een verborgen PowerShell-venster geen stille fout meer verbergt. Deze herstartcontrole is tweemaal uitgevoerd met dezelfde klassieke Windows PowerShell die de bureaubladsnelkoppeling gebruikt; de drie serviceprocessen bleven daarbij gelijk.

**Start Core** start zo nodig de lokale Core-service, start de ingerichte WSL-omgeving en draagt de reeds gedeelde, specifiek gecontroleerde Bluetooth-radio over. Daarna begint de Core uit te zenden. Meerdere startverzoeken delen dezelfde lopende voorbereiding. Een actieve Core wordt hergebruikt. De eerste installatie en het eenmalig delen van een nog niet voorbereide radio vereisen aparte inrichting; de knop voert geen installatie, computernaamwijziging of automatische administratorverhoging uit.

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
