# Endpoints del Backend de Tabanok

Este documento detalla los endpoints disponibles en el backend de Tabanok, organizados por controlador, junto con una breve descripción de su uso.

---

## 🌐 Root Controller

- **GET /**
  - **Uso:** Obtener mensaje de bienvenida.
  - **Descripción:** Retorna un mensaje de bienvenida de la API.
- **GET /healthz**
  - **Uso:** Verifica el estado de la API.
  - **Descripción:** Retorna un estado "ok" si la API está funcionando correctamente.

---

## 🔐 Auth Controller (`/auth`)

- **POST /auth/signin**
  - **Uso:** Iniciar sesión.
  - **Descripción:** Permite a un usuario iniciar sesión en el sistema.
- **POST /auth/signup**
  - **Uso:** Registrar nuevo usuario.
  - **Descripción:** Crea una nueva cuenta de usuario en el sistema.
- **GET /auth/profile**
  - **Uso:** Obtener perfil.
  - **Descripción:** Obtiene la información del perfil del usuario autenticado.
- **PUT /auth/profile**
  - **Uso:** Actualizar perfil.
  - **Descripción:** Actualiza la información del perfil del usuario autenticado.
- **POST /auth/password/change**
  - **Uso:** Cambiar contraseña.
  - **Descripción:** Permite al usuario cambiar su contraseña actual.
- **POST /auth/password/reset/request**
  - **Uso:** Solicitar restablecimiento de contraseña.
  - **Descripción:** Envía un correo con instrucciones para restablecer la contraseña.
- **POST /auth/reset-password**
  - **Uso:** Restablecer contraseña.
  - **Descripción:** Restablece la contraseña del usuario utilizando un token.
- **POST /auth/refresh**
  - **Uso:** Renovar token de acceso.
  - **Descripción:** Renueva los tokens de acceso y refresh.
- **GET /auth/verify-session**
  - **Uso:** Verificar sesión.
  - **Descripción:** Verifica la validez de la sesión actual basada en la cookie HttpOnly y devuelve los datos del usuario si es válida.
- **POST /auth/signout**
  - **Uso:** Cerrar sesión.
  - **Descripción:** Cierra la sesión del usuario eliminando las cookies de acceso y refresh.

---

## 👤 Account Controller (`/accounts`)

- **POST /accounts**
  - **Uso:** Crear cuenta.
  - **Descripción:** Crea una nueva cuenta en el sistema.
- **GET /accounts**
  - **Uso:** Obtener todas las cuentas.
  - **Descripción:** Obtiene la lista de todas las cuentas disponibles.
- **GET /accounts/:id**
  - **Uso:** Obtener cuenta por ID.
  - **Descripción:** Obtiene una cuenta específica por su ID.
- **PATCH /accounts/:id**
  - **Uso:** Actualizar cuenta.
  - **Descripción:** Actualiza una cuenta existente.
- **DELETE /accounts/:id**
  - **Uso:** Eliminar cuenta.
  - **Descripción:** Elimina una cuenta existente.
- **PATCH /accounts/:id/settings**
  - **Uso:** Actualizar configuración de la cuenta.
  - **Descripción:** Actualiza la configuración de una cuenta específica.
- **PATCH /accounts/:id/preferences**
  - **Uso:** Actualizar preferencias de la cuenta.
  - **Descripción:** Actualiza las preferencias de una cuenta específica.
- **PATCH /accounts/:id/streak**
  - **Uso:** Actualizar racha de la cuenta.
  - **Descripción:** Actualiza la racha de una cuenta específica.

---

## 🏃 Activity Controller (`/activities`)

- **POST /activities**
  - **Uso:** Crear actividad.
  - **Descripción:** Crea una nueva actividad en el sistema. (Roles: MODERATOR, ADMIN)
- **GET /activities**
  - **Uso:** Listar actividades.
  - **Descripción:** Obtiene la lista de todas las actividades disponibles.
- **GET /activities/type/:type**
  - **Uso:** Obtener por tipo.
  - **Descripción:** Obtiene las actividades filtradas por tipo.
- **GET /activities/difficulty/:level**
  - **Uso:** Obtener por dificultad.
  - **Descripción:** Obtiene las actividades filtradas por nivel de dificultad.
- **GET /activities/:id**
  - **Uso:** Obtener actividad.
  - **Descripción:** Obtiene una actividad específica por su identificador.
- **PATCH /activities/:id**
  - **Uso:** Actualizar actividad.
  - **Descripción:** Actualiza una actividad existente. (Roles: TEACHER, ADMIN)
- **DELETE /activities/:id**
  - **Uso:** Eliminar actividad.
  - **Descripción:** Elimina una actividad existente. (Roles: ADMIN)
- **PATCH /activities/:id/points**
  - **Uso:** Actualizar puntos.
  - **Descripción:** Actualiza los puntos de una actividad. (Roles: ADMIN, TEACHER)

---

## 💬 Comments Controller (`/comments`)

- **POST /comments**
  - **Uso:** Crear un nuevo comentario.
  - **Descripción:** Crea un nuevo comentario.
- **GET /comments**
  - **Uso:** Obtener todos los comentarios.
  - **Descripción:** Obtiene la lista de todos los comentarios.
- **GET /comments/:id**
  - **Uso:** Obtener un comentario por ID.
  - **Descripción:** Obtiene un comentario específico por su ID.
- **GET /comments/version/:versionId**
  - **Uso:** Obtener comentarios por versión.
  - **Descripción:** Obtiene comentarios asociados a una versión específica.
- **PATCH /comments/:id**
  - **Uso:** Actualizar un comentario.
  - **Descripción:** Actualiza un comentario existente.
- **DELETE /comments/:id**
  - **Uso:** Eliminar un comentario.
  - **Descripción:** Elimina un comentario existente.
- **POST /comments/:id/resolve**
  - **Uso:** Marcar un comentario como resuelto.
  - **Descripción:** Marca un comentario como resuelto.
- **POST /comments/:id/reply**
  - **Uso:** Responder a un comentario.
  - **Descripción:** Agrega una respuesta a un comentario existente.
- **GET /comments/:id/thread**
  - **Uso:** Obtener hilo de comentarios.
  - **Descripción:** Obtiene el hilo de comentarios a partir de un comentario raíz.
- **GET /comments/version/:versionId/unresolved**
  - **Uso:** Obtener comentarios no resueltos de una versión.
  - **Descripción:** Obtiene la lista de comentarios no resueltos para una versión específica.

---

## 📚 Content Controller (`/content`)

- **POST /content**
  - **Uso:** Crear nuevo contenido educativo.
  - **Descripción:** Crea un nuevo contenido educativo en el sistema. (Roles: ADMIN, TEACHER)
- **GET /content**
  - **Uso:** Obtener todo el contenido educativo.
  - **Descripción:** Obtiene la lista de todo el contenido educativo.
- **GET /content/:id**
  - **Uso:** Obtener contenido por ID.
  - **Descripción:** Obtiene un contenido específico por su ID.
- **PUT /content/:id**
  - **Uso:** Actualizar contenido por ID.
  - **Descripción:** Actualiza un contenido existente por su ID.
- **DELETE /content/:id**
  - **Uso:** Eliminar contenido por ID.
  - **Descripción:** Elimina un contenido existente por su ID.
- **GET /content/unity/:unityId/topic/:topicId**
  - **Uso:** Obtener contenido por ID de unidad y ID de tema.
  - **Descripción:** Obtiene contenido filtrado por ID de unidad y ID de tema.

---

## 📝 Content Validation Controller (`/content-validation`)

- **POST /content-validation/submit**
  - **Uso:** Enviar contenido para validación.
  - **Descripción:** Envía un nuevo contenido al proceso de validación para su revisión.
- **POST /content-validation/:id/validate**
  - **Uso:** Validar contenido.
  - **Descripción:** Realiza la validación de un contenido específico por un validador.
- **POST /content-validation/:id/vote**
  - **Uso:** Votar contenido.
  - **Descripción:** Registra un voto de la comunidad sobre un contenido específico.
- **POST /content-validation/:id/example**
  - **Uso:** Agregar ejemplo de uso.
  - **Descripción:** Agrega un ejemplo de uso para un contenido específico.
- **PUT /content-validation/:id/audio**
  - **Uso:** Actualizar audio.
  - **Descripción:** Actualiza la referencia de audio para un contenido específico.
- **GET /content-validation/pending**
  - **Uso:** Listar validaciones pendientes.
  - **Descripción:** Obtiene la lista de todas las validaciones pendientes en el sistema.
- **GET /content-validation/content/:contentId**
  - **Uso:** Obtener validaciones por contenido.
  - **Descripción:** Obtiene todas las validaciones asociadas a un contenido específico.
- **GET /content-validation/statistics**
  - **Uso:** Obtener estadísticas.
  - **Descripción:** Obtiene las estadísticas generales del proceso de validación.

---

## 🔄 Content Versioning Controller (`/content-versioning`)

- **POST /content-versioning**
  - **Uso:** Crear versión.
  - **Descripción:** Crea una nueva versión de contenido en el sistema.
- **GET /content-versioning**
  - **Uso:** Listar versiones.
  - **Descripción:** Obtiene todas las versiones de contenido disponibles en el sistema.
- **GET /content-versioning/:id**
  - **Uso:** Obtener versión.
  - **Descripción:** Obtiene los detalles de una versión específica por su ID.
- **PATCH /content-versioning/:id**
  - **Uso:** Actualizar versión.
  - **Descripción:** Actualiza la información de una versión existente.
- **DELETE /content-versioning/:id**
  - **Uso:** Eliminar versión.
  - **Descripción:** Elimina una versión existente del sistema.
- **GET /content-versioning/content/:contentId**
  - **Uso:** Obtener versiones por contenido.
  - **Descripción:** Obtiene todas las versiones asociadas a un contenido específico.
- **POST /content-versioning/merge**
  - **Uso:** Fusionar versiones.
  - **Descripción:** Combina dos versiones de contenido en una nueva versión.
- **POST /content-versioning/branch**
  - **Uso:** Crear rama.
  - **Descripción:** Crea una nueva rama a partir de una versión existente.
- **POST /content-versioning/publish/:id**
  - **Uso:** Publicar versión.
  - **Descripción:** Publica una versión de contenido haciéndola disponible para los usuarios.
- **POST /content-versioning/compare**
  - **Uso:** Comparar versiones.
  - **Descripción:** Compara dos versiones de contenido y muestra sus diferencias.

---

## 🎭 Cultural Content Controller (`/cultural-content`)

- **POST /cultural-content**
  - **Uso:** Crear contenido cultural.
  - **Descripción:** Crea un nuevo contenido cultural en el sistema.
- **GET /cultural-content**
  - **Uso:** Listar contenido cultural.
  - **Descripción:** Obtiene todo el contenido cultural disponible en el sistema (con paginación).
- **GET /cultural-content/:id**
  - **Uso:** Obtener contenido cultural.
  - **Descripción:** Obtiene los detalles de un contenido cultural específico por su ID.
- **GET /cultural-content/category/:category**
  - **Uso:** Obtener contenido por categoría.
  - **Descripción:** Obtiene todo el contenido cultural de una categoría específica.
- **PUT /cultural-content/:id**
  - **Uso:** Actualizar contenido cultural.
  - **Descripción:** Actualiza la información de un contenido cultural existente.
- **DELETE /cultural-content/:id**
  - **Uso:** Eliminar contenido cultural.
  - **Descripción:** Elimina un contenido cultural existente del sistema.

---

## 📖 Dictionary Controller (`/dictionary`)

- **GET /dictionary/search**
  - **Uso:** Buscar en el diccionario Kamëntsá.
  - **Descripción:** Busca palabras en el diccionario Kamëntsá por término de búsqueda.

---

## 📊 Evaluation Controller (`/evaluations`)

- **POST /evaluations**
  - **Uso:** Crear nueva evaluación.
  - **Descripción:** Crea una nueva evaluación.
- **GET /evaluations**
  - **Uso:** Obtener todas las evaluaciones.
  - **Descripción:** Obtiene la lista de todas las evaluaciones.
- **GET /evaluations/:id**
  - **Uso:** Obtener evaluación por ID.
  - **Descripción:** Obtiene una evaluación específica por su ID.
- **GET /evaluations/user/:userId**
  - **Uso:** Obtener evaluaciones por usuario.
  - **Descripción:** Obtiene todas las evaluaciones asociadas a un usuario específico.
- **GET /evaluations/progress/:userId**
  - **Uso:** Obtener progreso del usuario.
  - **Descripción:** Obtiene el progreso de un usuario específico.

---

## 🏋️ Exercises Controller (`/exercises`)

- **POST /exercises**
  - **Uso:** Crear ejercicio.
  - **Descripción:** Crea un nuevo ejercicio en el sistema. (Roles: ADMIN, MODERATOR)
- **GET /exercises**
  - **Uso:** Listar ejercicios.
  - **Descripción:** Obtiene la lista de todos los ejercicios disponibles.
- **GET /exercises/:id**
  - **Uso:** Obtener ejercicio.
  - **Descripción:** Obtiene un ejercicio específico por su ID.
- **PUT /exercises/:id**
  - **Uso:** Actualizar ejercicio.
  - **Descripción:** Actualiza un ejercicio existente. (Roles: ADMIN, MODERATOR)
- **DELETE /exercises/:id**
  - **Uso:** Eliminar ejercicio.
  - **Descripción:** Elimina un ejercicio existente. (Roles: ADMIN)

---

## 🗣️ Language Validation Controller (`/language-validation`)

- **POST /language-validation/validate**
  - **Uso:** Valida un texto en Kamëntsá.
  - **Descripción:** Valida la gramática y ortografía de un texto en Kamëntsá.

---

## 📖 Lesson Controller (`/lesson`)

- **POST /lesson**
  - **Uso:** Crear lección.
  - **Descripción:** Crea una nueva lección en el sistema. (Roles: ADMIN, MODERATOR)
- **GET /lesson**
  - **Uso:** Listar lecciones.
  - **Descripción:** Obtiene la lista de todas las lecciones disponibles.
- **GET /lesson/featured**
  - **Uso:** Listar lecciones destacadas.
  - **Descripción:** Obtiene la lista de todas las lecciones destacadas disponibles.
- **GET /lesson/:id**
  - **Uso:** Obtener lección.
  - **Descripción:** Obtiene una lección específica por su identificador.
- **GET /lesson/unity/:unityId**
  - **Uso:** Obtener lecciones por unidad.
  - **Descripción:** Obtiene todas las lecciones asociadas a una unidad específica.
- **PATCH /lesson/:id**
  - **Uso:** Actualizar lección.
  - **Descripción:** Actualiza una lección existente. (Roles: ADMIN, MODERATOR)
- **DELETE /lesson/:id**
  - **Uso:** Eliminar lección.
  - **Descripción:** Elimina una lección existente. (Roles: ADMIN)
- **PATCH /lesson/:id/toggle-lock**
  - **Uso:** Alternar bloqueo.
  - **Descripción:** Alterna el estado de bloqueo de una lección. (Roles: ADMIN, TEACHER)
- **PATCH /lesson/:id/points**
  - **Uso:** Actualizar puntos.
  - **Descripción:** Actualiza los puntos requeridos para una lección. (Roles: ADMIN, TEACHER)
- **PATCH /lesson/:id/complete**
  - **Uso:** Marcar completada.
  - **Descripción:** Marca una lección como completada. (Roles: ADMIN, TEACHER)

---

## 📦 Module Controller (`/module`)

- **POST /module**
  - **Uso:** Crear nuevo módulo de aprendizaje.
  - **Descripción:** Crea un nuevo módulo de aprendizaje en el sistema.
- **GET /module**
  - **Uso:** Obtener todos los módulos de aprendizaje.
  - **Descripción:** Obtiene la lista de todos los módulos de aprendizaje.
- **GET /module/:id**
  - **Uso:** Obtener módulo por ID.
  - **Descripción:** Obtiene un módulo específico por su ID.
- **PUT /module/:id**
  - **Uso:** Actualizar módulo por ID.
  - **Descripción:** Actualiza un módulo existente por su ID.
- **DELETE /module/:id**
  - **Uso:** Eliminar módulo por ID.
  - **Descripción:** Elimina un módulo existente por su ID.
- **GET /module/:id/unities**
  - **Uso:** Obtener unidades por ID de módulo.
  - **Descripción:** Obtiene todas las unidades asociadas a un módulo específico.
- **GET /module/all-with-hierarchy**
  - **Uso:** Obtener todos los módulos con su jerarquía completa.
  - **Descripción:** Obtiene todos los módulos con sus unidades, lecciones, ejercicios, multimedia, tópicos y contenido.
- **GET /module/:id/full-hierarchy**
  - **Uso:** Obtener un módulo específico con su jerarquía completa.
  - **Descripción:** Obtiene un módulo específico con sus unidades, lecciones, ejercicios, multimedia, tópicos y contenido.

---

## 🖼️ Multimedia Controller (`/multimedia`)

- **POST /multimedia/upload**
  - **Uso:** Subir archivo multimedia.
  - **Descripción:** Sube un nuevo archivo multimedia al sistema. (Roles: ADMIN, TEACHER)
- **GET /multimedia**
  - **Uso:** Obtener todos los archivos multimedia.
  - **Descripción:** Obtiene la lista de todos los archivos multimedia.
- **GET /multimedia/:id**
  - **Uso:** Obtener archivo multimedia por ID.
  - **Descripción:** Obtiene un archivo multimedia específico por su ID.
- **DELETE /multimedia/:id**
  - **Uso:** Eliminar archivo multimedia por ID.
  - **Descripción:** Elimina un archivo multimedia existente por su ID.
- **GET /multimedia/:id/file**
  - **Uso:** Descargar archivo multimedia por ID.
  - **Descripción:** Descarga un archivo multimedia específico por su ID.

---

## 📈 Progress Controller (`/progress`)

- **POST /progress**
  - **Uso:** Crear progreso.
  - **Descripción:** Crea un nuevo registro de progreso en el sistema.
- **GET /progress**
  - **Uso:** Obtener todos los progresos.
  - **Descripción:** Obtiene la lista de todos los registros de progreso.
- **GET /progress/user/:userId**
  - **Uso:** Obtener progreso por usuario.
  - **Descripción:** Obtiene todos los registros de progreso asociados a un usuario específico.
- **GET /progress/:id**
  - **Uso:** Obtener progreso por ID.
  - **Descripción:** Obtiene un registro de progreso específico por su ID.
- **GET /progress/exercise/:exerciseId**
  - **Uso:** Obtener progreso por ejercicio.
  - **Descripción:** Obtiene todos los registros de progreso asociados a un ejercicio específico.
- **PATCH /progress/:id**
  - **Uso:** Actualizar progreso.
  - **Descripción:** Actualiza un registro de progreso existente.
- **DELETE /progress/:id**
  - **Uso:** Eliminar progreso.
  - **Descripción:** Elimina un registro de progreso existente.
- **PATCH /progress/:id/score**
  - **Uso:** Actualizar puntaje del progreso.
  - **Descripción:** Actualiza el puntaje de un registro de progreso específico.
- **PATCH /progress/:id/complete**
  - **Uso:** Completar ejercicio del progreso.
  - **Descripción:** Marca un ejercicio como completado dentro de un registro de progreso.

---

## 💡 Recommendations Controller (`/recommendations`)

- **GET /recommendations/:userId**
  - **Uso:** Obtener recomendaciones personalizadas para un usuario.
  - **Descripción:** Obtiene una lista de recomendaciones personalizadas para un usuario específico.

---

## 🎁 Reward Controller (`/rewards`)

- **POST /rewards**
  - **Uso:** Crear recompensa.
  - **Descripción:** Crea una nueva recompensa en el sistema.
- **GET /rewards**
  - **Uso:** Listar recompensas.
  - **Descripción:** Obtiene todas las recompensas disponibles en el sistema.
- **GET /rewards/:id**
  - **Uso:** Obtener recompensa.
  - **Descripción:** Obtiene los detalles de una recompensa específica por su ID.
- **GET /rewards/type/:type**
  - **Uso:** Obtener recompensas por tipo.
  - **Descripción:** Obtiene todas las recompensas de un tipo específico.
- **GET /rewards/user/:userId**
  - **Uso:** Obtener recompensas por usuario.
  - **Descripción:** Obtiene todas las recompensas asociadas a un usuario específico.
- **PATCH /rewards/:id**
  - **Uso:** Actualizar recompensa.
  - **Descripción:** Actualiza la información de una recompensa existente.
- **DELETE /rewards/:id**
  - **Uso:** Eliminar recompensa.
  - **Descripción:** Elimina una recompensa existente del sistema.
- **PATCH /rewards/:id/points**
  - **Uso:** Actualizar puntos de recompensa.
  - **Descripción:** Modifica los puntos asociados a una recompensa específica.
- **PATCH /rewards/:id/toggle-secret**
  - **Uso:** Alternar estado secreto.
  - **Descripción:** Cambia el estado secreto de una recompensa entre visible y oculto.

---

## 📊 Statistics Controller (`/statistics`)

- **POST /statistics**
  - **Uso:** Crear estadísticas para un usuario.
  - **Descripción:** Crea un nuevo registro de estadísticas para un usuario.
- **GET /statistics**
  - **Uso:** Obtener todas las estadísticas.
  - **Descripción:** Obtiene la lista de todas las estadísticas.
- **GET /statistics/user/:userId**
  - **Uso:** Obtener estadísticas por ID de usuario.
  - **Descripción:** Obtiene las estadísticas de un usuario específico.
- **PUT /statistics/user/:userId/learning-progress**
  - **Uso:** Actualizar progreso de aprendizaje.
  - **Descripción:** Actualiza el progreso de aprendizaje de un usuario.
- **PUT /statistics/achievement/:userId**
  - **Uso:** Actualizar estadísticas de logros.
  - **Descripción:** Actualiza las estadísticas de logros de un usuario.
- **PUT /statistics/badge/:userId**
  - **Uso:** Actualizar estadísticas de insignias.
  - **Descripción:** Actualiza las estadísticas de insignias de un usuario.
- **POST /statistics/user/:userId/report**
  - **Uso:** Generar reporte de estadísticas.
  - **Descripción:** Genera un reporte de estadísticas para un usuario.
- **GET /statistics/reports/quick/:userId**
  - **Uso:** Generar reporte rápido y completo.
  - **Descripción:** Genera un reporte rápido y completo de estadísticas para un usuario.
- **PUT /statistics/:userId/category/:categoryType/progress**
  - **Uso:** Actualizar progreso de una categoría.
  - **Descripción:** Actualiza el progreso de una categoría específica para un usuario.
- **GET /statistics/:userId/category/:categoryType**
  - **Uso:** Obtener métricas de una categoría específica.
  - **Descripción:** Obtiene las métricas de una categoría específica para un usuario.
- **GET /statistics/:userId/learning-path**
  - **Uso:** Obtener ruta de aprendizaje del usuario.
  - **Descripción:** Obtiene la ruta de aprendizaje del usuario.
- **GET /statistics/:userId/available-categories**
  - **Uso:** Obtener categorías disponibles para el usuario.
  - **Descripción:** Obtiene las categorías disponibles para el usuario.
- **GET /statistics/:userId/next-milestones**
  - **Uso:** Obtener próximos hitos del usuario.
  - **Descripción:** Obtiene los próximos hitos del usuario en su ruta de aprendizaje.

---

## 📚 Topics Controller (`/topics`)

- **POST /topics**
  - **Uso:** Crear tema.
  - **Descripción:** Crea un nuevo tema de aprendizaje en el sistema.
- **GET /topics**
  - **Uso:** Listar temas.
  - **Descripción:** Obtiene todos los temas de aprendizaje disponibles en el sistema.
- **GET /topics/:id**
  - **Uso:** Obtener tema.
  - **Descripción:** Obtiene los detalles de un tema específico por su ID.
- **PATCH /topics/:id**
  - **Uso:** Actualizar tema.
  - **Descripción:** Actualiza la información de un tema existente.
- **DELETE /topics/:id**
  - **Uso:** Eliminar tema.
  - **Descripción:** Elimina un tema existente del sistema.

---

## 🏛️ Unity Controller (`/unity`)

- **POST /unity**
  - **Uso:** Crear unidad de aprendizaje.
  - **Descripción:** Crea una nueva unidad de aprendizaje en el sistema con su contenido y configuración inicial. (Roles: ADMIN)
- **GET /unity**
  - **Uso:** Listar unidades de aprendizaje.
  - **Descripción:** Obtiene todas las unidades de aprendizaje disponibles en el sistema.
- **GET /unity/:id**
  - **Uso:** Obtener unidad de aprendizaje.
  - **Descripción:** Obtiene los detalles de una unidad de aprendizaje específica por su ID.
- **PATCH /unity/:id**
  - **Uso:** Actualizar unidad de aprendizaje.
  - **Descripción:** Actualiza la información y configuración de una unidad de aprendizaje existente. (Roles: ADMIN)
- **DELETE /unity/:id**
  - **Uso:** Eliminar unidad de aprendizaje.
  - **Descripción:** Desactiva una unidad de aprendizaje existente en el sistema. (Roles: ADMIN)
- **PATCH /unity/:id/toggle-lock**
  - **Uso:** Alternar bloqueo de unidad.
  - **Descripción:** Cambia el estado de bloqueo de una unidad de aprendizaje entre bloqueado y desbloqueado. (Roles: ADMIN)
- **PATCH /unity/:id/points**
  - **Uso:** Actualizar puntos de unidad.
  - **Descripción:** Modifica los puntos requeridos para completar una unidad de aprendizaje. (Roles: ADMIN)
- **GET /unity/:id/with-topics-and-content**
  - **Uso:** Obtener unidad de aprendizaje con tópicos y contenido.
  - **Descripción:** Obtiene los detalles de una unidad de aprendizaje específica por su ID, incluyendo sus tópicos y el contenido asociado a cada tópico.

---

## 🧑‍💻 User Controller (`/users`)

- **POST /users**
  - **Uso:** Crear nuevo usuario.
  - **Descripción:** Crea un nuevo usuario en el sistema con la información proporcionada.
- **GET /users**
  - **Uso:** Obtener todos los usuarios.
  - **Descripción:** Retorna una lista de todos los usuarios registrados en el sistema.
- **GET /users/:id**
  - **Uso:** Obtener usuario por ID.
  - **Descripción:** Busca y retorna un usuario específico por su ID.
- **GET /users/email/:email**
  - **Uso:** Obtener usuario por email.
  - **Descripción:** Busca y retorna un usuario específico por su dirección de email.
- **PATCH /users/:id**
  - **Uso:** Actualizar usuario.
  - **Descripción:** Actualiza la información de un usuario existente.
- **PATCH /users/:id/roles**
  - **Uso:** Actualizar roles del usuario.
  - **Descripción:** Actualiza los roles de un usuario existente.
- **DELETE /users/:id**
  - **Uso:** Eliminar usuario.
  - **Descripción:** Elimina un usuario del sistema.
- **PATCH /users/:id/points**
  - **Uso:** Actualizar puntos del usuario.
  - **Descripción:** Actualiza los puntos acumulados de un usuario.
- **PATCH /users/:id/level**
  - **Uso:** Actualizar nivel del usuario.
  - **Descripción:** Actualiza el nivel actual del usuario.

---

## 📖 Vocabulary Controller (`/vocabulary`)

- **POST /vocabulary**
  - **Uso:** Crear vocabulario.
  - **Descripción:** Agrega una nueva palabra o frase al vocabulario del sistema.
- **GET /vocabulary**
  - **Uso:** Listar vocabulario.
  - **Descripción:** Obtiene la lista completa del vocabulario disponible.
- **GET /vocabulary/search**
  - **Uso:** Buscar en el diccionario Kamëntsá.
  - **Descripción:** Busca palabras en el diccionario Kamëntsá con filtros y paginación.
- **GET /vocabulary/:id**
  - **Uso:** Obtener vocabulario.
  - **Descripción:** Obtiene una entrada específica del vocabulario por su ID.
- **GET /vocabulary/topic/:topicId**
  - **Uso:** Obtener vocabulario por tema.
  - **Descripción:** Obtiene todas las entradas de vocabulario relacionadas con un tema específico.
- **PATCH /vocabulary/:id**
  - **Uso:** Actualizar vocabulario.
  - **Descripción:** Actualiza una entrada existente del vocabulario.
- **DELETE /vocabulary/:id**
  - **Uso:** Eliminar vocabulario.
  - **Descripción:** Elimina una entrada existente del vocabulario.
