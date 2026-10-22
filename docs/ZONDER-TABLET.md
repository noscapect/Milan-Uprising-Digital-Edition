# Tablet vervangen of als Milan-scherm gebruiken

Onderzocht op 22 oktober 2026. Dit is een keuze voor de volgende integratieproef, geen nieuwe compatibiliteitsclaim. De bestaande beperkte live proef blijft beschreven in [APP-VALIDATIE.md](APP-VALIDATIE.md#live-tafelbediening-en-invloed).

## Uitkomst

**Gekozen vervolgrichting:** de gebruiker heeft na dit onderzoek gekozen voor de officiële Milan-app op een fysieke Android-tablet, met de virtuele tafel en Core-helper op de pc. De emulatorroute blijft een alternatief. De Windows-helper is inmiddels lokaal gebouwd; de antwoorden zijn vergeleken met tien bestaande testfixtures van de private Android-helper. De fysieke Windows-radio accepteert de benodigde GATT-service en beide characteristics. Dit bewijst nog geen verbinding met Milan op de tablet.

De officiële Android-app 1.0.9 is op de aangesloten tablet aangetroffen en via de normale UI tot de Core-zoekstap geopend. USB-schermuitlezing is met gebruikersbevestigde foutopsporing getest. De aparte oude helper is gestopt. De nieuwe invoerroute en schermbron zijn afzonderlijk selecteerbaar; er wordt niet stilzwijgend op de oude Windows-app teruggevallen. Bluetooth-ontdekking en een echte spelactie vanaf de tablet moeten nog worden bewezen. Technische bron, gegevens en beelden blijven privaat.

De fysieke tablet ontvangt de connecteerbare pc-advertentie, maar met de Windows-computernaam. De tijdelijke wijziging van de gewone Bluetoothnaam en een herstart van de radio corrigeren die BLE-naam niet. Ook een naamcorrectie binnen uitsluitend ons helperproces bereikt de advertentienaam niet. Zowel Milan als de officiële Teburu-app blijven bij hun zoekstap zonder verbinding; er zijn geen appopdrachten ontvangen. De gebruiker heeft een wijziging van de Windows-computernaam afgewezen; die route valt af. Het vervolg is een afzonderlijke USB-radio met eigen stack, mits passende hardware beschikbaar is. De extra scan-app is uitsluitend diagnostiek en hoort niet bij de beoogde speelopstelling.

De kansrijkste onderzochte route om de fysieke tablet geheel weg te halen is de **ongewijzigde Android-versie van Milan in Android Emulator, met een afzonderlijke virtuele Core via Netsim/Bumble**. De radioverbinding wordt dan softwarematig tussen twee virtuele apparaten opgebouwd. Dit is een onderbouwde technische kandidaat; Milan is hier nog niet in gestart of verbonden. Dit is niet de door de gebruiker gekozen hoofdroute.

De officiële Milan-app op een fysieke Android-tablet is ook een optie. Dat verplaatst echter de Core-functie naar de pc of een ander apparaat; de huidige helper en Milan op dezelfde tablet zetten levert niet vanzelf een verbinding op. Bovendien moet de automatische toestandsterugkoppeling dan het tabletscherm kunnen lezen.

| Opstelling | Wat verandert | Belangrijkste open punt |
| --- | --- | --- |
| Huidige Windows-Milan + Android-helper | Bewezen beperkte proef; tablet levert BLE | Tablet blijft nodig |
| Android-Milan in emulator + virtuele Core op pc | Helemaal softwarematig op één pc; geen fysieke Bluetooth-radio voor deze koppeling | Android-app starten, ABI/Play-compatibiliteit, virtuele GATT en Milan samen testen |
| Windows-Milan + helper op dezelfde Windows-radio | Tablet zou verdwijnen | Eerdere generieke proef adverteerde, maar verbinding met eigen radio leverde geen device op |
| Windows-Milan + afzonderlijke USB-radio voor helper | Tablet vervangen door kleine USB-zender | Eigen radio/stack nodig; niet twee radios onder dezelfde Windows-stack veronderstellen |
| Android-Milan op tablet + Windows-helper | Tablet wordt het officiële spelscherm; bord blijft op pc | Ontdekking/naamgeving, BLE-invoer en terugkoppeling vanaf tablet nog testen |

## Waarom de emulatorroute nu wel serieus is

De eerdere algemene opmerking dat een Android-emulator de Core niet vervangt blijft juist, maar is onvoldoende als afwijzing van deze opstelling. [Android documenteert Classic en BLE vanaf API 31](https://developer.android.com/studio/run/emulator-networking). [Netsim](https://developer.android.com/studio/run/emulator-networking-advanced) verzorgt een virtuele radioomgeving zonder fysieke radios.

[Bumble beschrijft expliciet een GATT-server die via `android-netsim` met Android-apps in de emulator communiceert](https://google.github.io/bumble/platforms/android.html). De [transportdocumentatie](https://google.github.io/bumble/transports/android_emulator.html) noemt de oudere `android-emulator`-route verouderd. Gebruik dus Netsim bij een nieuwe proef. Deze documentatie bewijst de generieke transportmogelijkheid, geen Milan-compatibiliteit. Een virtuele Core blijft afzonderlijk nodig.

Er is lokaal een read-only hostcontrole uitgevoerd met `tools/check-tablet-alternatives.ps1`. De machine-uitkomst staat uitsluitend onder `private/integration/`. Een actieve hypervisor bewijst nog niet dat de juiste Windows-versnellingslaag voor Android Emulator bruikbaar is; controleer die straks met `emulator -accel-check`.

## Grenzen van Windows en een fysieke tablet

De bestaande private Windows-proef heeft wel een GATT-service kunnen adverteren maar geen verbinding met de eigen radio aangetoond. De huidige machine heeft één aangetroffen fysieke Bluetooth-radio. Dit is geen bewijs dat iedere opstelling met één pc onmogelijk is; een gesimuleerde Android-radio is een andere route.

[Microsoft begrenst naamvelden en gereserveerde advertentietypen in de publisher-API](https://learn.microsoft.com/en-us/uwp/api/windows.devices.bluetooth.advertisement.bluetoothleadvertisementpublisher). De generieke GATT-proef bewijst daarom niet dat een Windows-helper ook met de voor Milan benodigde ontdekking werkt. [Windows ondersteunt één radio per eigen Bluetooth-stack](https://learn.microsoft.com/en-us/windows-hardware/drivers/bluetooth/bluetooth-faq). [Bumble beschrijft een afzonderlijke USB-radio via WinUSB](https://google.github.io/bumble/platforms/windows.html); daarvoor is een eigen driverbinding nodig. De bestaande radio en zijn aangesloten invoerapparaten zijn niet gewijzigd.

De officiële [Android-app staat op Google Play](https://play.google.com/store/apps/details?id=com.xplored.teburu.vtm). Beschikbaarheid voor deze specifieke tablet of emulator moet via de normale installatie worden vastgesteld. De huidige helper is aan een Activity gekoppeld en stopt bij `onDestroy`; hij is niet als blijvende achtergrondservice gebouwd. Alleen tussen apps wisselen is dus geen geteste oplossing. Bij Milan op tablet plus Core op pc vervalt die helper daar, maar onze huidige Windows-vensterlezer werkt dan niet meer: een afzonderlijke, door de gebruiker toegestane schermbron is nodig. Windows-saves overzetten naar Android is niet gevalideerd.

## Eerstvolgende proef voor de gekozen tabletopstelling

1. Corrigeer de werkelijk uitgezonden pc-naam via een door de gebruiker toegestane route en controleer die opnieuw op de fysieke tablet.
2. Bewijs een verbinding en echte spelinvoer met de ongewijzigde Milan-app op de tablet, zonder de oude Android-helper te gebruiken.
3. Kalibreer de afzonderlijke Android-schermlezer op een echte kaart en herhaal verplaatsing, invloedwijziging en hervatten. De bestaande Windows-proef bewijst deze Android-keten niet.

## Alternatieve emulatorproef en acceptatie

1. Bereid een geïsoleerde Android Emulator met passende image voor en controleer versnelling. Houd de huidige Windows-campagne intact.
2. Bewijs eerst generieke ontdekking, GATT write en notification tussen emulator en een eigen virtueel apparaat via Netsim, zonder Milan-identiteit of SDK-inhoud in publieke code.
3. Installeer Milan via een officiële bron en controleer starten, grafische werking en beschikbaarheid voor de gekozen architectuur. Geen APK-patches, verborgen modus of controle-omzeiling.
4. Laat de private Core-implementatie op het bewezen virtuele transport werken. Herhaal registratie, locatie-invoer, officiële worp en hervatten met de ongewijzigde app.
5. Pas de afzonderlijke schermlezer aan de Android-weergave aan. Herhaal een echte invloedwijziging en controleer het bord zonder herladen.

De tablet mag pas als vervallen worden beschouwd wanneer deze keten reproduceerbaar zonder tablet draait. Technische Core-code, gegevens, screenshots en observaties blijven onder genegeerd `private/`. De publieke demo krijgt geen emulator- of Python-dependency.
