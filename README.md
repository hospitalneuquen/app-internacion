App-Internacion
==========

Aplicación para gestión de internaciones de pacientes

Prerequisitos
-----
* [Client GIT](https://git-scm.com/download/win)
* [Node.JS](https://nodejs.org/en/download/)
* [Bower](http://bower.io/)
* [Gulp](http://gulpjs.com/)
* [vApp](https://github.com/hospitalneuquen/vapp)
* [api-internacion](https://github.com/hospitalneuquen/api-internacion)

Cómo compilar
------
Crear una nueva carpeta y `cd` hasta ella:
```bash
md app-internacion
cd app-internacion
```

Clonar (descargar) el repositorio:
```bash
git clone https://github.com/hospitalneuquen/app-internacion.git
```

Instalar dependencias de Node:
```bash
npm install
```

Correr la aplicación
------
Con [vApp](https://github.com/hospitalneuquen/vapp) corriendo, navegar hasta *http://localhost:81/app/internacion*

Generar documentación
---

Documentar los componentes Angular utilizando [ng-doc](https://github.com/angular/angular.js/wiki/Writing-AngularJS-Documentation)

La primera vez preparar el proyecto:

```bash
cd docs
bower install

cd docs
bower install
npm install
```

Compilar con gulp:

```bash
cd docs\docs
gulp
```

Para visualizar la documentación navegar a *http://localhost:81/app/internacion/docs*

Para facilitar las tareas de documentación puede iniciarse un servidor local que utiliza [BrowserSync](https://www.browsersync.io/):
```bash
cd docs\docs
gulp docs:serve
```
