# Flujo de Autenticación y Protección de Rutas en Tabanok - Backend

---

Este documento describe la implementación actual de la autenticación en el backend de Tabanok, utilizando **NestJS**.

---

## Endpoints de Autenticación (Backend)

*   **Login:** `POST /auth/signin`
*   **Registro:** `POST /auth/signup`
*   **Cerrar sesión:** `POST /auth/signout`
*   **Solicitar restablecimiento de contraseña:** `POST /auth/forgot-password`
*   **Restablecer contraseña:** `POST /auth/reset-password`
*   **Verificar sesión:** `GET /auth/verify-session`
*   **Refrescar token:** `POST /auth/refresh-token`

---

## Payloads y Respuestas (Backend)

### Login

**Request:**

```json
POST /auth/signin
{
  "identifier": "usuario_institucional_o_email",
  "password": "contraseña"
}
```

El campo `identifier` permite ingresar con el nombre de usuario o el correo electrónico.

**Response:**

Después de un inicio de sesión exitoso, el backend establece el `accessToken` y el `refreshToken` como cookies HttpOnly en la respuesta. No se retornan los tokens en el cuerpo de la respuesta por motivos de seguridad.

```json
{
  "message": "Login successful"
}
```

### Registro

**Request:**

```json
POST /auth/signup
{
  "username": "usuario",
  "firstName": "Nombre",
  "secondName": "SegundoNombre (Opcional)",
  "firstLastName": "Apellido",
  "secondLastName": "SegundoApellido (Opcional)",
  "email": "correo@ejemplo.com",
  "password": "contraseña"
}
```

**Response:**

```json
{
  "statusCode": 201,
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "id": "uuid",
    "username": "usuario",
    "firstName": "Nombre",
    "lastName": "Apellido",
    "email": "correo@ejemplo.com",
    "roles": [ "user" ],
    "status": "active",
    "languages": [],
    "preferences": {
      "notifications": true,
      "language": "es",
      "theme": "light"
    },
    "level": 1,
    "culturalPoints": 0,
    "gameStats": {
      "totalPoints": 0,
      "level": 1,
      "streak": 0,
      "lastActivity": "2025-04-18T20:03:24.979Z"
    },
    "resetPasswordToken": null,
    "resetPasswordExpires": null,
    "lastLoginAt": null,
    "isEmailVerified": false,
    "createdAt": "2025-04-18T20:03:24.982Z",
    "updatedAt": "2025-04-18T20:03:24.982Z"
  }
}
```

Se ha ajustado el seeder de usuarios (`UserSeeder`) para utilizar el enum `UserRole` definido en `src/auth/enums/auth.enum.ts` y se ha corregido la importación de `UserStatus`. El rol 'mentor' en el seeder ahora utiliza `UserRole.TEACHER` para ser compatible con el enum de roles de la base de datos.

### Restablecer contraseña

**Request:**

```json
POST /auth/reset-password
{
  "token": "token_de_restablecimiento",
  "newPassword": "nueva_contraseña"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Contraseña restablecida exitosamente"
}
```

### Solicitar restablecimiento de contraseña

**Request:**

```json
POST /auth/password/reset/request
{
  "email": "correo@ejemplo.com"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "Correo electrónico de restablecimiento de contraseña enviado"
}
```

### Cierre de Sesión

**Request:**

```json
POST /auth/signout
```

**Response:**

```json
{
  "message": "Sesión cerrada exitosamente"
}
```

### Verificar Sesión

**Request:**

```json
GET /auth/verify-session
```

**Response:**

Si la sesión es válida, el backend devuelve los datos del usuario autenticado.

```json
{
  "id": "uuid",
  "username": "usuario",
  "firstName": "Nombre",
  "lastName": "Apellido",
  "email": "correo@ejemplo.com",
  "roles": [ "user" ],
  "status": "active",
  // ... otras propiedades del usuario
}
```

Si la sesión no es válida o el token ha expirado, el backend devuelve un error 401 (No autorizado).

### Refrescar Token

**Request:**

```json
POST /auth/refresh-token
```

La solicitud se envía con la cookie HttpOnly del refresh token.

**Response:**

Si el refresh token es válido, el backend establece nuevas cookies HttpOnly de access y refresh token y devuelve un mensaje de éxito.

```json
{
  "message": "Token refreshed successfully"
}
```

Si el refresh token no es válido o ha expirado, el backend devuelve un error 401 (No autorizado).

---

## Flujo de Autenticación (Backend)

1.  El backend establece el `accessToken` y el `refreshToken` como cookies HttpOnly en la respuesta después de un inicio de sesión o registro exitoso.
2.  El backend, al recibir la solicitud de verificación de sesión (`GET /auth/verify-session`), lee automáticamente el `accessToken` de la cookie HttpOnly.
3.  El backend valida el token y, si es válido, devuelve los datos del usuario autenticado.
4.  Para acceder a rutas protegidas, las solicitudes subsiguientes enviadas al backend incluirán automáticamente las cookies HttpOnly.
5.  El `JwtAuthGuard` en el backend lee automáticamente el `accessToken` de la cookie `accessToken` para validar y autorizar el acceso a las rutas protegidas.
6.  Si el token ha expirado o no es válido, el backend devuelve un error 401 (No autorizado).
7.  La renovación de tokens es manejada automáticamente por el backend utilizando la cookie HttpOnly del refresh token en el endpoint `/auth/refresh-token`. Durante este proceso, el backend verifica si el token de refresco ha sido revocado en la base de datos.
8.  Para cerrar sesión, el backend elimina las cookies HttpOnly de autenticación al recibir la solicitud en `/auth/signout`.

---

## Protección de rutas sensibles (Backend)

*   El backend utiliza guards (`JwtAuthGuard` y `RolesGuard`) aplicados globalmente para proteger las rutas.
*   `JwtAuthGuard` verifica la validez del token JWT leyendo el `accessToken` de la cookie `accessToken`. Las rutas marcadas con `@Public()` son excluidas.
*   `RolesGuard` verifica si el usuario tiene el rol necesario (`@Roles()`).
*   Si el usuario no está autenticado, no tiene permisos, o el token ha expirado, se deniega el acceso con 401 (No autorizado) o 403 (Prohibido).

#### Manejo de Tokens Expirados (Backend)

*   El backend verifica la fecha de expiración del token JWT. Si ha expirado, devuelve 401.

#### Manejo de Rutas Públicas Específicas (`/lesson/featured`) (Backend)

Se implementó una solución en el backend para asegurar que el endpoint `GET /lesson/featured` sea accesible públicamente a pesar de las guardias globales, reordenando las rutas en `LessonController` y añadiendo una verificación explícita en `JwtAuthGuard`.

---

## Sistema de Permisos (Backend)

Para mejorar la granularidad y centralización del control de acceso, se ha implementado un sistema de permisos basado en la enumeración `AppPermission` y el servicio `AuthorizationService`.

### Enumeración `AppPermission`

Define los permisos específicos que pueden ser asignados a los roles de usuario. Ahora incluye permisos granulares para diversas entidades.

```typescript
export enum AppPermission {
  MANAGE_UNITIES = 'manage_unities',
  MANAGE_MULTIMEDIA = 'manage_multimedia',
  MANAGE_LESSONS = 'manage_lessons',
  MANAGE_EXERCISES = 'manage_exercises',
  MANAGE_CULTURAL_ACHIEVEMENTS = 'manage_cultural_achievements',
  MANAGE_MISSION_TEMPLATES = 'manage_mission_templates',
  MANAGE_CONTENT = 'manage_content',
  MANAGE_REWARDS = 'manage_rewards',
  MANAGE_ACTIVITIES = 'manage_activities',
  // Add more granular permissions as needed
  CREATE_UNITY = 'create_unity',
  READ_UNITIES = 'read_unities',
  READ_UNITY = 'read_unity',
  UPDATE_UNITY = 'update_unity',
  DELETE_UNITY = 'delete_unity',
  TOGGLE_LOCK_UNITY = 'toggle_lock_unity',
  UPDATE_UNITY_POINTS = 'update_unity_points',
  UPLOAD_MULTIMEDIA = 'upload_multimedia',
  READ_MULTIMEDIA_LIST = 'read_multimedia_list',
  READ_MULTIMEDIA_DETAIL = 'read_multimedia_detail',
  DELETE_MULTIMEDIA = 'delete_multimedia',
  DOWNLOAD_MULTIMEDIA = 'download_multimedia',
  CREATE_CONTENT = 'create_content',
  READ_CONTENT_LIST = 'read_content_list',
  READ_CONTENT_DETAIL = 'read_content_detail',
  UPDATE_CONTENT = 'update_content',
  DELETE_CONTENT = 'delete_content',
  READ_CONTENT_BY_UNITY_AND_TOPIC = 'read_content_by_unity_and_topic',
  CREATE_LESSON = 'create_lesson',
  READ_LESSONS_LIST = 'read_lessons_list',
  READ_LESSON_DETAIL = 'read_lesson_detail',
  READ_LESSONS_BY_UNITY = 'read_lessons_by_unity',
  UPDATE_LESSON = 'update_lesson',
  DELETE_LESSON = 'delete_lesson',
  TOGGLE_LOCK_LESSON = 'toggle_lock_lesson',
  UPDATE_LESSON_POINTS = 'update_lesson_points',
  MARK_LESSON_COMPLETED = 'mark_lesson_completed',
  CREATE_EXERCISE = 'create_exercise',
  READ_EXERCISES_LIST = 'read_exercises_list',
  READ_EXERCISE_DETAIL = 'read_exercise_detail',
  UPDATE_EXERCISE = 'update_exercise',
  DELETE_EXERCISE = 'delete_exercise',
  CREATE_CULTURAL_ACHIEVEMENT = 'create_cultural_achievement',
  READ_CULTURAL_ACHIEVEMENTS_LIST = 'read_cultural_achievements_list',
  READ_CULTURAL_ACHIEVEMENT_DETAIL = 'read_cultural_achievement_detail',
  INITIALIZE_CULTURAL_ACHIEVEMENT_PROGRESS = 'initialize_cultural_achievement_progress',
  UPDATE_CULTURAL_ACHIEVEMENT_PROGRESS = 'update_cultural_achievement_progress',
  READ_USER_CULTURAL_ACHIEVEMENTS = 'read_user_cultural_achievements',
  READ_CULTURAL_ACHIEVEMENT_PROGRESS = 'read_cultural_achievement_progress',
  CREATE_MISSION_TEMPLATE = 'create_mission_template',
  READ_MISSION_TEMPLATES_LIST = 'read_mission_templates_list',
  READ_MISSION_TEMPLATE_DETAIL = 'read_mission_template_detail',
  UPDATE_MISSION_TEMPLATE = 'update_mission_template',
  CREATE_REWARD = 'create_reward',
  READ_REWARDS_LIST = 'read_rewards_list',
  AWARD_REWARD_TO_USER = 'award_reward_to_user',
  READ_USER_REWARDS = 'read_user_rewards',
  CONSUME_REWARD = 'consume_reward',
  CHECK_REWARD_STATUS = 'check_reward_status',
  CREATE_ACTIVITY = 'create_activity',
  READ_ACTIVITIES_LIST = 'read_activities_list',
  READ_ACTIVITY_DETAIL = 'read_activity_detail',
  READ_ACTIVITIES_BY_TYPE = 'read_activities_by_type',
  READ_ACTIVITIES_BY_DIFFICULTY = 'read_activities_by_difficulty',
  UPDATE_ACTIVITY = 'update_activity',
  DELETE_ACTIVITY = 'delete_activity',
  UPDATE_ACTIVITY_POINTS = 'update_activity_points',
}
```

### Mapeo de Roles a Permisos

El `AuthorizationService` contiene el mapeo que define qué permisos tiene cada rol, ahora con permisos más granulares:

```typescript
private readonly rolePermissions: Record<UserRole, AppPermission[]> = {
  [UserRole.ADMIN]: [
    AppPermission.CREATE_UNITY,
    AppPermission.READ_UNITIES,
    AppPermission.READ_UNITY,
    AppPermission.UPDATE_UNITY,
    AppPermission.DELETE_UNITY,
    AppPermission.TOGGLE_LOCK_UNITY,
    AppPermission.UPDATE_UNITY_POINTS,
    AppPermission.UPLOAD_MULTIMEDIA,
    AppPermission.READ_MULTIMEDIA_LIST,
    AppPermission.READ_MULTIMEDIA_DETAIL,
    AppPermission.DELETE_MULTIMEDIA,
    AppPermission.DOWNLOAD_MULTIMEDIA,
    AppPermission.CREATE_LESSON,
    AppPermission.READ_LESSONS_LIST,
    AppPermission.READ_LESSON_DETAIL,
    AppPermission.READ_LESSONS_BY_UNITY,
    AppPermission.UPDATE_LESSON,
    AppPermission.DELETE_LESSON,
    AppPermission.TOGGLE_LOCK_LESSON,
    AppPermission.UPDATE_LESSON_POINTS,
    AppPermission.MARK_LESSON_COMPLETED,
    AppPermission.CREATE_EXERCISE,
    AppPermission.READ_EXERCISES_LIST,
    AppPermission.READ_EXERCISE_DETAIL,
    AppPermission.UPDATE_EXERCISE,
    AppPermission.DELETE_EXERCISE,
    AppPermission.CREATE_CULTURAL_ACHIEVEMENT,
    AppPermission.READ_CULTURAL_ACHIEVEMENTS_LIST,
    AppPermission.READ_CULTURAL_ACHIEVEMENT_DETAIL,
    AppPermission.INITIALIZE_CULTURAL_ACHIEVEMENT_PROGRESS,
    AppPermission.UPDATE_CULTURAL_ACHIEVEMENT_PROGRESS,
    AppPermission.READ_USER_CULTURAL_ACHIEVEMENTS,
    AppPermission.READ_CULTURAL_ACHIEVEMENT_PROGRESS,
    AppPermission.CREATE_MISSION_TEMPLATE,
    AppPermission.READ_MISSION_TEMPLATES_LIST,
    AppPermission.READ_MISSION_TEMPLATE_DETAIL,
    AppPermission.UPDATE_MISSION_TEMPLATE,
    AppPermission.CREATE_CONTENT,
    AppPermission.READ_CONTENT_LIST,
    AppPermission.READ_CONTENT_DETAIL,
    AppPermission.UPDATE_CONTENT,
    AppPermission.DELETE_CONTENT,
    AppPermission.READ_CONTENT_BY_UNITY_AND_TOPIC,
    AppPermission.CREATE_REWARD,
    AppPermission.READ_REWARDS_LIST,
    AppPermission.AWARD_REWARD_TO_USER,
    AppPermission.READ_USER_REWARDS,
    AppPermission.CONSUME_REWARD,
    AppPermission.CHECK_REWARD_STATUS,
    AppPermission.CREATE_ACTIVITY,
    AppPermission.READ_ACTIVITIES_LIST,
    AppPermission.READ_ACTIVITY_DETAIL,
    AppPermission.READ_ACTIVITIES_BY_TYPE,
    AppPermission.READ_ACTIVITIES_BY_DIFFICULTY,
    AppPermission.UPDATE_ACTIVITY,
    AppPermission.DELETE_ACTIVITY,
    AppPermission.UPDATE_ACTIVITY_POINTS,
  ],
  [UserRole.TEACHER]: [
    AppPermission.READ_UNITIES,
    AppPermission.READ_UNITY,
    AppPermission.UPLOAD_MULTIMEDIA,
    AppPermission.READ_MULTIMEDIA_LIST,
    AppPermission.READ_MULTIMEDIA_DETAIL,
    AppPermission.DELETE_MULTIMEDIA,
    AppPermission.DOWNLOAD_MULTIMEDIA,
    AppPermission.CREATE_LESSON,
    AppPermission.READ_LESSONS_LIST,
    AppPermission.READ_LESSON_DETAIL,
    AppPermission.READ_LESSONS_BY_UNITY,
    AppPermission.UPDATE_LESSON,
    AppPermission.DELETE_LESSON,
    AppPermission.TOGGLE_LOCK_LESSON,
    AppPermission.UPDATE_LESSON_POINTS,
    AppPermission.MARK_LESSON_COMPLETED,
    AppPermission.CREATE_EXERCISE,
    AppPermission.READ_EXERCISES_LIST,
    AppPermission.READ_EXERCISE_DETAIL,
    AppPermission.UPDATE_EXERCISE,
    AppPermission.CREATE_CULTURAL_ACHIEVEMENT,
    AppPermission.READ_CULTURAL_ACHIEVEMENTS_LIST,
    AppPermission.READ_CULTURAL_ACHIEVEMENT_DETAIL,
    AppPermission.INITIALIZE_CULTURAL_ACHIEVEMENT_PROGRESS,
    AppPermission.UPDATE_CULTURAL_ACHIEVEMENT_PROGRESS,
    AppPermission.READ_USER_CULTURAL_ACHIEVEMENTS,
    AppPermission.READ_CULTURAL_ACHIEVEMENT_PROGRESS,
    AppPermission.CREATE_CONTENT,
    AppPermission.READ_CONTENT_LIST,
    AppPermission.READ_CONTENT_DETAIL,
    AppPermission.UPDATE_CONTENT,
    AppPermission.DELETE_CONTENT,
    AppPermission.READ_CONTENT_BY_UNITY_AND_TOPIC,
    AppPermission.CREATE_ACTIVITY,
    AppPermission.READ_ACTIVITIES_LIST,
    AppPermission.READ_ACTIVITY_DETAIL,
    AppPermission.READ_ACTIVITIES_BY_TYPE,
    AppPermission.READ_ACTIVITIES_BY_DIFFICULTY,
    AppPermission.UPDATE_ACTIVITY,
    AppPermission.DELETE_ACTIVITY,
    AppPermission.UPDATE_ACTIVITY_POINTS,
  ],
  [UserRole.MODERATOR]: [
    AppPermission.READ_REWARDS_LIST,
    AppPermission.AWARD_REWARD_TO_USER,
    AppPermission.READ_USER_REWARDS,
    AppPermission.CHECK_REWARD_STATUS,
    AppPermission.READ_UNITIES,
    AppPermission.READ_UNITY,
    AppPermission.TOGGLE_LOCK_UNITY,
    AppPermission.READ_MULTIMEDIA_LIST,
    AppPermission.READ_MULTIMEDIA_DETAIL,
    AppPermission.DELETE_MULTIMEDIA,
    AppPermission.DOWNLOAD_MULTIMEDIA,
    AppPermission.READ_LESSONS_LIST,
    AppPermission.READ_LESSON_DETAIL,
    AppPermission.READ_LESSONS_BY_UNITY,
    AppPermission.TOGGLE_LOCK_LESSON,
    AppPermission.CREATE_EXERCISE,
    AppPermission.READ_EXERCISES_LIST,
    AppPermission.READ_EXERCISE_DETAIL,
    AppPermission.UPDATE_EXERCISE,
    AppPermission.READ_CULTURAL_ACHIEVEMENTS_LIST,
    AppPermission.READ_CULTURAL_ACHIEVEMENT_DETAIL,
    AppPermission.INITIALIZE_CULTURAL_ACHIEVEMENT_PROGRESS,
    AppPermission.UPDATE_CULTURAL_ACHIEVEMENT_PROGRESS,
    AppPermission.READ_USER_CULTURAL_ACHIEVEMENTS,
    AppPermission.READ_CULTURAL_ACHIEVEMENT_PROGRESS,
    AppPermission.READ_REWARDS_LIST,
    AppPermission.AWARD_REWARD_TO_USER,
    AppPermission.READ_USER_REWARDS,
    AppPermission.CHECK_REWARD_STATUS,
    AppPermission.READ_ACTIVITIES_LIST,
    AppPermission.READ_ACTIVITY_DETAIL,
    AppPermission.READ_ACTIVITIES_BY_TYPE,
    AppPermission.READ_ACTIVITIES_BY_DIFFICULTY,
    AppPermission.READ_CONTENT_LIST,
    AppPermission.READ_CONTENT_DETAIL,
    AppPermission.READ_CONTENT_BY_UNITY_AND_TOPIC,
  ],
  [UserRole.USER]: [
    AppPermission.READ_UNITIES,
    AppPermission.READ_UNITY,
    AppPermission.READ_MULTIMEDIA_LIST,
    AppPermission.READ_MULTIMEDIA_DETAIL,
    AppPermission.DOWNLOAD_MULTIMEDIA,
    AppPermission.READ_CONTENT_LIST,
    AppPermission.READ_CONTENT_DETAIL,
    AppPermission.READ_CONTENT_BY_UNITY_AND_TOPIC,
    AppPermission.READ_LESSONS_LIST,
    AppPermission.READ_LESSON_DETAIL,
    AppPermission.READ_LESSONS_BY_UNITY,
    AppPermission.READ_EXERCISES_LIST,
    AppPermission.READ_EXERCISE_DETAIL,
    AppPermission.READ_CULTURAL_ACHIEVEMENTS_LIST,
    AppPermission.READ_CULTURAL_ACHIEVEMENT_DETAIL,
    AppPermission.READ_REWARDS_LIST,
    AppPermission.READ_ACTIVITIES_LIST,
    AppPermission.READ_ACTIVITY_DETAIL,
    AppPermission.READ_ACTIVITIES_BY_TYPE,
    AppPermission.READ_ACTIVITIES_BY_DIFFICULTY,
  ], // Permisos básicos de usuario no cubiertos por MANAGE_*
  [UserRole.STUDENT]: [
    AppPermission.READ_ACTIVITIES_LIST,
    AppPermission.READ_ACTIVITY_DETAIL,
    AppPermission.READ_ACTIVITIES_BY_TYPE,
    AppPermission.READ_ACTIVITIES_BY_DIFFICULTY,
    AppPermission.READ_REWARDS_LIST,
    AppPermission.READ_USER_REWARDS,
    AppPermission.CONSUME_REWARD,
    AppPermission.CHECK_REWARD_STATUS,
    AppPermission.READ_CULTURAL_ACHIEVEMENTS_LIST,
    AppPermission.READ_CULTURAL_ACHIEVEMENT_DETAIL,
    AppPermission.READ_USER_CULTURAL_ACHIEVEMENTS,
    AppPermission.READ_CULTURAL_ACHIEVEMENT_PROGRESS,
    AppPermission.READ_EXERCISES_LIST,
    AppPermission.READ_EXERCISE_DETAIL,
    AppPermission.READ_UNITIES,
    AppPermission.READ_LESSONS_LIST,
    AppPermission.READ_LESSON_DETAIL,
    AppPermission.READ_LESSONS_BY_UNITY,
    AppPermission.MARK_LESSON_COMPLETED,
    AppPermission.READ_UNITY,
    AppPermission.READ_MULTIMEDIA_LIST,
    AppPermission.READ_MULTIMEDIA_DETAIL,
    AppPermission.DOWNLOAD_MULTIMEDIA,
  ], // Permisos básicos de estudiante no cubiertos por MANAGE_*
};
```

### Uso del Decorador `@Roles()`

El decorador `@Roles()` ahora se utiliza en los controladores para especificar los **permisos** requeridos para acceder a una ruta, en lugar de los roles directamente. El `RolesGuard` utiliza el `AuthorizationService` para verificar si el usuario autenticado tiene alguno de los permisos especificados.

---

## Pendientes y recomendaciones (Backend)

*   Documentar el flujo de validación de email.
*   Mantener ejemplos de payloads y respuestas actualizados.
*   Asegurar que la propiedad `role` se incluya correctamente en el payload del token JWT devuelto por el backend (en el endpoint de verificación de sesión).
*   Asegurar que `VITE_API_URL` use HTTPS en producción.
*   Implementar la validación de la firma del token JWT en el backend.
*   Confirmar la lógica de usar el email como username por defecto en el registro con los requisitos del backend.
*   Los tests unitarios para `auth.service.spec.ts` han sido corregidos y ahora pasan. Se han añadido pruebas para el guard `JwtAuthGuard` y ahora prioriza el token del header sobre el de las cookies.

---

Última actualización: 7/5/2025, 12:33 a. m. (America/Bogota, UTC-5:00)
