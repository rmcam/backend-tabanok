# Arquitectura del Proyecto Tabanok - Backend

---

Este documento describe la arquitectura del backend del proyecto Tabanok.

## Estructura

El backend de Tabanok es una API REST con NestJS y lógica de negocio. Reside en su propio repositorio de Git: [`https://github.com/rmcam/backend-tabanok`](https://github.com/rmcam/backend-tabanok).

## Flujo

El **Backend** se conecta a la base de datos **PostgreSQL** para almacenar y recuperar información.

## Tecnologías principales

Las tecnologías clave utilizadas en el backend son:

*   Framework: **NestJS**
*   ORM: **TypeORM**
*   Base de datos: **PostgreSQL**
*   Autenticación: **JWT** (JSON Web Tokens)
*   Contenerización: **Docker**
*   Limitación de velocidad: Implementada en el backend para proteger la API.
