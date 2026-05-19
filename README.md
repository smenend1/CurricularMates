# Matemàtiques ESO · Situacions i eines v4

Versió corregida de la PWA educativa de Matemàtiques ESO.

## Correcció principal

La v4 reescriu el motor JavaScript perquè els formularis facin accions reals de manera fiable.

S'ha corregit especialment:

- canvi d'àrea a l'apartat de Fórmules;
- botó Mostrar;
- formularis que podien tornar a dalt de la pàgina sense actualitzar resultat;
- càrrega de `app.js` amb cache busting `?v=4`;
- càrrega del Service Worker amb versió nova;
- botons amb tipus explícit;
- formularis amb prevenció de recàrrega.

## Què pots fer amb l'app

- Veure itineraris per 1r, 2n, 3r i 4t ESO.
- Calcular situacions d'aprenentatge:
  - excursió,
  - aula o habitació,
  - tarifes,
  - enquesta,
  - consum energètic,
  - probabilitat i jocs.
- Utilitzar eines:
  - equació lineal,
  - equació quadràtica,
  - proporcionalitat,
  - percentatges,
  - geometria,
  - estadística,
  - gràfiques.
- Consultar fórmules per àrees.
- Fer una autoavaluació del procés matemàtic.

## Recomanació en actualitzar a GitHub Pages

Com que les PWA poden quedar en memòria cau, després de pujar la v4 convé:

1. Obrir la web.
2. Fer una recàrrega forta.
3. Si al mòbil continua carregant una versió antiga, desinstal·lar la PWA anterior.
4. Esborrar dades del lloc o memòria cau.
5. Tornar a instal·lar.
