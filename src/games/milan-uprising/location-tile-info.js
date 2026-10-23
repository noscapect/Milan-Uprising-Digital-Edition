import {locationTileLabel} from './location-tiles.js';
export function describeLocationTile(kind,tile,zoneLabel){
  const haven=['haven','haven-11','haven-12'].includes(tile.value);
  const summaries={herd:'Verminder Hunger met 2, tot minimaal 1.',income:'Ontvang 2 Resources.',media:'Wissel Resources in om Suspicion of Masquerade te wijzigen.',possibleHaven:'Betaal 5 Resources om je schuilplaats hierheen te verplaatsen.',secretBar:'Ruil middelen via de actie die Milan aanbiedt.',underground:'Reis naar een andere locatie.'};
  return {title:locationTileLabel(kind,{...tile,face:'visible'}),shortLabel:haven?'Schuilplaats':locationTileLabel(kind,{...tile,face:'visible'}),symbol:haven?'house':tile.value,
    summary:haven?`${zoneLabel} is de schuilplaats van je coterie: de uitvalsbasis van jullie spelersgroep. Hier begint iedere nacht.`:summaries[tile.value]||'Het tegeltype is nog niet overgenomen uit Milan.',
    use:haven?'Deze tegel geeft geen aparte locatieactie. Bij zonsopkomst kies je een Haven-kamer links op het bord en voer je de bijbehorende actie in Milan uit.':tile.value==='unknown'?'Neem eerst het symbool over dat Milan toont.':'Speel de bonus vrij via de Uprising Encounter. Gebruik de locatieactie in Milan zolang jullie het district controleren.'+(['herd','income','media','secretBar'].includes(tile.value)?' Eenmaal per nacht.':''),
    caution:haven?'Vijandelijke controle én vijandelijke invloed maken je Haven onveilig. Je kunt dan pas vertrekken nadat die invloed is verwijderd.':null,
    sourcePage:haven?'6–7':'7'};
}
