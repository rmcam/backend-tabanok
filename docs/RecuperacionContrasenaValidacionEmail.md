# Recuperación de Contraseña

---

## Flujo

1.  Usuario solicita restablecer contraseña.
2.  Frontend: envía email a `/auth/forgot-password`.
3.  Backend: genera token y fecha de expiración, actualiza `User`.
4.  Backend: envía email con enlace.
5.  Usuario: hace clic en enlace.
6.  Frontend: envía token y nueva contraseña a `/auth/reset-password`.
7.  Backend: valida token, actualiza contraseña, elimina token.
8.  Backend: responde con éxito.
9.  Frontend: redirige a inicio de sesión.

### Endpoints

*   `/auth/forgot-password`: Solicitar restablecimiento.
*   `/auth/reset-password`: Restablecer contraseña.

### Payloads y Respuestas

#### Solicitar restablecimiento de contraseña

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

#### Restablecer contraseña

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

### Entidad `User`

*   `resetPasswordToken`: Token para restablecer.
*   `resetPasswordExpires`: Fecha de expiración.

## Validación de Email

Pendiente.
---
