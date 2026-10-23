# Synchronisatie zonder Codex

De koppeling voert de herkenning en bordopdrachten zelf uit in lokale programmacode. Er is geen model, chat, AI-API of handmatige Codex-opdracht nodig om een ondersteunde bordinstructie te verwerken. De officiële Milan-app blijft de uitkomst bepalen.

De private pc-adapter draait een eigen achtergrondtaak. Die leest het geautoriseerde appscherm, controleert de instructies en bewaart bevestigde wijzigingen. Een browser toont de opgeslagen tafel; het sluiten van de browser stopt de synchronisatie niet. Iedere leescyclus wordt afgerond vóór de volgende begint. Een leesfout wordt vastgelegd, waarna de taak bij de volgende cyclus opnieuw probeert. Een onbekend scherm blijft een onbekend scherm: de taak verzint geen wijzigingen.

## Starten op de ingerichte pc

Dubbelklik op **Milan Speeltafel** op het bureaublad. De lokale launcher start ontbrekende bordservices als zelfstandige Windows-achtergrondprocessen en opent het bord. Al draaiende services worden hergebruikt. Op deze ingerichte computer staat de launcher ook onder `private/integration/Start-Speeltafel.cmd`.

Laat Milan op de tablet open en houd de geautoriseerde USB-verbinding aangesloten. Voor bewegingen vanuit het bord moet de bestaande virtuele Bluetooth-Core verbonden zijn. De launcher installeert of wijzigt de officiële app niet en start de Bluetooth-radio-overdracht na een pc-herstart nog niet automatisch. Hij vervangt dus niet de volledige eerste hardware-setup.

De koppeling blijft draaien nadat de launcher en Codex worden gesloten. De pc moet aan blijven. Na een pc-herstart start je de launcher opnieuw; dit is geen automatisch gestarte Windows-service. Technische status en logs blijven lokaal onder genegeerd `private/`.

## Verificatie op 23 oktober 2026

- Een afzonderlijk Node-proces met de echte OCR-lezer en terugkoppeladapter heeft de opgenomen officiële Android-dagfase verwerkt, zonder browser of HTTP-verzoeken. Een geïsoleerde testsessie kreeg automatisch de drie verwachte invloedseindstanden. De echte campagne bleef ongewijzigd.
- De productieadapter is los van de interactieve toolterminal gestart via de launcher. Na beëindiging van de launcher bleef de achtergrondtaak cycli uitvoeren. Opnieuw starten hergebruikt hetzelfde proces.
- Tests controleren dat cycli niet overlappen, dat de taak na een fout doorgaat en dat stoppen op een lopende cyclus wacht. Met de Sunset-uitbreiding op 24 oktober slaagt de volledige projectsuite met 46 tests. Een aanvullende zelfstandige replayproef controleert QT8-controleverwijdering zonder browser of wijzigingen aan de echte campagne.

De zelfstandige uitvoering vergroot niet automatisch de herkenningsdekking. Voor de huidige grenzen, waaronder verborgen instructies en controleovernames, zie [dagfase-automatisering](DAGFASE-AUTOMATISERING.md).
