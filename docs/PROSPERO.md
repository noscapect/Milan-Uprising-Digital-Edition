# Prospero naast de tafel

De gekoppelde tafel toont **Prospero, Prince of Milan** op zijn troon rechts naast de fysieke kaart, met een duidelijk zichtbare LED-voet en vier afzonderlijke lichtsegmenten. Dit is het miniatuuraccessoire. De afzonderlijke verhaalcampagne **Prospero's Legacy** en zijn extra spelonderdelen worden hiermee niet toegevoegd of ontgrendeld.

De [uitgeverspagina van de miniatuur](https://pegasus.de/Teburu-Vampire-The-Masquerade-Milan-Uprising-Prospero-Prince-of-Milan-Miniature/34037G) bevestigt compatibiliteit met de LED-ring. [Xplored beschrijft vier LED-lichten](https://teburu.zendesk.com/hc/en-us/articles/25458659932827-Troubleshooting-your-Teburu-LED-Ring). Prospero is een afzonderlijke miniatuur naast de kaart, geen achtste speelbaar basispersonage. Zijn weergave voegt geen RFID-identiteit of campagne-invoer toe en wijzigt bestaande sessies niet.

Het lokale beeld komt uit de reeds geïnstalleerde officiële app. De originele instructieafbeelding bevat meerdere aanzichten; CSS toont uitsluitend het rechter aanzicht van de gemonteerde miniatuur. Het brondocument wordt niet aangepast. De beelden en het extractiescript blijven onder genegeerd `private/`. Zonder lokaal artwork blijven naam, voet en vier lichtsegmenten zichtbaar.

## Lichtstand

Zonder ontvangen lichtopdracht toont de tafel een neutrale voet met **LED ring · awaiting Milan**. Er worden geen gezondheid, macht, dreiging of kleurbetekenissen verzonnen. De optionele private adapter kan ondersteunde broadcastopdrachten voor vier RGB-kleuren, één RGB-/paletlicht en uitschakelen doorgeven. Opdrachten aan vreemde adressen, ongeldige en niet ondersteunde opdrachten worden niet aan Prospero toegeschreven. Alleen de laatst ontvangen statische kleuren worden weergegeven; aangevraagde hardwareanimaties worden nog niet nagebootst. Verbreken van de Coreverbinding maakt de actuele lichtstand weer onbekend.

Sinds 25 oktober 2026 meldt de private pc-Core ook één virtuele LED-ring aan Milan. De eerdere implementatie verwerkte alleen lichtuitvoer; daardoor bleef de app op **Not connected** staan, ook al was Prospero al op onze tafel zichtbaar. De ontbrekende apparaatmelding is nu toegevoegd. De ring heeft een eigen blijvende, lokaal gegenereerde simulatie-identiteit; er is geen officiële hardware-identiteit gekopieerd en Prospero krijgt geen speelbaar personage- of RFID-profiel.

De melding wordt verstuurd wanneer de app het ringkanaal voor spel of zoeken opent. Zolang dat kanaal actief is, volgen periodieke aanwezigheidsmeldingen; sluiten of verbreken stopt die route. De ringmelding verandert geen sensorcontact, bordpositie, personage of dobbelsteenworp. Ontbrekende hardwaretelemetrie blijft onbekend; er wordt geen officiële ringfirmware geïnstalleerd of uitgevoerd.

Naast broadcasts worden ondersteunde RGB-/enkele-LED-opdrachten gericht aan onze eigen ringidentiteit aan dit accessoire toegeschreven. Opdrachten aan andere adressen blijven genegeerd. De stand is ook via de bestaande gedeelde bordlink zichtbaar. Een eerder ontvangen uitschakelopdracht uit Milan zette alle vier kleuren op zwart. Volledige hardwareanimaties blijven buiten de huidige uitvoerprojectie.

Na het laden van de nieuwe pc-Core heeft de gebruiker op 25 oktober op de echte Android-tablet **Connected** gezien op het Prospero-scherm. Dit is gebruikersbevestiging van de herkenning met de ongewijzigde app. Het bewijst nog geen volledige kleur-/animatiesequentie tijdens een campagne.

## Verificatie

De publieke tests controleren het accessoire zonder speelbare identiteit en accepteren uitsluitend vier volledige waargenomen RGB-waarden. De bestaande browserproef controleert origineel artwork, de vier segmenten, kleurupdates, neutrale status, behoud van het grootste schermdeel voor de kaart, drie kleinere schermformaten en de terugval zonder artwork.

De private Core-regressiesuite heeft nu 25 geslaagde scenario’s. De nieuwe ringproef controleert sessie-/radiovoorwaarden, sluiten/reset en behoud van de overige hardwaretoestand. Een afzonderlijke proef met de oorspronkelijke SDK-decoder herkent één ring en twee statusmeldingen zonder dubbele ontdekking. De virtuele Bluetooth-proef controleert daadwerkelijke aflevering van de ringmelding via dezelfde karakteristiek als de dobbelstenen. De parserproef controleert ook uitvoer gericht aan de eigen identiteit en het negeren van vreemde adressen. Deze softwareproeven blijven onderscheiden van de afzonderlijke gebruikersbevestiging op Android. Technische berichten, decoderbron en synthetische identiteiten blijven uitsluitend onder genegeerd `private/`.


## Firmware en batterij — 28 oktober 2026

De virtuele ring meldt nu de blijvend opgeslagen compatibiliteitsversie 1.15.0 en een stabiele gesimuleerde batterijwaarde op dezelfde manier als de dobbelstenen. Live gecontroleerd in de ongewijzigde Teburu-app 1.2.0: Firmware up to date, 46%, 3852 mV. De eerdere nulwaarden en beide waarschuwingen zijn hiermee verholpen. Dit vervangt de eerdere onbekende batterijtelemetrie voor onze simulatie; het is geen meting aan fysieke hardware. Zie [firmware-simulatie](FIRMWARE-SIMULATIE.md).

## Oriëntatie LED-segmenten — 28 oktober 2026

De bordweergave volgt nu dezelfde oriëntatie als de bovenaanzichtweergave in Teburu: linksboven licht 3, rechtsboven licht 4, rechtsonder licht 1 en linksonder licht 2. De eerdere weergave stond 180 graden gedraaid. Alleen de presentatie is aangepast; ontvangen kleuren en lichtidentiteiten blijven behouden. Een geïsoleerde browsercontrole met vier verschillende kleuren bevestigt deze plaatsing. De uitgebreidere bestaande Prospero-browserproef is niet afgerond; die bleef wachten. De correctie vereist verversen van de bordpagina.
