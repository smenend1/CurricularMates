# Matemàtiques ESO · Situacions i eines v1

PWA educativa en català per treballar Matemàtiques a l’ESO a partir de situacions d’aprenentatge, eines matemàtiques, fórmules i autoavaluació competencial.

Aquesta aplicació és una primera versió base. Està pensada per funcionar en mòbil, tauleta i ordinador, i es pot instal·lar com a PWA des del navegador.

## Objectiu de l’app

L’objectiu no és només calcular resultats, sinó ajudar l’alumnat a seguir un procés matemàtic complet:

1. Entendre el context.
2. Identificar les dades.
3. Triar una estratègia.
4. Fer els càlculs.
5. Representar, si cal, amb taules o gràfiques.
6. Comprovar si el resultat té sentit.
7. Escriure una conclusió.

## Apartats principals

L’app inclou els apartats següents:

- **Inici**: presentació general de l’aplicació.
- **Cursos**: itineraris per 1r, 2n, 3r i 4t d’ESO.
- **SA**: situacions d’aprenentatge mare.
- **Eines**: calculadores i eines guiades.
- **Fórmules**: compendi inicial de fórmules i conceptes.
- **Autoavaluació**: checklist per revisar el procés matemàtic.

## Situacions d’aprenentatge incloses

La versió v1 inclou aquestes situacions inicials:

- Organitzem una excursió.
- Dissenyem una aula o habitació.
- Comparem tarifes.
- Analitzem una enquesta.
- Consum energètic i sostenibilitat.
- Probabilitat i jocs.

Cada situació té quatre nivells:

- **Nivell 1**: entendre i calcular.
- **Nivell 2**: representar i comparar.
- **Nivell 3**: modelitzar i justificar.
- **Nivell 4**: crear una proposta pròpia.

## Eines matemàtiques incloses

La versió inicial inclou:

- Equació lineal.
- Equació quadràtica.
- Proporcionalitat directa.
- Percentatges.
- Geometria bàsica.
- Estadística bàsica.
- Gràfica de funció lineal o quadràtica.

Les eines mostren procediment pas a pas i validen les entrades per evitar errors comuns, com denominadors zero o valors no numèrics.

## Fórmules i conceptes

Inclou un compendi inicial organitzat per blocs:

- Sentit numèric.
- Mesura i geometria.
- Àlgebra i funcions.
- Estadística i probabilitat.
- Trigonometria.

Aquest apartat es pot ampliar en versions futures amb més fórmules, exemples i imatges.

## Estructura de fitxers

```txt
matematiques-eso-pwa-v1/
├── index.html
├── styles.css
├── app.js
├── manifest.json
├── sw.js
├── icon-192.png
├── icon-512.png
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── assets/
    ├── autoavaluacio.png
    ├── cursos.png
    ├── eines.png
    ├── grafiques.png
    ├── sentits.png
    └── situacions.png
```

## Com provar l’app localment

Perquè el Service Worker funcioni correctament, és millor obrir l’app des d’un servidor local, no directament fent doble clic a `index.html`.

Opció amb Python:

```bash
python -m http.server 8000
```

Després obre al navegador:

```txt
http://localhost:8000
```

## Com publicar-la a GitHub Pages

1. Crea un repositori a GitHub.
2. Puja tots els fitxers de la carpeta `matematiques-eso-pwa-v1`.
3. Ves a **Settings**.
4. Entra a **Pages**.
5. A **Build and deployment**, selecciona:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
6. Desa els canvis.
7. Obre l’URL generada per GitHub Pages.

## Instal·lació com a PWA

Quan l’app estigui publicada amb HTTPS, per exemple amb GitHub Pages:

### Android

1. Obre l’app amb Chrome.
2. Toca el menú de tres punts.
3. Tria **Afegeix a la pantalla d’inici** o **Instal·la l’aplicació**.
4. Accepta la instal·lació.

### Ordinador

1. Obre l’app amb Chrome o Edge.
2. Busca la icona d’instal·lació a la barra d’adreces.
3. Instal·la l’app.

## Funcionament offline

L’app inclou:

- `manifest.json`
- `sw.js`
- icones PNG
- imatges PNG internes
- memòria cau bàsica dels fitxers principals

Quan l’app s’ha obert almenys una vegada amb connexió, el navegador pot guardar-la en memòria cau i permetre l’ús offline.

Si fas canvis i el mòbil continua carregant una versió antiga, prova:

1. Tancar l’app.
2. Esborrar la memòria cau del navegador.
3. Desinstal·lar la PWA anterior.
4. Tornar a obrir l’URL publicada.
5. Instal·lar-la de nou.

## Tecnologies utilitzades

- HTML5
- CSS3
- JavaScript Vanilla
- Canvas HTML5 per a gràfiques
- Service Worker
- Web App Manifest
- PNG locals per a icones i imatges

No utilitza llibreries externes.

## Estat de la versió

Versió: **v1**

Aquesta versió és una base inicial funcional. Encara es pot ampliar amb:

- més situacions d’aprenentatge;
- més eines matemàtiques;
- més fórmules;
- connexió entre situacions i eines concretes;
- rúbriques més detallades;
- itineraris més complets per curs;
- exportació o impressió de resultats;
- banc d’exercicis graduats.

## Llicència i ús

Projecte educatiu pensat per a ús docent i d’aprenentatge. Es pot adaptar, ampliar i modificar segons les necessitats del centre o de l’aula.
