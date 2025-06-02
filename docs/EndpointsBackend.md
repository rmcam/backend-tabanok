# Endpoints del Backend y Estructura de Datos

Este documento describe los endpoints disponibles en el backend y la estructura de datos esperada para facilitar la integración con el frontend.

## Autenticación

### `POST /auth/signin`
**Descripción:** Inicia sesión de usuario.
**Cuerpo de la solicitud:**
```json
{
  "identifier": "string",
  "password": "string"
}
```
**Respuesta exitosa (200):**
```json
{
  "message": "Login successful"
}
```

### `POST /auth/signup`
**Descripción:** Registra un nuevo usuario.
**Cuerpo de la solicitud:**
```json
{
  "username": "string",
  "firstName": "string",
  "secondName": "string",
  "firstLastName": "string",
  "secondLastName": "string",
  "email": "string",
  "password": "string",
  "languages": ["string"],
  "preferences": {
    "notifications": boolean,
    "language": "string",
    "theme": "string"
  },
  "role": "string"
}
```
**Respuesta exitosa (201):**
```json
{
  "id": "string",
  "email": "string",
  "username": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "roles": ["string"]
}
```

### `GET /auth/profile`
**Descripción:** Obtiene la información del perfil del usuario autenticado.
**Respuesta exitosa (200):**
```json
{
  "id": "string",
  "email": "string",
  "username": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "roles": ["string"]
}
```

### `PUT /auth/profile`
**Descripción:** Actualiza la información del perfil del usuario autenticado.
**Cuerpo de la solicitud:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "avatarUrl": "string",
  "languages": ["string"],
  "preferences": {
    "notifications": boolean,
    "language": "string",
    "theme": "string"
  },
  "profile": {
    "bio": "string",
    "location": "string",
    "interests": ["string"],
    "community": "string"
  }
}
```
**Respuesta exitosa (200):**
```json
{
  "id": "string",
  "email": "string",
  "username": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "roles": ["string"]
}
```

### `POST /auth/password/change`
**Descripción:** Permite al usuario cambiar su contraseña actual.
**Cuerpo de la solicitud:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```
**Respuesta exitosa (200):**
```json
{
  "message": "Contraseña cambiada exitosamente"
}
```

### `POST /auth/password/reset/request`
**Descripción:** Envía un correo con instrucciones para restablecer la contraseña.
**Cuerpo de la solicitud:**
```json
{
  "email": "string"
}
```
**Respuesta exitosa (200):**
```json
{
  "message": "Correo enviado exitosamente"
}
```

### `POST /auth/reset-password`
**Descripción:** Restablece la contraseña utilizando un token.
**Cuerpo de la solicitud:**
```json
{
  "token": "string",
  "newPassword": "string"
}
```
**Respuesta exitosa (200):** (No devuelve cuerpo según el controlador, solo status 200)
```json
{}
```

### `POST /auth/refresh`
**Descripción:** Renova el token de acceso.
**Cuerpo de la solicitud:** (Requiere token de refresco en las cookies o cabecera)
```json
{
  "message": "Tokens refreshed successfully"
}
```

### `GET /auth/verify-session`
**Descripción:** Verifica la validez de la sesión actual basada en la cookie HttpOnly y devuelve los datos del usuario si es válida.
**Respuesta exitosa (200):**
```json
{
  "id": "string",
  "email": "string",
  "username": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "roles": ["string"]
}
```

### `POST /auth/signout`
**Descripción:** Cierra la sesión del usuario.
**Cuerpo de la solicitud:** (Requiere token de acceso)
```json
{}
```
**Respuesta exitosa (200):**
```json
{
  "message": "Signout successful"
}
```

## Cuentas

### `POST /accounts`
**Descripción:** Crea una nueva cuenta.
**Cuerpo de la solicitud:**
```json
{
  "userId": "string",
  "points": number,
  "level": number,
  "streak": number,
  "settings": {},
  "preferences": {}
}
```
**Respuesta exitosa (201):**
```json
{
  "id": "string",
  "userId": "string",
  "points": number,
  "level": number,
  "streak": number,
  "settings": {},
  "preferences": {},
  "createdAt": "string",
  "updatedAt": "string"
}
```

### `GET /accounts`
**Descripción:** Obtiene una lista de todas las cuentas.
**Respuesta exitosa (200):**
```json
[
  {
    "id": "string",
    "userId": "string",
    "points": number,
    "level": number,
    "streak": number,
    "settings": {},
    "preferences": {},
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

### `GET /accounts/:id`
**Descripción:** Obtiene información de una cuenta por ID.
**Parámetros de ruta:**
- `id`: ID de la cuenta (string)
**Respuesta exitosa (200):**
```json
{
  "id": "string",
  "userId": "string",
  "points": number,
  "level": number,
  "streak": number,
  "settings": {},
  "preferences": {},
  "createdAt": "string",
  "updatedAt": "string"
}
```

### `PATCH /accounts/:id`
**Descripción:** Actualiza una cuenta por ID.
**Parámetros de ruta:**
```json
{
  "userId": "string",
  "points": number,
  "level": number,
  "streak": number,
  "settings": {},
  "preferences": {}
}
```
**Respuesta exitosa (200):**
```json
{
  "id": "string",
  "userId": "string",
  "points": number,
  "level": number,
  "streak": number,
  "settings": {},
  "preferences": {},
  "createdAt": "string",
  "updatedAt": "string"
}
```

### `DELETE /accounts/:id`
**Descripción:** Elimina una cuenta por ID.
**Parámetros de ruta:**
- `id`: ID de la cuenta (string)
**Respuesta exitosa (204):** (No devuelve cuerpo)
```json
{}
```

### `PATCH /accounts/:id/settings`
**Descripción:** Actualiza la configuración de una cuenta por ID.
**Parámetros de ruta:**
- `id`: ID de la cuenta (string)
**Cuerpo de la solicitud:**
```json
{}
```
**Respuesta exitosa (200):**
```json
{
  "id": "string",
  "userId": "string",
  "points": number,
  "level": number,
  "streak": number,
  "settings": {},
  "preferences": {},
  "createdAt": "string",
  "updatedAt": "string"
}
```

### `PATCH /accounts/:id/preferences`
**Descripción:** Actualiza las preferencias de una cuenta por ID.
**Parámetros de ruta:**
- `id`: ID de la cuenta (string)
**Cuerpo de la solicitud:**
```json
{}
```
**Respuesta exitosa (200):**
```json
{
  "id": "string",
  "userId": "string",
  "points": number,
  "level": number,
  "streak": number,
  "settings": {},
  "preferences": {},
  "createdAt": "string",
  "updatedAt": "string"
}
```

### `PATCH /accounts/:id/streak`
**Descripción:** Actualiza la racha de una cuenta por ID.
**Parámetros de ruta:**
- `id`: ID de la cuenta (string)
**Cuerpo de la solicitud:**
```json
{
  "streak": number
}
```
**Respuesta exitosa (200):**
```json
{
  "id": "string",
  "userId": "string",
  "points": number,
  "level": number,
  "streak": number,
  "settings": {},
  "preferences": {},
  "createdAt": "string",
  "updatedAt": "string"
}
```

## Actividades de Aprendizaje

### `POST /activities`
**Descripción:** Crea una nueva actividad en el sistema.
**Cuerpo de la solicitud:**
```json
{
  "title": "string",
  "description": "string",
  "type": "string", // Enum: INTERACTIVE, QUIZ, VIDEO, READING, etc.
  "difficulty": "string", // Enum: BEGINNER, INTERMEDIATE, ADVANCED
  "content": {}, // Estructura varía según el tipo de actividad
  "points": number,
  "metadata": {},
  "isActive": boolean
}
```
**Respuesta exitosa (201):**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "type": "string",
  "difficulty": "string",
  "content": {},
  "points": number,
  "metadata": {},
  "isActive": boolean,
  "createdAt": "string",
  "updatedAt": "string"
}
```

### `GET /activities`
**Descripción:** Obtiene la lista de todas las actividades disponibles.
**Respuesta exitosa (200):**
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "type": "string",
    "difficulty": "string",
    "content": {},
    "points": number,
    "metadata": {},
    "isActive": boolean,
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

### `GET /activities/type/:type`
**Descripción:** Obtiene las actividades filtradas por tipo.
**Parámetros de ruta:**
- `type`: Tipo de actividad (string, Enum: INTERACTIVE, QUIZ, VIDEO, READING, etc.)
**Respuesta exitosa (200):**
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "type": "string",
    "difficulty": "string",
    "content": {},
    "points": number,
    "metadata": {},
    "isActive": boolean,
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

### `GET /activities/difficulty/:level`
**Descripción:** Obtiene las actividades filtradas por nivel de dificultad.
**Parámetros de ruta:**
- `level`: Nivel de dificultad (string, Enum: BEGINNER, INTERMEDIATE, ADVANCED)
**Respuesta exitosa (200):**
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "type": "string",
    "difficulty": "string",
    "content": {},
    "points": number,
    "metadata": {},
    "isActive": boolean,
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

### `GET /activities/:id`
**Descripción:** Obtiene una actividad específica por su identificador.
**Parámetros de ruta:**
- `id`: Identificador único de la actividad (string)
**Respuesta exitosa (200):**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "type": "string",
  "difficulty": "string",
  "content": {},
  "points": number,
  "metadata": {},
  "isActive": boolean,
  "createdAt": "string",
  "updatedAt": "string"
}
```

### `PATCH /activities/:id`
**Descripción:** Actualiza una actividad existente.
**Parámetros de ruta:**
- `id`: Identificador único de la actividad (string)
**Cuerpo de la solicitud:**
```json
{
  "title": "string",
  "description": "string",
  "type": "string",
  "difficulty": "string",
  "content": {},
  "points": number,
  "metadata": {},
  "isActive": boolean
}
```
**Respuesta exitosa (200):**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "type": "string",
  "difficulty": "string",
  "content": {},
  "points": number,
  "metadata": {},
  "isActive": boolean,
  "createdAt": "string",
  "updatedAt": "string"
}
```

### `DELETE /activities/:id`
**Descripción:** Elimina una actividad existente.
**Parámetros de ruta:**
- `id`: Identificador único de la actividad (string)
**Respuesta exitosa (200):** (No devuelve cuerpo)
```json
{}
```

### `PATCH /activities/:id/points`
**Descripción:** Actualiza los puntos de una actividad.
**Parámetros de ruta:**
- `id`: Identificador único de la actividad (string)
**Cuerpo de la solicitud:**
```json
{
  "points": number
}
```
**Respuesta exitosa (200):** (No devuelve cuerpo específico en el controlador, asumo que devuelve la actividad actualizada)
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "type": "string",
  "difficulty": "string",
  "content": {},
  "points": number,
  "metadata": {},
  "isActive": boolean,
  "createdAt": "string",
  "updatedAt": "string"
}
```

## Comentarios

### `POST /comments`
**Descripción:** Crea un nuevo comentario.
**Cuerpo de la solicitud:**
```json
{
  "content": "string",
  "author": "string",
  "versionId": "string",
  "parentId": "string",
  "mentions": ["string"],
  "attachments": ["string"],
  "metadata": {}
}
```
**Respuesta exitosa (201):**
```json
{
  "id": "string",
  "content": "string",
  "author": "string",
  "versionId": "string",
  "parentId": "string",
  "mentions": ["string"],
  "attachments": ["string"],
  "metadata": {},
  "createdAt": "string",
  "updatedAt": "string"
}
```

### `GET /comments`
**Descripción:** Obtiene todos los comentarios.
**Respuesta exitosa (200):**
```json
[
  {
    "id": "string",
    "content": "string",
    "author": "string",
    "versionId": "string",
    "parentId": "string",
    "mentions": ["string"],
    "attachments": ["string"],
    "metadata": {},
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

### `GET /comments/:id`
**Descripción:** Obtiene un comentario por ID.
**Parámetros de ruta:**
- `id`: ID del comentario (string)
**Respuesta exitosa (200):**
```json
{
  "id": "string",
  "content": "string",
  "author": "string",
  "versionId": "string",
  "parentId": "string",
  "mentions": ["string"],
  "attachments": ["string"],
  "metadata": {},
  "createdAt": "string",
  "updatedAt": "string"
}
```

### `GET /comments/version/:versionId`
**Descripción:** Obtiene comentarios por versión.
**Parámetros de ruta:**
- `versionId`: ID de la versión (string)
**Respuesta exitosa (200):**
```json
[
  {
    "id": "string",
    "content": "string",
    "author": "string",
    "versionId": "string",
    "parentId": "string",
    "mentions": ["string"],
    "attachments": ["string"],
    "metadata": {},
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

### `PATCH /comments/:id`
**Descripción:** Actualiza un comentario.
**Parámetros de ruta:**
- `id`: ID del comentario a actualizar (string)
**Cuerpo de la solicitud:**
```json
{
  "content": "string",
  "author": "string",
  "versionId": "string",
  "parentId": "string",
  "mentions": ["string"],
  "attachments": ["string"],
  "metadata": {}
}
```
**Respuesta exitosa (200):**
```json
{
  "id": "string",
  "content": "string",
  "author": "string",
  "versionId": "string",
  "parentId": "string",
  "mentions": ["string"],
  "attachments": ["string"],
  "metadata": {},
  "createdAt": "string",
  "updatedAt": "string"
}
```

### `DELETE /comments/:id`
**Descripción:** Elimina un comentario.
**Parámetros de ruta:**
- `id`: ID del comentario a eliminar (string)
**Respuesta exitosa (200):** (No devuelve cuerpo)
```json
{}
```

### `POST /comments/:id/resolve`
**Descripción:** Marca un comentario como resuelto.
**Parámetros de ruta:**
- `id`: ID del comentario a resolver (string)
**Cuerpo de la solicitud:**
```json
{
  "resolvedBy": "string"
}
```
**Respuesta exitosa (200):**
```json
{
  "id": "string",
  "content": "string",
  "author": "string",
  "versionId": "string",
  "parentId": "string",
  "mentions": ["string"],
  "attachments": ["string"],
  "metadata": {},
  "createdAt": "string",
  "updatedAt": "string"
}
```

### `POST /comments/:id/reply`
**Descripción:** Responde a un comentario.
**Parámetros de ruta:**
- `id`: ID del comentario al que se responde (string)
**Cuerpo de la solicitud:**
```json
{
  "content": "string",
  "author": "string",
  "versionId": "string",
  "parentId": "string",
  "mentions": ["string"],
  "attachments": ["string"],
  "metadata": {}
}
```
**Respuesta exitosa (201):**
```json
{
  "id": "string",
  "content": "string",
  "author": "string",
  "versionId": "string",
  "parentId": "string",
  "mentions": ["string"],
  "attachments": ["string"],
  "metadata": {},
  "createdAt": "string",
  "updatedAt": "string"
}
```

### `GET /comments/:id/thread`
**Descripción:** Obtiene hilo de comentarios.
**Parámetros de ruta:**
- `id`: ID del comentario raíz del hilo (string)
**Respuesta exitosa (200):**
```json
{
  "id": "string",
  "content": "string",
  "author": "string",
  "versionId": "string",
  "parentId": "string",
  "mentions": ["string"],
  "attachments": ["string"],
  "metadata": {},
  "createdAt": "string",
  "updatedAt": "string",
  "replies": [] // Puede contener una estructura recursiva de comentarios
}
```

### `GET /comments/version/:versionId/unresolved`
**Descripción:** Obtiene comentarios no resueltos de una versión.
**Parámetros de ruta:**
- `versionId`: ID de la versión (string)
**Respuesta exitosa (200):**
```json
[
  {
    "id": "string",
    "content": "string",
    "author": "string",
    "versionId": "string",
    "parentId": "string",
    "mentions": ["string"],
    "attachments": ["string"],
    "metadata": {},
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

## Contenido

### `POST /content`
**Descripción:** Crea nuevo contenido.
**Cuerpo de la solicitud:**
```json
{
  "title": "string",
  "description": "string",
  "type": "string", // e.g., 'text', 'video', 'quiz'
  "content": {}, // El contenido real, puede ser JSON
  "unityId": "string", // UUID
  "topicId": "string", // UUID
  "order": number
}
```
**Respuesta exitosa (201):**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "type": "string",
  "content": {},
  "unityId": "string",
  "topicId": "string",
  "order": number,
  "createdAt": "string",
  "updatedAt": "string"
}
```

### `GET /content`
**Descripción:** Obtiene todo el contenido.
**Respuesta exitosa (200):**
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "type": "string",
    "content": {},
    "unityId": "string",
    "topicId": "string",
    "order": number,
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

### `GET /content/:id`
**Descripción:** Obtiene contenido por ID.
**Parámetros de ruta:**
- `id`: ID del contenido (string)
**Respuesta exitosa (200):**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "type": "string",
  "content": {},
  "unityId": "string",
  "topicId": "string",
  "order": number,
  "createdAt": "string",
  "updatedAt": "string"
}
```

### `PUT /content/:id`
**Descripción:** Actualiza contenido por ID.
**Parámetros de ruta:**
- `id`: ID del contenido (string)
**Cuerpo de la solicitud:**
```json
{
  "title": "string",
  "description": "string",
  "type": "string",
  "content": {},
  "unityId": "string",
  "topicId": "string",
  "order": number
}
```
**Respuesta exitosa (200):**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "type": "string",
  "content": {},
  "unityId": "string",
  "topicId": "string",
  "order": number,
  "createdAt": "string",
  "updatedAt": "string"
}
```

### `DELETE /content/:id`
**Descripción:** Elimina contenido por ID.
**Parámetros de ruta:**
- `id`: ID del contenido (string)
**Respuesta exitosa (200):** (No devuelve cuerpo)
```json
{}
```

### `GET /content/unity/:unityId/topic/:topicId`
**Descripción:** Obtiene contenido por ID de unidad y ID de tema.
**Parámetros de ruta:**
- `unityId`: ID de la unidad (string)
- `topicId`: ID del tema (string)
**Respuesta exitosa (200):**
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "type": "string",
    "content": {},
    "unityId": "string",
    "topicId": "string",
    "order": number,
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

## Validación de Contenido

### `POST /content-validation/submit`
**Descripción:** Envía un nuevo contenido al proceso de validación para su revisión.
**Cuerpo de la solicitud:**
```json
{
  "contentId": "string",
  "contentType": "string", // Enum: WORD, PHRASE, SENTENCE, PARAGRAPH, etc.
  "originalContent": "string",
  "translatedContent": "string",
  "submittedBy": "string",
  "culturalContext": "string",
  "dialectVariation": "string"
}
```
**Respuesta exitosa (201):** (No se especifica un cuerpo de respuesta en el controlador, asumo un mensaje de éxito)
```json
{
  "message": "Contenido enviado para validación exitosamente"
}
```

### `POST /content-validation/:id/validate`
**Descripción:** Realiza la validación de un contenido específico por un validador.
**Parámetros de ruta:**
- `id`: Identificador único del contenido a validar (string)
**Cuerpo de la solicitud:**
```json
{
  "validatorId": "string",
  "criteria": {
    "spelling": boolean,
    "grammar": boolean,
    "culturalAccuracy": boolean,
    "contextualUse": boolean,
    "pronunciation": boolean
  },
  "feedback": {
    "criteriaId": "string",
    "comment": "string",
    "suggestedCorrection": "string"
  }
}
```
**Respuesta exitosa (200):** (No se especifica un cuerpo de respuesta en el controlador, asumo un mensaje de éxito)
```json
{
  "message": "Contenido validado exitosamente"
}
```

### `POST /content-validation/:id/vote`
**Descripción:** Registra un voto de la comunidad sobre un contenido específico.
**Parámetros de ruta:**
- `id`: Identificador único del contenido (string)
**Cuerpo de la solicitud:**
```json
{
  "userId": "string",
  "isUpvote": boolean
}
```
**Respuesta exitosa (200):** (No se especifica un cuerpo de respuesta en el controlador, asumo un mensaje de éxito)
```json
{
  "message": "Voto registrado exitosamente"
}
```

### `POST /content-validation/:id/example`
**Descripción:** Agrega un ejemplo de uso para un contenido específico.
**Parámetros de ruta:**
- `id`: Identificador único del contenido (string)
**Cuerpo de la solicitud:**
```json
{
  "example": "string"
}
```
**Respuesta exitosa (200):** (No se especifica un cuerpo de respuesta en el controlador, asumo un mensaje de éxito)
```json
{
  "message": "Ejemplo agregado exitosamente"
}
```

### `PUT /content-validation/:id/audio`
**Descripción:** Actualiza la referencia de audio para un contenido específico.
**Parámetros de ruta:**
- `id`: Identificador único del contenido (string)
**Cuerpo de la solicitud:**
```json
{
  "audioUrl": "string"
}
```
**Respuesta exitosa (200):** (No se especifica un cuerpo de respuesta en el controlador, asumo un mensaje de éxito)
```json
{
  "message": "Referencia de audio actualizada exitosamente"
}
```

### `GET /content-validation/pending`
**Descripción:** Obtiene la lista de todas las validaciones pendientes en el sistema.
**Respuesta exitosa (200):**
```json
[
  {
    "id": "string",
    "contentId": "string",
    "contentType": "string",
    "originalContent": "string",
    "translatedContent": "string",
    "submittedBy": "string",
    "culturalContext": "string",
    "dialectVariation": "string",
    "status": "string", // e.g., PENDING, VALIDATED, REJECTED
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

### `GET /content-validation/content/:contentId`
**Descripción:** Obtiene todas las validaciones asociadas a un contenido específico.
**Parámetros de ruta:**
- `contentId`: Identificador único del contenido (string)
**Respuesta exitosa (200):**
```json
[
  {
    "id": "string",
    "contentId": "string",
    "contentType": "string",
    "originalContent": "string",
    "translatedContent": "string",
    "submittedBy": "string",
    "culturalContext": "string",
    "dialectVariation": "string",
    "status": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

### `GET /content-validation/statistics`
**Descripción:** Obtiene las estadísticas generales del proceso de validación.
**Respuesta exitosa (200):**
```json
{
  "totalSubmissions": number,
  "pendingValidations": number,
  "validatedContent": number,
  "rejectedContent": number,
  "communityVotes": number,
  "usageExamples": number
}
```

## Versionamiento de Contenido

### `POST /content-versioning`
**Descripción:** Crea una nueva versión de contenido.
**Cuerpo de la solicitud:**
```json
{
  "contentId": "string",
  "content": {
    "original": "string",
    "translated": "string",
    "culturalContext": "string",
    "pronunciation": "string",
    "audioReference": "string",
    "dialectVariation": "string"
  },
  "author": "string",
  "changeType": "string", // Enum: CREATION, MODIFICATION, TRANSLATION, etc.
  "versionNumber": number,
  "majorVersion": number,
  "minorVersion": number,
  "patchVersion": number,
  "metadata": {}
}
```
**Respuesta exitosa (201):**
```json
{
  "id": "string",
  "contentId": "string",
  "content": {
    "original": "string",
    "translated": "string",
    "culturalContext": "string",
    "pronunciation": "string",
    "audioReference": "string",
    "dialectVariation": "string"
  },
  "author": "string",
  "changeType": "string",
  "versionNumber": number,
  "majorVersion": number,
  "minorVersion": number,
  "patchVersion": number,
  "metadata": {},
  "createdAt": "string",
  "updatedAt": "string"
}
```

### `GET /content-versioning`
**Descripción:** Obtiene todas las versiones de contenido.
**Respuesta exitosa (200):**
```json
[
  {
    "id": "string",
    "contentId": "string",
    "content": {
      "original": "string",
      "translated": "string",
      "culturalContext": "string",
      "pronunciation": "string",
      "audioReference": "string",
      "dialectVariation": "string"
    },
    "author": "string",
    "changeType": "string",
    "versionNumber": number,
    "majorVersion": number,
    "minorVersion": number,
    "patchVersion": number,
    "metadata": {},
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

### `GET /content-versioning/:id`
**Descripción:** Obtiene información de una versión por ID.
**Parámetros de ruta:**
- `id`: ID de la versión (string)
**Respuesta exitosa (200):**
```json
{
  "id": "string",
  "contentId": "string",
  "content
