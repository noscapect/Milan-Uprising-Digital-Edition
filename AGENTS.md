# Werken aan dit project

Lees README.md, docs/PLAN.md, docs/ARCHITECTUUR.md, docs/BESLUITEN.md en docs/ONDERZOEK.md voordat je uitbreidt.
Communiceer in het Nederlands. Houd de lokale demo zonder externe dependencies werkend.
Het einddoel is de ongewijzigde officiële game-app gebruiken zonder fysieke spelonderdelen. Sandbox is een tussenstap, geen vervanging van dat doel. Lees docs/TEBURU-DEEPSEARCH.md voor actuele bronbevindingen.
Voer `node --test` uit bij wijzigingen aan bordlogica; controleer de UI bij zichtbare wijzigingen.
Lees docs/CONTRACTEN.md voor de geïmplementeerde eerste doorsnede. Fysieke componentinventaris en Milan-regels blijven open. Behoud legacy/ als referentie.
Scheid engine, spelregels, spelgegevens, UI en presentatie. Milan is een game-module, geen dependency van de engine.
Engine en regels werken headless; 2D en later 3D gebruiken dezelfde opdrachten en toestand. Geen grafische objecten in domeinlogica.
Sandbox is de huidige enige modus; geautomatiseerde regels zijn nog niet beschikbaar. App/hardware-integratie blijft een optionele adapter en zelfstandig onderzoeksspoor.
Onderscheid tijdelijke sensorcontacten van blijvende spelpositie. De lokale virtual-core is een expliciete gedragssimulatie, geen RFID/BLE-emulator. De officiële SDK-route bestaat, maar ondersteuning/toestemming voor bestaande apps is onbewezen; publiceer geen vertrouwelijke SDK-inhoud.
Alle events in src/model.js zijn eigen domeinevents, geen Teburu-protocol.
Presenteer appcompatibiliteit of emulatie nooit als bewezen zonder reproduceerbare hardwaretest.
Geen beveiligingsomzeiling, gekloonde RFID-identiteiten, firmwarepatches of beschermde assets.
Bewaar eventuele eigen hardwarewaarnemingen en identifiers uitsluitend onder private/ (genegeerd).
Wijzig of installeer niets aan de officiële app of hardware zonder concrete opdracht.
