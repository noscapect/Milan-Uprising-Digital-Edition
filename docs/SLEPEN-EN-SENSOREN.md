# Miniaturen slepen en sensorinvoer

Houd de linkermuisknop op een miniatuur ingedrukt, sleep naar een gemarkeerd locatievak en laat los. Dezelfde bediening werkt vanuit de voorraad en de locatielijst. Klikken zonder slepen blijft selecteren. Escape, verlies van vensterfocus of buiten het bord loslaten annuleert de sleepactie. Loslaten op de oorspronkelijke locatie verstuurt geen nieuwe zet.

De fysieke kaart en het raster gebruiken dezelfde opdracht. Ook met zoom blijven alle miniaturen bereikbaar. De retailvoorraad bevat zeven spelerspersonages, twee bondgenoten en twee ghouls; alle elf zijn in de zelfstandige sandbox te slepen. Dit voert geen Milan-spelregels uit.

## Gekoppelde tafel

De private adapter controleert vóór sensorinvoer welk personage de officiële app vraagt. Een lopende zet blokkeert een tweede invoer. Tijdens de zonsopgangfase zijn uitsluitend Havenvelden toegestaan. Onbekende schermen, een verbroken verbinding of bezette tijdelijke contacten geven een melding in plaats van een nieuwe zet.

Na loslaten verstuurt de adapter één tijdelijk contact op de bestemming en geeft dit weer vrij. Het scherm toont de bevestigde bordpositie zolang de app de invoer verwerkt. Pas na herkenbare appbevestiging wordt de nieuwe positie vastgelegd. Een fout of ontbrekende bevestiging laat de opgeslagen positie intact; controleer in dat geval ook het tabletscherm voordat je opnieuw probeert. De app kan invoer al hebben verwerkt terwijl de terugkoppeling nog ontbreekt.

Een verstuurde zet blijft daarom lokaal bewaard zolang de bevestiging ontbreekt, ook na een adapterherstart. Een latere herkenbare appbevestiging werkt de tafel alsnog bij zonder het sensorcontact opnieuw te versturen. Tot die tijd wordt een volgende zet geblokkeerd. Voor de eerste gebruikersproef meldde de gebruiker dat Milan Simona's plaatsing in Haven 2L registreerde, terwijl de tafel achterbleef; die positie is op basis van deze bevestiging hersteld. De aangepaste verwerking van late bevestigingen is afzonderlijk getest met nagebootste waarnemingen.

## Verificatie op 23 oktober 2026

| Controle | Resultaat en grens |
| --- | --- |
| Veertig sensorbestemmingen | Volledige, unieke mapping gecontroleerd; geen ontbrekende of dubbele contacten |
| Onafhankelijke SDK-decodering | Alle veertig afzonderlijk aan/uit, alle veertig samen en iedere afzonderlijke vrijgave geslaagd; zonder fysieke radio of officiële app |
| Virtueel Bluetooth-transport | Alle veertig contacten en vrijgaven ontvangen via twee softwarecontrollers; geen fysieke tablet |
| Bewegingsadapter | 440 combinaties van elf miniaturen en veertig bestemmingen gecontroleerd met nagebootste appwaarnemingen; inclusief weigeringen, fouten en vrijgave |
| Browserbediening | Echte muisinteractie: voorraad, bord, raster, fysieke kaart, zoom, alle elf miniaturen, annuleren en rechtermuisknop |
| Gekoppelde browser | Eén verzoek per sleepactie, wachten op bevestiging, weigeren van inactief personage en behoud van positie bij een fout; API nagebootst |
| Officiële Milan-app op Android | Eerder geselecteerde stadsbestemmingen en een Havencontact bevestigd; gebruiker bevestigt dat de nieuwe sleepbediening een Havencontact in Milan registreert. De eerste proef liet ontbrekende bordterugkoppeling zien, waarna de positie is hersteld |

Deze controles bewijzen geen volledige campagne, alle veertig bestemmingen op de echte tablet of het verplaatsen van bondgenoten en ghouls in iedere appfase. De private herkenning van hun plaatsingsinstructies moet nog aan echte appschermen worden getoetst. De publieke demo blijft zonder adapter en externe pakketten werken.
