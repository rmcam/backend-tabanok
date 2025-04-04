# Instrucciones de Desarrollo para la Aplicación Kamëntsá

## 🔄 Conciencia del Proyecto y Contexto Cultural

- **Documentación esencial**:
  - Consultar `README.md`, `docs/Arquitectura.md` y `EstadoProyecto.md` (crear si no existen)
  - Extraer endpoints dinámicamente de Swagger (`/api/v1/docs#/`)
- **Datos lingüísticos**:
  - Validación fonética basada en `@json` del diccionario
- **Sensibilidad cultural**:
  - Priorizar revitalización lingüística
  - Respetar cosmovisión Kamëntsá en diseño
  - Manejo riguroso de diacríticos (ë, s̈, ts̈, ñ) con UTF-8

## ♿ Accesibilidad

- **Frontend**:
  - Atributos ARIA completos
  - Contraste mínimo 4.5:1 para texto
  - Navegación por teclado 100% funcional
  - Integrar `eslint-plugin-jsx-a11y`
- **Multilingüe**:
  - Etiquetas en Kamëntsá y español
  - Soporte para lectores de pantalla
  - Iconografía culturalmente apropiada

## 🧱 Estructura del Código

### NestJS:

```text
- Módulos (*.module.ts)
- Controladores (*.controller.ts)
- Servicios (*.service.ts)
- DTOs (dto/)
- Inyección de dependencias
```

### Next.js:

```text
- App/Pages Router según docs
- Componentes reutilizables (components/)
- Zustand/Context API para estado
- Lazy loading de rutas
```

### Buenas Prácticas:

- Modularidad por funcionalidad (auth, dictionary, gamification)
- Límite 500 líneas por archivo
- Alias `@/` configurado en `tsconfig.json`

## 🧪 Pruebas

### Backend:

```text
- Unitarios (*.spec.ts) - Jest
- E2E (*.e2e-spec.ts) - Supertest
- Cobertura >80% en lógica crítica
```

### Frontend:

```text
- React Testing Library
- Pruebas de interacción clave
- Mock de API completo
```

## 🔄 CI/CD

- **Pre-commit**:
  - Husky + lint-staged
  - Validación de tipos y estilo
- **Pipeline**:
  - GitHub Actions con:
    - Build y tests
    - Auditoría de seguridad
- **Despliegue**:
  - Blue-green (backend)
  - ISR (frontend)

## ⚡ Optimización Next.js

- **Renderizado**:
  - SSG: Contenido estático
  - SSR: Datos personales
  - ISR: Contenido semidinámico
- **Caché**:
  - SWR para datos frecuentes
  - Redis para sesiones
- **Performance**:
  - Bundle analysis
  - Code splitting

## 📝 Documentación

### Estándares:

````markdown
## [Nombre del Componente]

### Propósito

[Descripción clara en español/Kamëntsá]

### Uso

```typescript
// Ejemplo con diacríticos
```
````

### API

| Endpoint        | Método | Descripción    |
| --------------- | ------ | -------------- |
| `/api/palabras` | GET    | Busca términos |

````

### TSDoc:
```typescript
/**
 * Valida fonética Kamëntsá
 * @param termino - Palabra con diacríticos
 * @returns {ValidationResult} - Objeto con:
 *  - isValid: boolean
 *  - sugerencias: string[]
 * @example validarFonetica('ts̈ëngbe')
 */
````

## ✅ Gestión de Tareas

- **Commits**:
  - Conventional Commits
  - Mensajes bilingües
- **PRs**:
  - Checklist de revisión:
    - [ ] Pruebas pasan
    - [ ] Documentación actualizada
    - [ ] Validación diacríticos
    - [ ] Revisión accesibilidad

## 💅 Estilo

- **TypeScript**:
  - `strict: true` en tsconfig
  - Tipado explícito
- **Formato**:
  - ESLint + Prettier
  - Nomenclatura consistente
- **Errores**:
  - Backend: `HttpException` estructurado
  - Frontend: Mensajes traducibles

## 🧠 Reglas de IA

1. Confirmar contexto antes de modificar
2. Validar existencia con `list_files`
3. Detectar vulnerabilidades:
   - XSS/CSRF
   - Inyecciones SQL
4. Sugerir mejoras continuas
5. Mantener respuestas siempre en español
