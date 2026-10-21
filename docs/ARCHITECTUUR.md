# Architectuur

Huidig: browserinterface → bordmodel → eigen lokaal eventlog → JSON-download.
Geen netwerktransport, BLE of officiële app-integratie in de applicatie.

De lokale Node-server serveert alleen expliciet toegestane statische bestanden op loopback.

Het model bewaart vier synthetische pion-ID's en nulgebaseerde coördinaten. Iedere cel bevat maximaal één pion, conform de gedocumenteerde sensorcapaciteit; dit is geen uitspraak over Milan-spelregels. Coördinaten zijn niet naar hardware vertaald.

Toekomstig: voeg een aparte adapter toe zodra een toegestane interface bewezen is. Die vertaalt eigen domeinevents naar een gedocumenteerd contract. De UI mag nooit rechtstreeks GATT-payloads maken. Houd simulator, echte hardware en appcompatibiliteit als afzonderlijke capabilities zichtbaar. De huidige events zijn nadrukkelijk geen onderschepte Teburu-berichten.
