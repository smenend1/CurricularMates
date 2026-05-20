# Matemàtiques ESO · Situacions i eines v8

## Novetat principal

La v8 afegeix exportació d’informes a PDF.

Quan es genera una situació o una fitxa docent, apareix el botó:

- **Exportar informe a PDF**

El botó obre una versió imprimible de l’informe. Des del navegador es pot triar:

- **Imprimeix**
- **Desa com a PDF**

## Android

A Chrome per Android:

1. Genera l’informe.
2. Toca **Exportar informe a PDF**.
3. Al quadre d’impressió, tria **Desa com a PDF**.
4. Desa el fitxer.

## Notes tècniques

No s’utilitza cap llibreria externa.  
L’exportació funciona amb `window.print()`, que és més compatible amb GitHub Pages i PWA.
