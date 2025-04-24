# Hooks Personalizados (`useAuth`, `useUnits`)

---

## `useAuth`

Acceso al contexto de autenticación.

*   **Ubicación:** `frontend/src/auth/hooks/useAuth.ts`
*   **Descripción:** Proporciona acceso al estado de autenticación y funciones relacionadas (inicio de sesión, registro, cierre de sesión, recuperación de contraseña).
*   **Uso:**

```typescript
import { useAuth } from '../../auth/hooks/useAuth';

function MyComponent() {
  const { user, signin, signup, signout, forgotPassword, loading } = useAuth();
  // ...
}
```

*   **Retorno:**
    *   `user`: Usuario autenticado (`User | null`).
    *   `loading`: Indica si la verificación de autenticación inicial está en curso.
    *   `signingIn`: Indica si la operación de inicio de sesión está en curso.
    *   `signingUp`: Indica si la operación de registro está en curso.
    *   `requestingPasswordReset`: Indica si la operación de solicitud de restablecimiento de contraseña está en curso.
    *   `signin`: Función para iniciar sesión.
    *   `signup`: Función para registrarse.
    *   `signout`: Función para cerrar sesión.
    *   `forgotPassword`: Función para solicitar restablecimiento de contraseña.

*   **Ejemplo:**

```typescript
import { useAuth } from '../../auth/context/AuthContext';
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const { user, signout } = useAuth();
  const navigate = useNavigate();

  const handleSignout = () => {
    signout();
    navigate('/');
  };

  return (
    <div>
      {user ? (
        <>
          <p>Bienvenido, {user.email}!</p>
          <button onClick={handleSignout}>Cerrar sesión</button>
        </>
      ) : (
        <p>Por favor, inicia sesión.</p>
      )}
    </div>
  );
}
```

## `useUnits`

Acceso a la lista de unidades del usuario autenticado.

*   **Ubicación:** `frontend/src/hooks/useUnits.ts`
*   **Descripción:** Utiliza `useAuth` para obtener el estado de autenticación y obtener la lista de unidades.
*   **Uso:**

```typescript
import useUnits from './useUnits';

function MyComponent() {
  const { units, loading, error } = useUnits();
  // ...
}
```

*   **Retorno:**
    *   `units`: Lista de unidades del usuario.
    *   `loading`: Indica si la lista de unidades está cargando.
    *   `error`: Mensaje de error (si ocurre).

*   **Ejemplo:**

```typescript
import useUnits from './useUnits';

function MyComponent() {
  const { units, loading, error } = useUnits();

  if (loading) {
    return <p>Cargando unidades...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <ul>
      {units.map((unit) => (
        <li key={unit.id}>{unit.name}</li>
      ))}
    </ul>
  );
}
```

---

Última actualización: 23/4/2025, 3:16 p. m. (America/Bogota, UTC-5:00)
