# Flujo de Autenticación y Protección de Rutas en Tabanok Frontend

---

## Resumen

Este documento describe la implementación actual de la autenticación en Tabanok, integrando **React (Vite + TypeScript)** en el frontend y **NestJS** en el backend.

---

## Endpoints de Autenticación

- **Login:** `POST /signin`
- **Registro:** `POST /signup`
- **Cerrar sesión:** `POST /auth/logout`
- **Solicitar restablecimiento de contraseña:** `POST /auth/forgot-password`
- **Restablecer contraseña:** `POST /auth/reset-password`

---

## Payloads y Respuestas

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

**Descripción:** El formulario de registro ahora es un formulario de varios pasos con **indicador de progreso** y **validación por pasos**. Los campos se dividen en tres pasos:

*   Paso 1: Información de la cuenta (email, contraseña, usuario)
*   Paso 2: Información personal (nombre, segundo nombre, apellido, segundo apellido)
*   Paso 3: Confirmación de datos

La validación se ejecuta al interactuar con el campo (`onBlur`) y **al intentar avanzar al siguiente paso**. Los inputs muestran **feedback visual de error** (borde rojo).

**Request:**

```json
POST /api/auth/signup
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
POST /auth/forgot-password
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
POST /auth/logout
```

**Response:**

```json
{
  "message": "Sesión cerrada exitosamente"
}
```

---

## Flujo de Autenticación

1.  El usuario se registra enviando los campos requeridos al endpoint `/api/auth/signup`.
2.  El usuario inicia sesión enviando `identifier` (nombre de usuario o email) y `password` a `/auth/signin`.
3.  El backend establece el `accessToken` y el `refreshToken` como cookies HttpOnly en la respuesta.
4.  El frontend ya no almacena los tokens en `localStorage` ni `sessionStorage`, ya que se gestionan automáticamente a través de las cookies HttpOnly por el navegador.
5.  Para verificar la sesión inicial o después de acciones de autenticación (login/signup), el frontend llama a un endpoint de verificación de sesión en el backend (ej. `/auth/verify-session`).
6.  El backend, al recibir la solicitud de verificación de sesión, lee automáticamente el `accessToken` de la cookie HttpOnly.
7.  El backend valida el token y, si es válido, devuelve los datos del usuario autenticado.
8.  El frontend utiliza los datos del usuario recibidos para actualizar el estado de autenticación en la aplicación.
9.  Para acceder a rutas protegidas, las solicitudes subsiguientes enviadas desde el frontend al backend incluirán automáticamente las cookies HttpOnly.
10. El `JwtAuthGuard` en el backend lee automáticamente el `accessToken` de la cookie `accessToken` para validar y autorizar el acceso a las rutas protegidas.
11. Si el token ha expirado o no es válido, el backend devuelve un error 401 (No autorizado). El frontend intercepta este error y redirige al usuario a la página de inicio de sesión.
12. La renovación de tokens (si es necesaria) se espera que sea manejada automáticamente por el backend utilizando la cookie HttpOnly del refresh token en un endpoint específico (ej. `/auth/refresh-token`), sin intervención directa del frontend para leer o guardar los tokens.
13. Para cerrar sesión, el frontend llama a un endpoint de logout en el backend (ej. `/auth/signout`). El backend elimina las cookies HttpOnly de autenticación.

---

## Protección de rutas sensibles

### Frontend

- El frontend utiliza el componente `PrivateRoute` para proteger rutas sensibles.
- Si el usuario no está autenticado (determinado por el estado del `AuthContext`, que se actualiza a través de la verificación de sesión con el backend), se muestra un loader mientras se verifica el estado; si no está autenticado tras la verificación, se redirige automáticamente a la página de login (`/login`).
- Si la ruta requiere un rol específico (por ejemplo, `admin`), y el usuario no lo tiene, se redirige a `/unauthorized`.
- Tras iniciar sesión correctamente, el usuario es redirigido automáticamente a `/dashboard`. El componente `Dashboard` utiliza el hook `useUnits` para cargar las unidades. La ruta de la API para obtener las unidades es `/api/unity`.
- **El componente `PrivateRoute` ahora acepta una prop `requiredRoles` (un array de strings) para especificar qué roles tienen permiso para acceder a la ruta.**
- Las rutas protegidas actualmente son:
  - `/dashboard` (requiere roles: 'user', 'student')
  - `/teacher-dashboard` (requiere rol: 'teacher')
  - `/` (requiere autenticación, sin roles específicos)
- Ejemplo de uso en `App.tsx`:

  ```tsx
  <Route
    path="/dashboard"
    element={
      <PrivateRoute requiredRoles={['user', 'student']}> {/* Ejemplo con roles */}
        <Dashboard />
      </PrivateRoute>
    }
  />
  ```

### Backend

- El backend utiliza guards (`JwtAuthGuard` y `RolesGuard`) para proteger las rutas. Estas guardias se aplican **globalmente** a toda la aplicación.
- `JwtAuthGuard` verifica la validez del token JWT leyendo el `accessToken` de la cookie `accessToken`. Las rutas marcadas con `@Public()` son excluidas de esta guardia.
- `RolesGuard` verifica si el usuario tiene el rol necesario para acceder a la ruta, basándose en el decorador `@Roles()`.
- Si el usuario no está autenticado, no tiene permisos, o el token ha expirado, se deniega el acceso con un código de estado 401 (No autorizado) o 403 (Prohibido).

#### Manejo de Tokens Expirados

- El backend verifica la fecha de expiración del token JWT.
- Si el token ha expirado, se devuelve un error 401 (No autorizado).
- El frontend intercepta este error (por ejemplo, a través de un interceptor en el cliente HTTP) y redirige al usuario a la página de inicio de sesión.

#### Manejo de Rutas Públicas Específicas (`/lesson/featured`)

Se identificó un problema donde el endpoint `GET /lesson/featured`, a pesar de estar marcado con `@Public()`, requería autenticación. La causa raíz fue el orden de las rutas en `LessonController`, donde la ruta dinámica `GET /lesson/:id` interceptaba las solicitudes dirigidas a `/lesson/featured`.

**Solución Implementada:**

1.  **Reordenamiento de Rutas:** En `src/features/lesson/lesson.controller.ts`, la definición de la ruta `GET /lesson/featured` se movió para que aparezca antes de la ruta `GET /lesson/:id`. Esto asegura que la solicitud a `/lesson/featured` sea manejada por el método correcto.
2.  **Configuración Global del Guardia:** El `JwtAuthGuard` se aplica globalmente en `src/app.module.ts` utilizando `APP_GUARD` con `useFactory` para asegurar la correcta inyección del `Reflector`.
3.  **Limpieza del Módulo de Autenticación:** Se eliminó `JwtAuthGuard` y `JwtStrategy` de los `providers` y `exports` en `src/auth/auth.module.ts` para evitar duplicidad y posibles conflictos con la instancia global del guardia.
4.  **Verificación Manual en el Guardia (Solución Alternativa):** Se añadió una verificación explícita en el método `canActivate` de `JwtAuthGuard` para permitir el acceso si la URL de la solicitud comienza con `/lesson/featured` y el método es `GET`. Esto actúa como una capa adicional de seguridad si el reconocimiento de metadatos falla por alguna razón.

---

## Estructura del Frontend de Autenticación

-   `src/auth/services/authService.ts`: Contiene las funciones para realizar las llamadas a la API de autenticación (Login, Signup, Forgot Password, Verify Session, Signout). Ya no espera tokens en el cuerpo de la respuesta para login/signup/refresh, y se añadió la función `verifySession` y `signout`. Se **eliminaron valores hardcodeados** en la función `signup`. Se ha mejorado el manejo de errores para mostrar mensajes genéricos en producción y específicos en desarrollo, y se corrigió el tipado de los bloques `catch`.
-   `src/auth/hooks/useAuthService.ts`: Hook personalizado que encapsula la lógica de las llamadas a la API de autenticación. Utilizado internamente por el `AuthContext`. Ahora exporta la función `verifySession` y `signout`, y se eliminó la lógica de manejo directo de tokens y toasts.
-   `src/auth/utils/authUtils.ts`: Contiene utilidades relacionadas con la autenticación. Las funciones de manejo de tokens (`saveToken`, `getToken`, `removeToken`, etc.) ahora son no-op o devuelven null, ya que el frontend no interactúa directamente con las cookies HttpOnly. La función `decodeTokenAndCreateUser` se mantiene por si es necesaria en algún flujo específico (aunque con la verificación de sesión, los datos del usuario vienen directamente del backend).
-   `src/auth/context/authContext.ts`: Define y exporta el **Contexto de Autenticación** (`AuthContext`) y la interfaz `AuthContextType`.
-   `src/auth/context/authProvider.tsx`: Define y exporta el componente **Proveedor de Autenticación** (`AuthProvider`). Centraliza la lógica de manejo del estado del usuario, y **estados de carga individuales** (`signingIn`, `signingUp`, `requestingPasswordReset`). La verificación de autenticación inicial y la actualización del estado del usuario después de login/signup ahora se realizan llamando a la función `verifySession` del servicio. También integra el manejo de **notificaciones (integrado con `sonner`)**. Se mejoró el manejo de errores para mostrar mensajes más amigables.
-   `src/auth/hooks/useAuth.ts`: Hook simple para consumir el `AuthContext`.
-   `src/auth/components/`: Componentes específicos de autenticación (`SigninForm.tsx`, `SignupForm.tsx`, `ForgotPasswordForm.tsx`). Implementan formularios con validación, incluyen **feedback visual de error** en los inputs, y ahora utilizan el hook `useAuth` para realizar las operaciones de autenticación y manejar la navegación. Los componentes `SigninForm` y `ForgotPasswordForm` utilizan los **estados de carga individuales** del contexto. `SignupForm` fue refactorizado para **eliminar estados locales redundantes** y simplificar la lógica de validación por pasos (aunque la integración con `useFormValidation` para validación por pasos podría requerir ajustes adicionales en el hook mismo).
-   `src/components/common/FormWrapper.tsx`: Componente para envolver los formularios, centralizando los **stilos visuales del contenedor**.
-   `src/components/common/Modal.tsx`: Componente genérico reutilizable para mostrar contenido en un diálogo modal. La prop `trigger` es **opcional**, permitiendo la apertura programática.
-   `src/components/common/AuthModals.tsx`: Componente que agrupa los modales de autenticación, refactorizado para usar un único componente `Modal` con contenido dinámico.
-   `src/components/common/PrivateRoute.tsx`: Componente de orden superior para proteger rutas sensibles. Utiliza el `AuthContext` para verificar la autenticación y **habilita la verificación de roles**.
-   `src/components/layout/AuthenticatedLayout.tsx`: Componente de layout utilizado por las rutas autenticadas que incluye el `AppSidebar` y el contenido de la página.
-   `src/App.tsx`: Define las rutas principales de la aplicación, utiliza `PrivateRoute` y envuelve las rutas protegidas con `AuthenticatedLayout`. Espera a que la carga inicial de autenticación se complete.

---

## Pendientes y recomendaciones

- Documentar el flujo de validación de email.
- Mantener ejemplos de payloads y respuestas actualizados.
- Asegurar la **congruencia de la tipografía** en los formularios con la paleta de estilos general del proyecto.
- Asegurar que la propiedad `role` se incluya correctamente en el payload del token JWT devuelto por el backend (en el endpoint de verificación de sesión).
- [x] Implementar el almacenamiento de tokens en `HttpOnly cookies` (requiere cambios en el backend). | ✅ | (Implementado en backend y frontend).
- Asegurar que `VITE_API_URL` use HTTPS en producción.
- Implementar la validación de la firma del token JWT en el backend.
- Confirmar la lógica de usar el email como username por defecto en el registro con los requisitos del backend.
- Unificar el manejo de errores (retornar booleanos vs. lanzar errores) en el `AuthContext`.

---

Última actualización: 23/4/2025, 3:16:00 p. m. (America/Bogota, UTC-5:00)
