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
