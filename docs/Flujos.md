# Flujos de trabajo: Testing, Despliegue y Contribución - Backend

---

Este documento describe los flujos de trabajo clave para el testing, despliegue y contribución al proyecto backend de Tabanok.

## Testing y cobertura (Backend)

Para asegurar la calidad del código en el backend, se han implementado pruebas unitarias. Actualmente, **todos los tests están pasando**. **Se han corregido los tests unitarios para `auth.service.spec.ts`.** Se busca mantener una buena cobertura de código.

*   **Ejecutar todos los tests:** Para ejecutar los tests en el backend, navegue al directorio (`backend-tabanok/`) y utilice el siguiente comando:

    ```bash
    pnpm test
    ```

*   **Generar reporte de cobertura:** Para generar un reporte detallado de la cobertura de código en el backend, navegue al directorio (`backend-tabanok/`) y ejecute el siguiente comando:

    ```bash
    pnpm test:cov
    ```

    El reporte se generará en el directorio `coverage/` dentro del directorio del proyecto.

*   **Revisión de cobertura:** Revise el reporte generado para identificar archivos o secciones de código con baja cobertura de pruebas.
*   **Añadir tests:** Añada pruebas unitarias para cubrir casos no probados, priorizando los módulos y funcionalidades críticas del sistema.
*   **Objetivo de cobertura:** Se busca mantener una cobertura mínima del 80% en el backend.

## Despliegue (Backend)

El proceso de despliegue a producción para el backend está automatizado a través de la integración de GitHub Actions, Docker Hub y Render.

*   **Flujo de Despliegue Automatizado:**
    1.  Un push a la rama `main` en el repositorio del backend (`backend-tabanok`) activa el flujo de trabajo de GitHub Actions (`.github/workflows/docker-publish.yml`).
    2.  Este flujo de trabajo construye la imagen Docker más reciente de la aplicación backend.
    3.  La imagen Docker se publica automáticamente en Docker Hub.
    4.  Render, al estar configurado para desplegar automáticamente desde Docker Hub en respuesta a los cambios en la rama `main` del repositorio de GitHub, detecta la nueva imagen publicada.
    5.  Render descarga la nueva imagen y despliega automáticamente la nueva versión de la aplicación backend en el entorno de producción. (Falta activar el paso SSH)

*   **Activación del Despliegue:** Para desplegar una nueva versión a producción, simplemente realice un push a la rama `main` del repositorio del backend. (El paso SSH para la activación completa del despliegue aún no está implementado)

## Contribución (Backend)

Se fomenta la contribución al proyecto backend de Tabanok siguiendo un flujo de trabajo basado en ramas y Pull Requests en su repositorio.

1.  **Clonar el repositorio:** Clone el repositorio del backend.

    ```bash
    git clone https://github.com/rmcam/backend-tabanok
    ```

2.  **Crear una rama:** Navegue al directorio del proyecto clonado y cree una nueva rama a partir de la rama principal (`main`) para desarrollar su funcionalidad o corrección:

    ```bash
    git checkout -b feature/nombre-de-la-funcionalidad
    ```

    o

    ```bash
    git checkout -b fix/descripcion-de-la-correccion
    ```

3.  **Realizar cambios y hacer commit:** Implemente sus cambios y realice commits con mensajes claros y descriptivos. Asegúrese de que los comandos de linting y pruebas pasen localmente antes de hacer commit.

    ```bash
    git add .
    git commit -m "feat(nombre-del-modulo): Descripción concisa de la funcionalidad"
    ```

    o

    ```bash
    git commit -m "fix(nombre-del-modulo): Descripción concisa de la corrección"
    ```

4.  **Generar cobertura (opcional pero recomendado):** Si ha realizado cambios significativos, genere el reporte de cobertura y, si es posible, añada pruebas para mejorarla.

    ```bash
    pnpm test:cov
    ```

5.  **Subir los cambios:** Suba su rama al repositorio remoto:

    ```bash
    git push origin nombre-de-su-rama
    ```

6.  **Crear un Pull Request:** Abra un Pull Request en el repositorio del backend en GitHub, describiendo claramente los cambios realizados, el problema que resuelve o la funcionalidad que implementa.
7.  **Revisión y merge:** Espere la revisión de su código por parte de otros colaboradores y realice los ajustes solicitados. Una vez aprobado, su Pull Request será merclado en la rama `main`.

---

Ver próximos pasos y pendientes detallados en [`./Pendientes.md`](./Pendientes.md).

---

Última actualización: 7/5/2025, 12:35 a. m. (America/Bogota, UTC-5:00)
