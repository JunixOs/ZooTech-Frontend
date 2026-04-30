# Zootech - Enterprise Management System

Zootech es una plataforma de gestión empresarial moderna construida con **Angular 21**, siguiendo los principios de **Clean Architecture** y las últimas APIs reactivas de Angular.

## 🚀 Guía de Inicio Rápido

Sigue estos pasos para configurar el proyecto en tu entorno local.

### Requisitos Previos
*   **Node.js**: v20.x o superior (Recomendado v22+)
*   **NPM**: v10.x o superior
*   **Angular CLI**: v21.x (`npm install -g @angular/cli`)

### Instalación de Dependencias
Para asegurar que todas las librerías (incluyendo el motor de traducciones e iconos) se instalen correctamente, ejecuta:

```bash
npm install
```

### Ejecución en Desarrollo
Inicia el servidor de desarrollo local:

```bash
npm start
```
La aplicación estará disponible en [http://localhost:4200](http://localhost:4200).

---

## 🏗️ Arquitectura del Proyecto

El proyecto utiliza una estructura de **Bounded Contexts** con separación por capas para garantizar escalabilidad y mantenibilidad:

*   **Core (`src/app/core`)**: Servicios singleton globales (Auth, Multitenancy, Interceptores, Configuración).
*   **Shared (`src/app/shared`)**: Componentes de UI reutilizables (Botones, Inputs), pipes, directivas y utilidades puras.
*   **Layout (`src/app/layout`)**: Estructura visual de la aplicación (Shell, Header, Sidebar, Footer).
*   **Modules (`src/app/modules`)**: Módulos de negocio independientes. Cada uno se divide en:
    *   `domain/`: Entidades y reglas de negocio.
    *   `application/`: Casos de uso y servicios de aplicación (Facades).
    *   `infrastructure/`: Adaptadores, repositorios y llamadas a APIs.
    *   `presentation/`: Componentes inteligentes y vistas de Angular.

---

## 🛠️ Tecnologías Principales

*   **Framework**: Angular 21 (Standalone Components).
*   **Estado**: Angular Signals para una reactividad fina y eficiente.
*   **Estilos**: SCSS (Diseño "Rose & Mauve" con Glassmorphism).
*   **i18n**: `@ngx-translate` para soporte multi-idioma (ES, EN, PT).
*   **Iconos**: `lucide-angular`.

---

## 📝 Convenciones de Desarrollo

1.  **Path Aliases**: Evita imports relativos complejos. Usa los alias configurados:
    *   `@core/*`
    *   `@shared/*`
    *   `@modules/*`
2.  **Naming**: Los componentes deben usar el prefijo `zt-` (ej: `<zt-login>`).
3.  **Standalone**: No utilices `NgModules`. Todos los nuevos componentes, pipes y directivas deben ser `standalone: true`.
4.  **Traducciones**: No escribas texto estático en el HTML. Agrega las llaves en `src/assets/i18n/` y usa el pipe `translate`.

---

## 📦 Comandos Útiles

*   `ng generate component modules/nombre-feature/presentation/nombre-comp`: Generar nuevos componentes en la capa correcta.
*   `npm run build`: Generar el bundle de producción en `/dist`.
*   `npm test`: Ejecutar pruebas unitarias con Vitest.
