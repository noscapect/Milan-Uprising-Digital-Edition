# Invloed op de Android-kaart synchroniseren

Op 24 oktober 2026 toonde Milan twee St. Ambrose-invloed in Sant’Ambrogio, terwijl de virtuele tafel drie kubussen behield. De faseparser kopieerde de drie zichtbare dagfase-instructies correct, maar controleerde geen overige Android-districten. Daardoor konden aantallen uit een oudere spelstand blijven staan.

## Werking

De private Android-adapter controleert nu alle dertig zichtbare invloedstellers op de gekalibreerde stadskaart. Na twee overeenkomende volledige lezingen maakt hij één absolute invloedupdate voor de drie facties per district. Ook afnames en verdwenen invloed worden daardoor verwerkt. Controlefiches, personages, ghouls, bondgenoten, onderzoek en locatietegels worden door deze kaartlezing niet gewijzigd. Daarvoor blijven hun afzonderlijke bronnen nodig.

Een geldige lezing vereist de bekende schermindeling, kaartkop, kaartgrens en voldoende herkenbare, verspreide kaartankers. Alle dertig districten moeten uniek zijn en iedere teller moet ondubbelzinnig leesbaar zijn. Een gekleurd of genummerd vak dat niet betrouwbaar kan worden geclassificeerd, geldt als onbekend, niet als nul. De zichtbare fase-instructies worden bovendien met de kaart vergeleken. Bij een verschil wacht de volledige kaartupdate op een helder, niet meer veranderend beeld. Een onvolledige of onbekende lezing wist de vorige bordstand niet.

De bestaande expliciete fase-instructies blijven zelfstandig werken wanneer de volledige kaart niet leesbaar is. Verificatie betekent invloed op de zichtbare kaart, geen volledige campagne- of bordverificatie. Andere schermindelingen, weinig herkenbare ankers, bedekte kaarten en ontbrekende USB-toegang kunnen de volledige kaartcontrole tijdelijk verhinderen. Zodra de ondersteunde kaart weer leesbaar is, controleert de achtergrondtaak opnieuw zonder Codex of een open bordbrowser.

## Controle

Een afzonderlijk probleem bij het laden van een componentenopstelling was een achtergebleven onderzoekfiche in Sempione. Invloed en controle klopten al, waardoor de oude mapvergelijking geen wijziging zag. De setup-initialisatie ruimt nu ook oude onderzoeksfiches op, onafhankelijk van verschillen in invloed of controle. Dit is een eenmalige voorbereiding van een opnieuw aangeboden opstelling, geen afleiding dat iedere lege plek tijdens het spel geen onderzoek mag bevatten. Restricted-fiches, personages en andere categorieën worden hierdoor niet gewist. Een nieuwe appinstructie kan daarna weer een onderzoekfiche plaatsen.

De huidige opruiming is live gecontroleerd: het oude fiche is verdwenen en alle dertig invloed-/controlelocaties blijven overeenkomen. Een afzonderlijke levenscyclusproef controleert dat een vers bevestigd fiche tijdens dezelfde setup behouden blijft en dat een volgende setup oude onderzoeksfiches opnieuw opruimt.

De proef met het vastgelegde echte Android-scherm herkent alle dertig districten, de afname van drie naar twee in Sant’Ambrogio en de drie zichtbare dagfase-instructies. Een geïsoleerde sessie controleert correctie van oude invloed op een lege locatie, behoud van alle overige onderdelen, twee overeenkomende beelden en idempotentie. Onbekende aantallen, verkeerde indeling, ontbrekende of dubbele districten en een tegenspraak met fase-instructies worden geweigerd. De regressie voor het laden van een scenario en de nachtfasetest blijven afzonderlijk slagen. Beeldmateriaal, kalibratie en ruwe waarnemingen blijven onder private/.


Na activeren is de correctie ook live uitgevoerd op de aangesloten tablet: Sant’Ambrogio is van drie naar twee St. Ambrose-kubussen bijgewerkt. De geaccepteerde kaartlezing bevatte alle dertig districten. Op de gedeelde bordpagina zijn vervolgens alle negentig factieaantallen met die momentopname vergeleken en de geplaatste invloedskubussen in de renderer gecontroleerd. Er zijn geen spelacties of sensorcontacten verstuurd. Alle 54 publieke tests slagen.
