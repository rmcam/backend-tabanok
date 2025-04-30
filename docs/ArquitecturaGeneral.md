# Arquitectura del Proyecto Tabanok

---

Este documento describe la arquitectura general del proyecto Tabanok, que consta de dos aplicaciones separadas: un frontend y un backend, cada una con su propio repositorio. Se detalla el flujo de comunicación entre ellas y las tecnologías principales utilizadas en cada proyecto.

## Estructura general

El proyecto Tabanok está dividido en dos aplicaciones principales:

*   **Backend:** (`https://github.com/rmcam/backend-tabanok`) API REST con NestJS y lógica de negocio.
*   **Frontend:** (`https://github.com/rmcam/frontend-tabanok`) Aplicación React + Vite (interfaz de usuario).

Cada aplicación reside en su propio repositorio de Git.

## Flujo general

El flujo de datos y la interacción entre el frontend y el backend se organizan de la siguiente manera:

*   El **Frontend** consume la API RESTful expuesta por el **Backend** para obtener datos y realizar operaciones.
*   El **Backend** se conecta a la base de datos **PostgreSQL** para almacenar y recuperar información.
*   La comunicación entre el frontend y el backend se realiza a través de solicitudes HTTP a los endpoints de la API.
*   **Docker Compose** (`docker-compose.yml` en el repositorio principal si aplica, o en cada repositorio si se gestionan por separado) facilita la configuración y el levantamiento del entorno de desarrollo completo, incluyendo la base de datos, el backend y el frontend, en contenedores aislados.

## Tecnologías principales

Las tecnologías clave utilizadas en el proyecto son:

*   **Backend:**
    *   Framework: **NestJS**
    *   ORM: **TypeORM**
    *   Base de datos: **PostgreSQL**
    *   Autenticación: **JWT** (JSON Web Tokens)
    *   Contenerización: **Docker**
    *   Limitación de velocidad: Implementada en el frontend para evitar demasiadas solicitudes a la API.
*   **Frontend:**
    *   Librería de UI: **React**
    *   Herramienta de build: **Vite**
    *   Framework de CSS: **TailwindCSS**
*   **Testing:** **Jest**, **Testing Library**
*   **Linting/Formateo:** **ESLint**, **Prettier**
*   **Internacionalización:** **react-i18next**
*   **Validación:** **Zod**

---

Ver pendientes y mejoras futuras en [`./Pendientes.md`](./Pendientes.md).

---

Última actualización: 24/4/2025, 9:00 p. m. (America/Bogota, UTC-5:00)
