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
1. Crear una nueva carpeta y navegar hasta ella
```bash
md app-internacion
cd app-internacion
```

2. Clonar (descargar) el repositorio
```bash
git clone https://github.com/hospitalneuquen/app-internacion.git
```

3. Instalar dependencias de Node
```bash
npm install
```

Correr la aplicación
------
Con [vApp](https://github.com/hospitalneuquen/vapp) corriendo, navegar hasta *http://localhost:81/app/internacion*

Generar documentación
---

1. Documentar los componentes Angular utilizando [ng-doc](https://github.com/angular/angular.js/wiki/Writing-AngularJS-Documentation)

3. La primera vez preparar el proyecto

```bash
cd docs
bower install

cd docs
bower install
npm install
```

2. Compilar con gulp

```bash
cd docs\docs
gulp
```

3. Para visualizar la documentación navegar a *http://localhost:81/app/internacion/docs*

4. Para facilitar las tareas de documentación puede iniciarse un servidor local que utiliza [BrowserSync](https://www.browsersync.io/)
```bash
cd docs\docs
gulp docs:serve
```
