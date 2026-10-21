# Werken aan dit project

Lees README.md, docs/PLAN.md, docs/ARCHITECTUUR.md, docs/BESLUITEN.md en docs/ONDERZOEK.md voordat je uitbreidt.
Communiceer in het Nederlands. Houd de lokale demo zonder externe dependencies werkend.
Voer `node --test` uit bij wijzigingen aan bordlogica; controleer de UI bij zichtbare wijzigingen.
Voltooi eerst fase 1A van het plan vóór engine-implementatie. Behoud het prototype tijdens migratie.
Scheid engine, spelregels, spelgegevens, UI en presentatie. Milan is een game-module, geen dependency van de engine.
Engine en regels werken headless; 2D en later 3D gebruiken dezelfde opdrachten en toestand. Geen grafische objecten in domeinlogica.
Sandbox is een toekomstige volwaardige modus. App/hardware-integratie blijft een optionele adapter en zelfstandig onderzoeksspoor.
Alle events in src/model.js zijn eigen domeinevents, geen Teburu-protocol.
Presenteer appcompatibiliteit of emulatie nooit als bewezen zonder reproduceerbare hardwaretest.
Geen beveiligingsomzeiling, gekloonde RFID-identiteiten, firmwarepatches of beschermde assets.
Bewaar eventuele eigen hardwarewaarnemingen en identifiers uitsluitend onder private/ (genegeerd).
Wijzig of installeer niets aan de officiële app of hardware zonder concrete opdracht.
