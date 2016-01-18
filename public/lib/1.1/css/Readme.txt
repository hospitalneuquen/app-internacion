Para instalar un nuevo Skin de Bootswatch:
--------------------------------------------
Ultima revisión: 07/07/2014 | jgabriel
--------------------------------------------

1) Crear una carpeta en "\lib\1.0\css". (Ejemplo [...]\css\myNewSkin)
2) Copiar todos los archivos de un skin existente en la nueva carpeta (css\skinActual --> css\myNewSkin)
3) Sobreescribir los archivos "bootswatch.less" y "variables.less" con los del nuevo skin (css\myNewSkin)
4) Compilar "bootstrap.less" 

5) Crear y configurar un archivo .ajaxmin para compilar los .css en \lib\1.0 (Ej: build.css.myNewSkin.ajaxmin)
   (se recomienda comenzar por un archivo ya existente)
6) Compilar el proyecto. 
7) Utilizando la opción "Show all files" mostrar el nuevo .css creado e incluirlo en el proyecto  (Ejemplo: lib.myNewSkin.css)
8) Registrar el skin en Plex.js
9) ¡Listo! El usuario ya puede utilizar el nuevo skin

Pasos avanzandos
-----------------
Para evitar que el skin descargue fonts desde algún CDN externo (Ej: google)  ...
1) Abrir el archivo "bootswatch.less" y abrir en un browser el archivo importado en la primera linea.
   Ejemplo: @import url("//fonts.googleapis.com/css?family=Lobster|Cabin:400,700");
2) Reemplazar la linea "@import" por el contenido del archivo
3) Descargar todos los archivos .woff referenciados y copiarlos a una subcarpeta "Fonts" (css\myNewSkin\fonts)
4) Reemplazar todos las URL al CDN externor por el path local (/lib/1.0/css/myNewSkin/fonts/)