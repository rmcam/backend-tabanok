# Flujos de trabajo: Testing, Despliegue y Contribución

---

Este documento describe los flujos de trabajo clave para el testing, despliegue y contribución a los proyectos frontend y backend de Tabanok.

## Testing y cobertura

Para asegurar la calidad del código, se han implementado pruebas unitarias y E2E en cada proyecto. Después de corregir los errores recientes, **todas las pruebas están pasando actualmente**, y se busca mantener una buena cobertura de código.

*   **Ejecutar todos los tests:** Para ejecutar los tests en cada proyecto, navegue al directorio correspondiente (`frontend-tabanok/` o `backend-tabanok/`) y utilice el siguiente comando:

    ```bash
    pnpm test
    ```

*   **Generar reporte de cobertura:** Para generar un reporte detallado de la cobertura de código en un proyecto específico (por ejemplo, el backend), navegue al directorio correspondiente (`backend-tabanok/`) y ejecute el siguiente comando:

    ```bash
    pnpm test:cov
    ```

    El reporte se generará en el directorio `coverage/` dentro del directorio del proyecto.

*   **Revisión de cobertura:** Revise el reporte generado para identificar archivos o secciones de código con baja cobertura de pruebas.
*   **Añadir tests:** Añada pruebas unitarias o E2E para cubrir casos no probados, priorizando los módulos y funcionalidades críticas del sistema.
*   **Objetivo de cobertura:** Se busca mantener una cobertura mínima del 80% tanto en el backend como en el frontend.

## Despliegue

El proceso de despliegue se gestiona a través de pipelines de CI/CD configurados para cada repositorio.

*   **Pipelines CI/CD:** Los pipelines están configurados para ejecutar linting, pruebas y el proceso de build automáticamente en cada push a la rama `main` en los repositorios del frontend y backend.
*   **Despliegue a producción:** Para el despliegue en entornos de producción, se recomienda automatizar el proceso utilizando scripts o integraciones con plataformas de despliegue (ej. Vercel para el frontend, Railway o servidores propios para el backend).
*   **Paso futuro:** Se planea agregar scripts automáticos de despliegue en los pipelines de CI/CD para automatizar completamente el proceso de puesta en producción para ambos proyectos.

## Contribución

Se fomenta la contribución a los proyectos de Tabanok siguiendo un flujo de trabajo basado en ramas y Pull Requests en cada repositorio.

1.  **Clonar el repositorio:** Clone el repositorio del proyecto al que desea contribuir (frontend o backend).

    ```bash
    git clone https://github.com/rmcam/frontend-tabanok
    # o
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

6.  **Crear un Pull Request:** Abra un Pull Request en el repositorio correspondiente (frontend o backend) en GitHub, describiendo claramente los cambios realizados, el problema que resuelve o la funcionalidad que implementa.
7.  **Revisión y merge:** Espere la revisión de su código por parte de otros colaboradores y realice los ajustes solicitados. Una vez aprobado, su Pull Request será merclado en la rama `main`.

---

Ver próximos pasos y pendientes detallados en [`./Pendientes.md`](./Pendientes.md).

---

Última actualización: 24/4/2025, 9:01 p. m. (America/Bogota, UTC-5:00)
