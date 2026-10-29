# Speelbord op een andere pc openen

## Huidige bronversie — 29 oktober 2026

Start eerst de gekoppelde tafel en voer vanuit de broncheckout `node tools/share-board.mjs JOUW-PC-LAN-IP` uit. De tool bewaart het actuele adres en de tijdelijke code in `private/linked/board-share-state.json`; het Control Center toont ze zodra de deelserver bereikbaar is. De huidige releasekandidaat start deze optionele deelserver niet automatisch en bevat deze bron-CLI niet. Beschrijvingen hieronder van automatisch delen door private launchers horen bij de oudere ontwikkelopstelling. Zie [installatie](INSTALLATION.md) voor de huidige hoofdroute. De toegangsgrenzen hieronder blijven gelden.

De private gekoppelde tafel kan via het lokale netwerk op een tweede scherm worden geopend. De officiële Milan-app en de Core blijven op hun bestaande apparaten draaien; beide browsers gebruiken dezelfde tafelsessie.

De normale adressen op `127.0.0.1` werken alleen op de pc waarop de servers draaien. De aparte bordlink gebruikt het LAN-adres van die pc en poort **5182**, bijvoorbeeld `http://192.168.2.23:5182/board`. Gebruik op het tweede apparaat deze link en voer de zescijferige toegangscode in die de delende pc toont. De code staat niet in de URL. De code verandert als de deelserver opnieuw wordt gestart; de browsersessie blijft maximaal twaalf uur bewaard.

Beide apparaten moeten elkaar op het lokale netwerk kunnen bereiken. Een gastnetwerk, clientisolatie of VPN kan dat verhinderen. Windows moet inkomend TCP-verkeer op poort 5182 toestaan. De lokale proef gebruikt een eigen firewallregel voor Node, het specifieke wifi-adres en uitsluitend het lokale subnet. Er is geen routerpoort of internettoegang ingesteld. Het adres kan veranderen als de pc een ander netwerkadres krijgt.

## Wat wordt gedeeld?

De bordpagina, geselecteerde bordassets, actuele sessie en bordstatus worden doorgegeven vanuit de lokale adapter. Verplaatsingsverzoeken gaan naar dezelfde bestaande adapter, inclusief de controle op actieve speler en appbevestiging. De deelserver voegt geen spelregels of hardwareprotocol toe.

Miniaturen zijn ook via deze link met ingedrukte linkermuisknop naar een ander vak te slepen. Na een update vernieuw je de pagina met Ctrl+F5. Tijdens de appbevestiging blijft de laatst bevestigde positie zichtbaar. Zie [sleepbediening](SLEPEN-EN-SENSOREN.md).

Ook de [locatietegels](LOCATIETEGELS.md) zijn via deze link te kiezen en om te keren. Deze gedeelde tafelgegevens blijven op de host-pc bewaard. Twee gelijktijdige wijzigingen gebruiken een revisiecontrole, zodat een verouderde browserstand niet stilzwijgend de laatste wijziging vervangt.

Core-start/stop, koppelen, technische logs, handmatige sensorinvoer en opstellingsimport zijn niet via deze bordlink beschikbaar. De technische pc-bediening op poort 5180 blijft lokaal. De bordlink gebruikt een eigen aanmelding, controleert Host en Origin, beperkt foutieve codepogingen en deelt alleen de vastgelegde bordroutes.

## Implementatie en validatie

`server/board-share.mjs` biedt `createBoardShare({address, port, upstream})` met alleen ingebouwde Node.js-modules. De upstream moet op loopback draaien; het bindadres moet een lokaal IPv4-adres zijn. De private startrunner kiest een daadwerkelijk netwerkadres van deze pc en toont de tijdelijke toegangscode. De normale publieke sandbox blijft zonder deze deelserver werken.

Tests controleren aanmelding, sessiecookie, doorgegeven bordroutes, geweigerde beheerfuncties, Host/Origin-controle en begrensde codepogingen. Een browserproef via het LAN-adres op de host-pc bevestigt aanmelding en dezelfde 39 geplaatste onderdelen zonder JavaScriptfouten. Bereikbaarheid vanaf de andere fysieke pc moet de gebruiker nog bevestigen.
