# Dagfase: bordwijzigingen overnemen

Onderzocht en eerste doorsnede getest op 23 oktober 2026. De officiële handleiding beschrijft op pagina 5 de dagfase als de fase waarin de Hand of St. Ambrose handelt. Pagina 6 beperkt invloed tot drie kubussen per factie per locatie. Pagina 8 koppelt de hoeveelheid vijandelijke invloed aan de Masquerade. Bron: [officiële Game Manual](https://teburu.com/downloads/VtM/VTM_MU_GameManual.pdf).

De uitgever beschrijft bovendien dat de uitbreiding van vijandelijke facties campagne-afhankelijk is. De Camarilla handelt tijdens de City Phase, St. Ambrose tijdens de Day Phase. Bron: [Xplored, The Camarilla and Second Inquisition](https://gamefound.com/en/projects/xplored/vampire-the-masquerade-milan-uprising/updates/18). Die oudere ontwerpupdate is achtergrondinformatie; de actuele officiële app bepaalt de werkelijke uitkomst.

## Gekozen route

Neem de door Milan getoonde eindstanden over. Bereken geen eigen vijandelijke acties. Het sensorcontact waarmee een miniatuur wordt verplaatst levert onze tafel op zichzelf geen invloedseindstanden; hiervoor is een afzonderlijke terugkoppeladapter nodig.

| Route | Mogelijkheid en beperking |
| --- | --- |
| Instructiekaarten op het scherm lezen | Expliciete locatie, factie en absoluut aantal; de huidige Engelse dagfase is hiermee getest. Alleen zichtbare, volledig herkende kaarten worden overgenomen |
| Complete appkaart lezen | Geschikt voor controle en herstel van gemiste instructies. Er bestaat een private proef met een gecontroleerde momentopname; robuuste automatische herkenning bij overlays en andere schermformaten is nog niet gereed |
| Zelf vijandelijke invloed berekenen | Algemene regels geven onvoldoende informatie om campagne-afhankelijke appbeslissingen te reproduceren. Hiervoor is geen eigen spelregelimplementatie toegevoegd |

## Geïmplementeerde doorsnede

De private adapter herkent het dagfasescherm en leest de zichtbare Engelse instructies van de vorm “locatie heeft nu aantal factie-invloed”. Twee overeenkomende waarnemingen zijn vereist. Een onbekende locatie, dubbel bericht of ongeldige hoeveelheid blokkeert de overname van dat scherm. Onbekende instructies over controle worden niet omgezet in veronderstelde kubussen of controlefiches.

Dit draait zelfstandig in een lokale achtergrondtaak, zonder Codex of een geopende bordbrowser. Zie [starten en zelfstandige verificatie](ZELFSTANDIGE-KOPPELING.md).

De publieke, headless functie `buildInfluenceArrangement(profile, state, updates)` ontvangt uitsluitend expliciete eindstanden. Ze behoudt andere facties, personages, controlefiches en ficheszijden, controleert de beschikbare voorraad en levert één bestaande `table.arrange`-opdracht. Er wordt niets bijgeteld bij iedere uitlezing: dezelfde eindstanden opnieuw toepassen verandert niets. Voorraadafname wordt vóór toename verwerkt. Engine, sessieformaat en regelsmodus veranderen niet.

In de echte Android-proef zijn drie zichtbare St. Ambrose-instructies automatisch overgenomen: Sant’Ambrogio 3, Solari 3 en Sempione 1. De browsercontrole via de LAN-bordlink bevestigt de aantallen en herhaald uitlezen zonder duplicaten. Dit gebeurde zonder sensorinvoer of op Confirm drukken. De volledige projectsuite slaagt met 42 tests.

## Grenzen en vervolg

Deze doorsnede is gekalibreerd op het huidige Engelse tabletscherm. Niet-zichtbare of weg geklikte logregels worden niet achteraf gereconstrueerd. De status meldt daarom het aantal **zichtbare invloedseindstanden**, niet dat de hele dagfase is gesynchroniseerd. Andere talen, controleovernames, NPC-verplaatsingen, scrollende logboeken en algemene faseovergangen vereisen aanvullende voorbeelden en tests. Een volgende stap is een volledige kaartvergelijking vóór de fase als gereed wordt gemarkeerd. De speler blijft Confirm bedienen in de officiële app.

## Uitbreiding Sunset op 24 oktober 2026

De vastgelegde Android-melding tijdens Sunset bevat naast invloedseindstanden ook een expliciete opdracht om controle uit QT8 te verwijderen. De parser herkent deze instructie nu. De publieke pure builder `buildBoardInstructions` combineert invloedseindstanden en expliciete controleverwijderingen in één atomaire tafelopdracht. Alleen controlefiches op het genoemde district gaan naar de voorraad; invloed, onderzoek, personages en andere locaties blijven behouden. Herhaling verandert niets.

De melding over een nieuwe Fixer wordt als aankondiging herkend. Zonder plaatsingsbestemming wordt geen miniatuur verplaatst. De Sunset-parser en volledige achtergrondverwerking zijn getest met de vastgelegde OCR-waarneming in een aparte testsessie, zonder browser, HTTP-verzoeken of wijzigingen aan de echte campagne. Na de pauze stond de echte app weer in de verbindingssetup; deze Sunset-uitbreiding is daarom nog niet opnieuw op een live Sunset-scherm geaccepteerd.

## Haven-terugkoppeling

De eerste Haven-implementatie herkende een volgend personage, maar niet de overgang van het laatste personage naar de dagfase. Die ontbrekende bevestigingsroute is toegevoegd en afzonderlijk getest. Een verstuurde Haven-bestemming blijft bewaard tot herkenbare bevestiging; ook een stabiel herkend dagfasescherm kan die bevestiging leveren. Latebra's eerder ontbrekende positie is op gebruikersaanwijzing naar Haven 3L hersteld; haar oorspronkelijke sensorbestemming was niet gelogd en is hiermee niet onafhankelijk bewezen.

## Herstellen na het laden van een campagne

Op 24 oktober 2026 bleek de opgeslagen digitale tafel nog de latere dagfasestand te bevatten terwijl Milan een oudere campagne laadde. De private adapter herkent nu het Engelse scherm **Scenario setup → Components setup** op de geverifieerde tabletresolutie. Hij leest alle dertig districten en controleert de invloed- en controletotalen afzonderlijk tegen de drie factielegenda's. Alleen twee overeenkomende volledige lezingen mogen de tafel vervangen. Ontbrekende aantallen, dubbele locaties of afwijkende totalen blokkeren de overname.

Dit is live uitgevoerd: 22 controlefiches en 11 invloedstenen zijn uit het geladen opstellingsscherm overgenomen, inclusief het verwijderen van verouderde invloed. De zelfstandige achtergrondtaak deed dit zonder een bordbrowser. Een afzonderlijke proef met het vastgelegde tabletscherm controleert OCR, twee lezingen, herhaling, ongeldige waarnemingen en behoud van overige onderdelen. De echte bordpagina is in de browser gecontroleerd.

Dit bewijst uitsluitend synchronisatie van **invloed en controle** in dit setupscherm. Personages, locatietegels en verhaalmarkers hebben afzonderlijke waarnemingen nodig. De bordpagina toont deze grens expliciet; oude posities in die categorieën mogen niet als geverifieerde geladen spelstand worden beschouwd. Er is nog geen volledige campagne-export vanuit de officiële app. Gameplaykaarten op Android krijgen niet automatisch dezelfde setupkalibratie: hun geometrie en ontbrekende legenda vereisen aparte verificatie. Herkende dag-, Sunset- en verplaatsingsinstructies blijven zelfstandig verwerkt worden.

Na Continue verscheen in de echte geladen campagne **Scan your Character**. De gekoppelde bordpagina biedt daarvoor nu zeven benoemde scanknoppen. De speler kiest; een scan is geen plaatsing en verandert geen bordpositie. De private backend controleert het actuele appscherm en de beschikbaarheid van de lezer vóór invoer. De bestaande LAN-bordrelay deelt uitsluitend de aparte bordscanroute naast de eerdere bordroutes, achter dezelfde toegangscode en oorsprongcontrole. UI-gedrag en relay zijn getest; de positieve UI-proef onderschepte de scan, stuurde geen echte spelinvoer en bevestigde geen werkelijke scanacceptatie door Milan.

Daarna toonde de echte app Simona met een plaatsingsopdracht naar Haven 2L. Deze setupstap werd eerst niet herkend, waardoor de gebruiker geen bruikbare actie zag. De private adapter koppelt de geregistreerde scan nu aan de herkenbare Haven-markering. Een aparte plaatsingsknop kan ook de al aanwezige positie naar Milan sturen: dezelfde positie vraagt bij setup nog steeds een sensorcontact. Een afwijkende bestemming wordt vóór invoer geweigerd. Bordposities worden uitsluitend na herkenbare appbevestiging bevestigd.

De bestemmingsmarkering knippert. Daarom bewaart de adapter een tweemaal waargenomen bestemming binnen dezelfde personage-opstellingsstap; een afwijkende bestemming, andere speler of ander scherm maakt die herkenning ongeldig. Dit gedrag is met wisselende waarnemingen getest. De knop is op de echte LAN-bordpagina gecontroleerd; de positieve knoptest gebruikte een onderschept invoerverzoek. Acceptatie van deze nieuwe setupplaatsing door de officiële app moet nog door de speler worden getest. Alleen het waargenomen Haven-opstellingsscherm is hiermee gedekt; andere plaatsingsgeometrie vereist aanvullende verificatie.


## Begin van de nacht: door Milan verplaatste personages

Op 24 oktober is het zichtbare overzicht **Night 1 has begun** vastgelegd met vier afzonderlijke meldingen dat Simona, Orlando, Latebra en Dante naar QT8 zijn verplaatst, plus verwijderde controle in QT8. Dit is een resultaatmelding van de officiële app, geen verzoek om vier nieuwe sensorcontacten. De eerdere parser herkende dit scherm alleen als stadskaart, waardoor de miniaturen op hun oude Havenposities bleven en slepen geblokkeerd was.

De adapter leest nu de expliciet genoemde namen en bestemmingen. Na twee overeenkomende waarnemingen neemt hij de zichtbare verplaatsingen en controleverwijdering in één atomaire bordupdate over. Namen, bestemmingen en dubbele vermeldingen worden gecontroleerd; onbegrepen relevante instructies blokkeren de overname. Er wordt niet aangenomen dat ieder personage bij iedere nacht naar QT8 gaat. Invloed, ghouls, bondgenoten, locatietegels en andere markers blijven behouden tenzij er afzonderlijke geldige instructies voor zijn. Herhaling verandert niets en er worden geen sensorcontacten of spelkeuzes verstuurd.

De proef met het vastgelegde echte overzicht controleert alle vier bestemmingen, twee lezingen, idempotentie, behoud van overige onderdelen en afwijzing van onbekende namen/bestemmingen. Deze geïsoleerde proef werkt zonder bordbrowser, game-invoer of leesbaar saveprofiel. De definitieve posities verschijnen ook bij de normale statusverversing van de bordbrowser. Een reeds gesloten overzicht moet opnieuw zichtbaar worden om een nieuwe live overname te kunnen controleren; de adapter speelt geen oude screenshots af op de actieve campagne.
