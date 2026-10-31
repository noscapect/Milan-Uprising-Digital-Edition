# Gesimuleerde firmware-update

De private PC-Core heeft een afzonderlijke, blijvende compatibiliteitsstatus voor de virtuele Core, vijf virtuele dobbelstenen en één virtuele LED-ring. In het lokale Control Center staat **Simulated firmware → Simulate update · Core + 5 dice + LED ring**. Dit is een update van onze simulatie; er wordt geen officiële firmware geïnstalleerd, uitgevoerd of gewijzigd. De updateknop van de officiële app en de bijbehorende bootloaderoverdracht blijven afzonderlijk en worden niet ondersteund door deze patch.

De doelversies zijn sinds 25 oktober 2026 Core **2.32.0** en dice **3.39.0**. Deze volgen de daadwerkelijk door de ongewijzigde Android-Milan-app verwachte versies, zichtbaar in zijn eigen versievergelijkingslog. De eerdere doelen 2.31.0 en 3.36.0 volgden de bestandsnamen van meegeleverde firmwarepakketten. Die bleken achter te lopen op de versiecontrole van de app en lieten beide waarschuwingen staan. Dit zijn compatibiliteitsversies van onze gedragssimulatie; er wordt geen officiële firmware uitgevoerd en de versienummers bewijzen geen volledige hardwarecompatibiliteit.

Tijdens de simulatie blijven de oude versies geldig. Pas na succesvolle voltooiing worden de nieuwe versies atomair bewaard. Een onderbroken simulatie of blijvende schrijffout meldt geen geslaagde update en kan opnieuw worden geprobeerd. Nogmaals bijwerken naar dezelfde doelversie verandert de stand niet. Het Control Center toont de gemelde en gewenste versies, de voortgang en het uitdrukkelijke simulatielabel. Wanneer een eerder voltooide simulatie oudere doelen heeft, toont het nu **New simulation available** en blijft de updateknop beschikbaar.

De Core-versie wordt opgenomen in de normale opdrachtantwoorden; de vijf dobbelsteenversies in hun ontdekkings- en statusberichten. Reconnectie, sessie sluiten en Core-herstart wissen deze versies niet. Verbind Milan opnieuw om ook de in de app gecachte Coreversie te verversen. De update kiest geen worpuitkomst, verplaatst geen miniatuur en wijzigt de officiële save of de virtuele bordopstelling niet.

## Verificatie

Op 25 oktober slagen alle 24 private Core-regressiescenario's, inclusief een nieuwe proef voor upgraden vanaf een eerder voltooide simulatie met oude doelen. De virtuele Bluetooth-regressie met alle veertig contacten, vijf dobbelstenen en groepsselecties slaagt eveneens. De eerdere onafhankelijke SDK-decoderproef las Core 2.31 en alle vijf dice 3.36; die historische proef is geen nieuwe decoderverificatie voor de huidige doelen.

De browserproef controleert fouten, opnieuw proberen, de melding bij verouderde doelen, blijvend getoonde versies, uitschakelen van een actuele voltooide update en de mobiele indeling. De publieke testsuite heeft 69 geslaagde tests.

De lokale simulatie is uitgevoerd en de helper is opnieuw geladen. Daarna is met de ongewijzigde Android-Milan-app 1.0.9 via de echte BLE-route bevestigd: Core 2.32.0 komt overeen met de verwachte 2.32.0 en alle vijf dice melden 3.39.0. Beide setupschermen tonen **Continue**, zonder firmware-updatewaarschuwing of FW-pijlen bij de dice. Alleen wakker maken is gebruikt; geen worp verstuurd en geen campagne geopend. Deze acceptatie bewijst het verdwijnen van de versie­waarschuwingen, geen volledige spelcompatibiliteit of uitvoering van officiële firmware.

Implementatie, ruwe apparaatwaarnemingen, identiteiten en decoderinhoud blijven onder genegeerd `private/`. De publieke demo krijgt geen SDK- of Bluetoothafhankelijkheid.


## LED-ring — 28 oktober 2026

De LED-ring maakt nu deel uit van dezelfde blijvende firmware-simulatie, met doelversie **1.15.0**. Deze versie is gecontroleerd tegen de versiecontrole van de ongewijzigde Teburu-app 1.2.0. Oudere lokale statusbestanden zonder ringversie blijven leesbaar en vragen een nieuwe simulatie; de eerder ingestelde Core- en diceversies blijven behouden. Alleen succesvol voltooien slaat de nieuwe ringversie op. Afbreken of een schrijffout meldt geen geslaagde update.

De ring meldt nu ook een stabiele gesimuleerde batterijwaarde via dezelfde berekening als de dobbelstenen. Dit is geen fysieke batterijmeting. De hardwareversie blijft onbekend; er wordt geen officiële ringfirmware geïnstalleerd of uitgevoerd.

De wijziging is actief. Na opnieuw verbinden met de echte Android-tablet toonde de ongewijzigde Teburu-app **1.15.0**, **Firmware up to date**, **46%** en **3852 mV**, zonder de eerdere waarschuwing voor beschikbare firmware of een lege batterij. De officiële updateknop is niet gebruikt. De campagne en bordposities zijn niet gewijzigd.

Verificatie: alle 26 private Core-regressiescenario’s slagen, inclusief migratie van een oud statusbestand, afbreken, schrijffout, herstart en stabiele ringtelemetrie. De virtuele Bluetooth-proef en de Control Center-browserproef slagen eveneens. Deze acceptatie bevestigt versie- en batterijweergave; volledige ringanimaties blijven afzonderlijk te toetsen. Ruwe waarnemingen en implementatie blijven privaat.


## Timeout handling — 30 October 2026

The transport now keeps a codec command and its response serialized when the caller disconnects or its HTTP request times out. Previously, cancelling the five-second response read allowed a late response to be consumed by a subsequent command. The firmware HTTP request has a separate thirty-second deadline; the codec exchange continues safely after an HTTP timeout. Progress and errors now appear beside the simulation button, including the instruction to reconnect Milan after completion.

Validation: a headless regression cancels a waiting caller and verifies that the next command receives its own response; nine targeted tests passed. An isolated Edge check exercised the simulation button and inline reconnect feedback. No official firmware update was performed. These source fixes require updating the packaged runtime before taking effect there.
