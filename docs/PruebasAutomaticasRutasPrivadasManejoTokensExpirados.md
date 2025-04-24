# Pruebas Automáticas para Rutas Privadas

---

## Pruebas de `PrivateRoute`

Las pruebas para el componente `PrivateRoute` se encuentran en `frontend/src/components/PrivateRoute.test.tsx`.

*   Redirige a `/login` si no autenticado.
*   Renderiza el contenido si autenticado.
*   Redirige a `/unauthorized` si el rol no es correcto.
*   Renderiza el contenido si el rol es correcto.
*   Muestra el indicador de carga mientras se autentica.

### Manejo de Tokens Expirados

El backend devuelve un error 401 (No autorizado) si el token JWT ha expirado. El frontend redirige al usuario a `/login`.
---
