# Officiële Windows-installatie — statische controle

Gecontroleerd op 22 oktober 2026. De app is op concrete gebruikersopdracht lokaal geïnstalleerd, maar niet gestart. Alleen bestandsnamen, standaard versiemetadata, PE-architectuur en eenvoudige opstartconfiguratie zijn bekeken. Geen decompilatie, protocolanalyse of extractie van spelinhoud uitgevoerd.

## Herkomst en reproduceerbaarheid

- Officiële downloadroute: https://xplo.red/VtM-Win-Download.
- Deze route verwees tijdens de download naar https://teburu.com/downloads/VtM/BuildWindows/VTMTEBURU_v1.0.9.zip.
- Archief: `VTMTEBURU_v1.0.9.zip`, 1.014.542.313 bytes.
- SHA-256: `789E5C968445C18CDB8CD83EC7AE393FE6B3E58EB64ED4BA742C0ADE75E3EE56`.
- Alle 134 uitgepakte bestanden zijn gecontroleerd op aanwezigheid en overeenkomstige grootte met de ZIP-inhoud. Dit is geen volledige integriteits- of runtimecontrole. De hash identificeert de lokale download; er is geen onafhankelijke fabrikantchecksum vergeleken.
- Installatie onder `%LOCALAPPDATA%\Programs\Teburu\Milan Uprising\1.0.9\VTMTEBURU_v1.0.9`, met een Startmenusnelkoppeling onder Teburu.
- De app en het archief staan buiten de repository. Er zijn geen appbestanden of beschermde assets overgenomen.

## Bevindingen en betekenis

| Waarneming | Betekenis voor het project | Grens van het bewijs |
| --- | --- | --- |
| `VTMTEBURU.exe` heeft PE-machinecode `0x8664` | Dit is een Windows x64-build; een eventuele native helper moet hiermee rekening houden. | Geen bewijs voor minimale Windows-versie of werkende uitvoering op deze computer. |
| EXE-productmetadata noemt `6000.1.17f1`; `UnityPlayer.dll` en `GameAssembly.dll` zijn aanwezig | De app is een Unity-build. Houd runtimeversie en gameversie apart in een testverslag. | Milan 1.0.9 volgt hier uit de officiële archiefnaam, niet uit een waargenomen versiescherm. |
| `VTMTEBURU_Data/Plugins/x86_64/BleWinrtDll.dll`, bestands-/productversie `1.1.1` | De distributie bevat een Bluetooth WinRT-plug-in. Dit is een aanwijzing voor de Windows-Bluetoothroute. | Geen bewijs van werkelijk gebruikte API's, GATT-services, payloads, beveiliging of ondersteuning voor virtuele invoer. |
| `webrtc.dll` is meegeleverd | Noteer netwerk-/remote-functionaliteit als te onderzoeken onderdeel van de normale appflow. | Een bibliotheeknaam bewijst geen remote-invoercontract of toegang voor onze tafel. |
| Geen losse README, PDF of HTML-handleiding aangetroffen bij de controle op gangbare documentatie-extensies | Er is via deze controle geen meegeleverde integratiehandleiding gevonden. | Geen conclusie dat een ondersteunde interface nergens bestaat. |

De eenvoudige opstartconfiguratie bevat geen zichtbare instelling voor bordloos spelen of een externe invoeradapter. Dit is alleen een bevinding over dat configuratiebestand, geen bewijs dat zulke mogelijkheden ontbreken in de app of SDK.

## Wat dit nog niet oplevert

Geen bewezen Core-vervanging, karakterregistratie, sensor-/locatiemapping, sessiehandshake, appgestuurde tafelupdates of bruikbare digitale worp. Interne spelbestanden zijn geen geverifieerd of vrij herbruikbaar gegevenspakket voor onze engine.

## Eerstvolgende verificatie

Het concrete testprotocol en de niet-verzonden fabrikantvragen staan in [APP-VALIDATIE.md](APP-VALIDATIE.md).

1. Zodra zichtbare bediening mogelijk is: open de app normaal en noteer de getoonde gameversie, startflow, apparaatrollen en het precieze punt waarop een Core nodig is.
2. Probeer digitale worpen en eventuele handmatige invoer alleen via de normale UI. Als hardware de toegang blokkeert, leg die blokkade vast; concludeer niet dat de functie ontbreekt.
3. Verifieer bij Xplored of er een ondersteunde virtuele invoer-/testinterface voor bestaande officiële apps is en wat publiek geïmplementeerd mag worden. Geen aanvraag of bericht verstuurd.

Pas daarna kan een echte adapter worden gespecificeerd. De lokale `virtual-core` blijft uitsluitend onze gedragssimulatie.


## Latere statische verdieping

De eerste controle hierboven is historisch. Op 22 oktober zijn op gebruikersopdracht originele textures uitsluitend lokaal geëxporteerd; zie [ARTWORK.md](ARTWORK.md). Vervolgens is het leesbare assemblymanifest nader bekeken voor BLE-, netwerk- en WebRTC-aanwijzingen, zijn 45 locatie-presentatiebestanden geteld en is een read-only randvoorwaardenprobe uitgevoerd. Zie [APP-KOPPELING-VOORONDERZOEK.md](APP-KOPPELING-VOORONDERZOEK.md). Dit is geen runtime-/protocolvalidatie. Ruwe waarnemingen en fingerprints blijven privaat.
