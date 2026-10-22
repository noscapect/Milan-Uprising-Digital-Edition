# Locatiekaart en campagne-opstelling 0.6

Geïmplementeerd op 22 oktober 2026 in `data/games/milan-uprising/campaign.json`, release `milan-city` versie `0.6.0`. Het retailpakket 0.5 en zijn exports blijven afzonderlijk bruikbaar.

## Gereconstrueerde bordgegevens

De [officiële productie-update 42 van Xplored](https://gamefound.com/en/projects/xplored/vampire-the-masquerade-milan-uprising/updates/42) bevat een onbezette volledige bordfoto. De [latere update 59](https://gamefound.com/en/projects/xplored/vampire-the-masquerade-milan-uprising/updates/59) toont hetzelfde bord tijdens spel. Uit deze bronnen zijn de districtnamen, hun globale onderlinge ligging en attribuuticonen afgelezen. De [handleiding, pagina 13](https://teburu.com/downloads/VtM/VTM_MU_GameManual.pdf) verklaart de attribuuticonen. Alleen feitelijke namen/kenmerken zijn opgenomen, met eigen geometrische presentatie.

De stadskaart op deze foto's heeft dertig districten, naast tien zichtbare Havenvelden. De veertig sensors mogen niet worden gelijkgesteld aan veertig stadsdistricten. Oudere marketing/prototypes zijn geen garantie voor de uiteindelijke locatieverdeling.

| Rij in onze schematische weergave | Districten, van links naar rechts |
| --- | --- |
| 1 | QT8, Sempione, Monumentale, Isola, Centrale, NoLo |
| 2 | San Siro, City Life, Chinatown, Garibaldi, Buenos Aires, Città Studi |
| 3 | Bande Nere, Washington, Cadorna, Duomo, Cinque Giornate, Corsica |
| 4 | Giambellino, Solari, Navigli, Bocconi, Porta Romana, Calvairate |
| 5 | Ronchetto, Barona, Sant’Ambrogio, Ripamonti, Vigentino, Corvetto |

Links van iedere rij staan twee Havenvelden. Labels `Haven 1L` tot `Haven 5R` zijn eigen plaatsaanduidingen, geen officiële kamernamen. Kamereffecten, aankoop-/upgradevoorwaarden en de interpretatie van de Havenvelden als speelbare ruimtes zijn hiermee niet geautomatiseerd.

De rechthoekige vakken zijn een schema. Ze reproduceren geen exacte kaartgrenzen en leveren geen aangrenzendheidsgraaf op. Vrije handmatige plaatsing betekent niet dat een verplaatsing volgens Milan-regels legaal is. Het pakket markeert `adjacencyVerified` en `sensorMappingVerified` expliciet als `false`. De fysieke BLE-sensorvolgorde is niet uit de foto's afgeleid. Vergelijking met een actueel retailbord blijft nodig.

## Campagne-opstelling invoeren

Het nieuwe scherm laat een door de officiële app aangegeven opstelling vastleggen:

1. Kies vier verschillende basispersonages en geef hun startpositie op, in een district of Havenveld.
2. Vul per district de drie factie-invloeden, een controlefiche en eventueel een afgesloten-locatiefiche in.
3. Plaats aanwezige NPC’s, bondgenoten, ghouls en eventueel het Masquerade-fiche.
4. Pas de ingevulde opstelling toe. Alle niet toegewezen onderdelen gaan terug naar voorraad; ficheszijden worden vanuit de ingevulde waarden opgebouwd.

Een opstelling is één atomaire opdracht, met undo/redo en JSON-herstel. De builder controleert de vier verschillende personages, geldige locaties, de fysieke voorraad en geschikte zijden van controlefiches. Invloedinvoer is begrensd op drie per factie per locatie, zoals beschreven in de handleiding op pagina 6. Controle volgt uitsluitend de invoer; er wordt geen automatische invloed-/controleberekening uitgevoerd.

Controlefiches worden via bipartiete matching toegewezen. Zo wordt een beschikbare Anarch/Camarilla-zijde niet onnodig verbruikt als een andere zijde een later gevraagd district mogelijk maakt. Een onmogelijke verdeling wordt geweigerd voordat de lopende tafel verandert.

## Nog geen officiële beginstand

De geraadpleegde openbare bronnen leverden geen geverifieerd volledig recept voor de Chronicle-start: geen complete lijst van beginposities, factie-invloed, controle en actieve NPC’s. De foto's tonen productievoorbeelden of spelsituaties en zijn niet als officiële campagne-opstelling overgenomen. Een opstelling met willekeurig verdeelde kubussen zou dit hiaat slechts verbergen.

Het pakket bevat daarom `officialInitialPositionsVerified: false`. De invulwaarden nul/voorraad zijn lege formulierwaarden, geen spelpreset. De geautomatiseerde tests gebruiken expliciet synthetische invoer, geen beweerde officiële start. Het formulier is een fysieke opstellingshulp en start geen campagne in de officiële app.

Voor een volledig geverifieerde campagne-opstelling ontbreken nog de daadwerkelijke setupaanwijzingen van de ongewijzigde app of een andere officiële, reproduceerbare startreferentie. Ook de exacte kaartverbindingen, Havenwerking en appintegratie blijven open. Deze uitbreiding voltooit de benoemde bordvelden en handmatige opstellingsbediening, niet die nog onbewezen onderdelen.

De bronfoto's en tijdelijke browsercontroles staan uitsluitend onder genegeerd `work/`. Geen beschermde kaartillustratie, appbestand, firmware of hardware-identifiers zijn in het pakket opgenomen. De lokale demo blijft zonder externe dependencies werken.
