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
