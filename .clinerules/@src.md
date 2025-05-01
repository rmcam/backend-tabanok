# 🤖 Prompt Persistente - Cline (Tabanok)

### Optimizado para la eficiencia y precisión en el desarrollo del proyecto Tabanok. Utiliza pnpm siempre.

## 🎯 Contexto Específico (Según Tarea)

- `docs`: Documentación centralizada del proyecto Tabanok, actualizada para reflejar la arquitectura de proyectos separados (frontend y backend). Contiene información sobre la proyección, arquitectura, estado actual, flujos de trabajo, autenticación, gamificación, diccionario, modelos de datos, instrucciones de desarrollo, accesibilidad y pendientes.

## 🛠️ Herramientas

*   `list_files`: Explora el sistema de archivos. Útil para descubrir la estructura de directorios o encontrar archivos específicos dentro de los directorios del proyecto (`frontend-tabanok/`, `backend-tabanok/`, `docs/`).
*   `read_file`: Lee el contenido de un archivo. Útil para examinar el código fuente, la configuración o la documentación. **Usar con moderación, priorizando `search_files` y la información ya en el contexto.**
*   `search_files`: Busca patrones de texto en múltiples archivos. Priorizar para extraer información clave de los documentos de contexto (`docs/`) y el código fuente (`frontend-tabanok/`, `backend-tabanok/`).
*   `write_to_file`: Crea un nuevo archivo o reemplaza el contenido de uno existente.
*   `replace_in_file`: Modifica secciones específicas de un archivo existente. Asegurarse de que el `SEARCH` coincida exactamente con el contenido del archivo.
*   `list_code_definition_names`: Lista las definiciones de código (clases, funciones, etc.) en un directorio. Útil para entender la estructura del código en `frontend-tabanok/src/` y `backend-tabanok/src/`.
*   `execute_command`: Ejecuta comandos en la terminal. Útil para instalar dependencias (`pnpm install`), ejecutar pruebas (`pnpm test`), generar reportes de cobertura (`pnpm test:cov`), etc., navegando al directorio del proyecto (`frontend-tabanok/` o `backend-tabanok/`) si es necesario.

## 🌐 Servidores MCP Activos

*   **brave-search**: Busca información en la web. Útil para buscar documentación sobre librerías o tecnologías no cubiertas en `docs/`.
*   **github**: Interactúa con los repositorios (`https://github.com/rmcam/frontend-tabanok`, `https://github.com/rmcam/backend-tabanok`). Útil para crear issues, pull requests, etc.
*   **playwright-mcp-server**: Realiza pruebas de interfaz de usuario en el frontend.
*   **filesystem**: Accede al sistema de archivos dentro del directorio de trabajo.
*   **fetch**: Obtiene contenido de URLs.
*   **sequential-thinking**: Para razonamiento complejo y planificación de tareas.

## ⚙️ Estrategias de Edición de Archivos

*   **`write_to_file` para cambios extensos:** Reescribe el archivo completo si la modificación es grande o compleja.
*   **`replace_in_file` para cambios puntuales:** Utilizar solo para modificaciones bien definidas y localizadas.
*   **Validar antes de editar:** Asegurarse de comprender el contenido del archivo y los cambios necesarios antes de editar.

## 🚦 Reglas Estrictas

*   **Solo español:** Todas las respuestas deben ser en español (evitar código en respuestas directas al usuario, usar bloques de código para ejemplos).
*   **Prohibido alucinar:** Si la información no está en los documentos o no se puede verificar con las herramientas, decirlo explícitamente.
*   **Priorizar:** Priorizar tareas según la hoja de ruta y los pendientes listados en la documentación (`docs/ProyeccionProyecto.md`, `docs/Pendientes.md`).
*   **Limitar la lectura de archivos:** Enfocarse en la documentación en `docs/` y los directorios de código fuente `frontend-tabanok/src/` y `backend-tabanok/src/`. Usar `search_files` para encontrar información específica en lugar de leer archivos completos innecesariamente.
*   **Gestionar dependencias:** Utilizar `pnpm` para añadir, actualizar o eliminar dependencias. Ejecutar comandos de `pnpm` en el directorio raíz del proyecto correspondiente (`frontend-tabanok/` o `backend-tabanok/`).
*   **Priorizar el rendimiento:** Al implementar soluciones o sugerir mejoras, considerar el rendimiento de la aplicación tanto en el frontend como en el backend.

## 💬 Formato de Respuesta (Conciso)
[📌 Contexto] Resumen relevante de la información encontrada.
[🔍 Fuente] Archivo.md#Línea (enlace a la línea específica si aplica).
[💡 Acción] Sugerencia concreta y accionable o descripción de la tarea completada.


Prioriza el rendimiento.