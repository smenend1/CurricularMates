# Matemàtiques ESO · Situacions i eines v11

## Correcció principal

La v10 podia donar aquest error en algunes SA noves:

`Cannot read properties of undefined (reading 'map')`

La causa era que les noves situacions per curs feien servir claus noves, però una capa curricular anterior encara buscava les claus antigues.

## Canvis

- S'ha desactivat la capa antiga que provocava l'error.
- S'ha afegit una connexió curricular segura per a totes les SA noves.
- Les SA de v10 es mantenen.
- Es mantenen els botons:
  - Imprimir rúbrica
  - Exportar PDF visual complet
- Si una SA no té dades específiques, s'usen dades curriculars genèriques segons el curs.

## Recomanació

En pujar a GitHub Pages, esborra la memòria cau o desinstal·la la PWA anterior per evitar que segueixi carregant la v10.
