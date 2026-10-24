# Gesimuleerde firmware-update

De private PC-Core heeft een afzonderlijke, blijvende compatibiliteitsstatus voor de virtuele Core en vijf virtuele dobbelstenen. In het lokale Control Center staat **Simulated firmware → Simulate update · Core + 5 dice**. Dit is een update van onze simulatie; er wordt geen officiële firmware geïnstalleerd, uitgevoerd of gewijzigd. De updateknop van de officiële app en de bijbehorende bootloaderoverdracht blijven afzonderlijk en worden niet ondersteund door deze patch.

De doelversies zijn Core **2.31.0** en dice **3.36.0**. Deze keuze volgt de bestandsnamen van de firmwarepakketten in zowel de geïnstalleerde Milan-app als de geïnstalleerde Teburu-app, gelezen via de geautoriseerde USB-verbinding. Dit is geen claim over de nieuwste online release of over werkelijk uitgevoerde hardwarefirmware.

Tijdens de simulatie blijven de oude versies geldig. Pas na succesvolle voltooiing worden de nieuwe versies atomair bewaard. Een onderbroken simulatie of blijvende schrijffout meldt geen geslaagde update en kan opnieuw worden geprobeerd. Nogmaals bijwerken naar dezelfde doelversie verandert de stand niet. Het Control Center toont de gemelde en gewenste versies, de voortgang en het uitdrukkelijke simulatielabel.

De Core-versie wordt opgenomen in de normale opdrachtantwoorden; de vijf dobbelsteenversies in hun ontdekkings- en statusberichten. Reconnectie, sessie sluiten en Core-herstart wissen deze versies niet. Verbind Milan opnieuw om ook de in de app gecachte Coreversie te verversen. De update kiest geen worpuitkomst, verplaatst geen miniatuur en wijzigt de officiële save of de virtuele bordopstelling niet.

## Verificatie

De private Core-regressiesuite heeft 22 geslaagde scenario's, waaronder voltooien, opnieuw verbinden, herstarten, afbreken, herhalen en falende opslag. De onafhankelijke SDK-decoder leest Core 2.31 en alle vijf dice 3.36 uit de gegenereerde berichten; daarbij blijven de bestaande aantallen start- en resultaatcallbacks gelijk. De virtuele Bluetooth-regressie met alle veertig contacten, vijf dobbelstenen en groepsselecties slaagt eveneens.

De browserproef controleert fouten, opnieuw proberen, blijvend getoonde versies, uitschakelen van een reeds voltooide update en de mobiele indeling. De publieke testsuite heeft 62 geslaagde tests. De lokale update is uitgevoerd en het Control Center toont alle zes doelversies als voltooid. Dat de updatewaarschuwingen in de ongewijzigde Android-app daadwerkelijk verdwijnen, moet na herverbinding apart worden bevestigd. De lokale simulatie en decoderproeven bewijzen dit nog niet.

Implementatie, ruwe apparaatwaarnemingen, identiteiten en decoderinhoud blijven onder genegeerd `private/`. De publieke demo krijgt geen SDK- of Bluetoothafhankelijkheid.
