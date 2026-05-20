# Matemàtiques ESO · Situacions i eines v9

## Novetat principal

La v9 millora l’exportació a PDF.

Ara el botó **Exportar PDF visual** no exporta només text pla, sinó que intenta conservar:

- quadres de resultat;
- colors;
- taules;
- rúbriques;
- connexió curricular numerada;
- badges i codis CE/CA/Sabers;
- gràfiques canvas convertides a imatge PNG.

## Ús

1. Genera una situació o fitxa docent.
2. Clica **Exportar PDF visual**.
3. Al diàleg d’impressió, tria **Desa com a PDF**.

## Nota

L’exportació continua usant el sistema d’impressió del navegador (`window.print()`), però ara clona el contingut visual complet del resultat i hi aplica CSS propi d’impressió.
