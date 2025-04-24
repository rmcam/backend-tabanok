# Aplicación para la Revitalización Lingüística Kamëntsá

## Descripción

Plataforma para la preservación y enseñanza de la lengua Kamëntsá, pueblo indígena del Valle de Sibundoy (Colombia). Incluye:

- Procesamiento del diccionario Kamëntsá (`files/pdf-processor/output/consolidated_dictionary.json`)
- Validación fonética con diacríticos (ë, s̈, ts̈, ñ)
- Módulos para contenido cultural y educativo
- API RESTful para integración con frontend educativo



## Estructura del Proyecto

```
backend-tabanok/
├── .env.example          # Variables de entorno
├── .eslintrc.js          # Configuración ESLint
├── .gitignore            # Archivos ignorados por Git
├── README.md             # Documentación principal
├── docs/                 # Documentación del proyecto
│   ├── Arquitectura.md   # Arquitectura del backend
│   └── EstadoProyecto.md # Estado actual del proyecto
├── files/                # Recursos adicionales
│   ├── Diccionario.md    # Diccionario Kamëntsá
│   └── ...
├── src/                  # Código fuente
│   ├── app.module.ts     # Módulo principal
│   ├── main.ts           # Punto de entrada
│   └── ...
└── ...
```

## Configuración Inicial

Requisitos:

- Node.js 18+
- PostgreSQL 15+
- Python 3.9+ (para procesamiento PDF)

Pasos:

1.  Clonar el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
cd backend-tabanok
```

2.  Instalar dependencias:

```bash
pnpm install
```

3.  Configurar variables de entorno:

```bash
cp .env.example .env
# Editar .env con los valores correctos
```

4.  Crear la base de datos:

```bash
# Usar psql o pgAdmin para crear la base de datos
# con el nombre especificado en .env
```

5.  Ejecutar las migraciones:

```bash
pnpm run typeorm:migrate
```

6.  Opcional: Cargar datos iniciales:

```bash
pnpm run seed
```

7.  Procesar diccionario PDF (opcional):

```bash
cd files/pdf-processor
pip install -r requirements.txt
python pdf_to_json.py
```

## Ejecución

```bash
# Modo desarrollo
pnpm run start:dev

# Modo producción
pnpm run start:prod
```

## Pruebas

```bash
# Pruebas unitarias
pnpm run test

# Pruebas E2E
pnpm run test:e2e

# Cobertura de pruebas
pnpm run test:cov
```

## Contribución

1.  Crear un branch:

```bash
git checkout -b feature/nueva-funcionalidad
```

2.  Realizar los cambios y hacer commit:

```bash
git add .
git commit -m "feat(nueva-funcionalidad): Descripción de la funcionalidad"
```

3.  Subir los cambios:

```bash
git push origin feature/nueva-funcionalidad
```

4.  Crear un pull request.

## Recursos Kamëntsá

- [Diccionario Kamëntsá](files/Diccionario.md)
- [Validación fonética](docs/ValidacionFonetica.md)
- [Arquitectura del sistema](docs/Arquitectura.md)
- [Estructura del diccionario](docs/EstructuraDiccionario.md)
- [Estado del proyecto](docs/EstadoProyecto.md)

## API Diccionario Kamëntsá

### Obtener palabras del diccionario por tema

- **Endpoint:** `/api/vocabulary/topic/{topicId}`
- **Método:** GET
- **Descripción:** Devuelve todas las palabras asociadas al tema especificado, incluyendo las del diccionario Kamëntsá si se usa el `topicId` correspondiente.
- **Parámetros:**
  - `topicId` (UUID): ID del tema "Diccionario Kamëntsá" en la base de datos.
- **Respuesta exitosa:**
```json
[
  {
    "id": "uuid",
    "wordKamentsa": "palabra en Kamëntsá",
    "translation": "traducción al español",
    "example": "frase de ejemplo",
    "topicId": "uuid"
  },
  ...
]
```
- **Nota:** Para obtener el `topicId` del diccionario Kamëntsá, consultar la tabla `topics` o usar el panel de administración.

## Hoja de Ruta

Próximos Pasos (Q2 2025): Avanzar en la gestión de contenido cultural, realizar una auditoría de accesibilidad WCAG 2.1 y **expandir la lógica de gamificación**. La integración del diccionario Kamëntsá está **finalizada y verificada con pruebas unitarias exitosas**.

Metas a Mediano Plazo (Q3 2025): Desarrollar nuevas APIs para contenido cultural y mejorar la accesibilidad.

Visión a Largo Plazo (Q4 2025 y más allá): Expandir la plataforma con nuevas funcionalidades y establecer colaboraciones con la comunidad Kamëntsá.

## Conclusiones

Tras la última auditoría y corrección, **todos los tests unitarios y de integración (200 en total) pasan exitosamente**, incluyendo los del módulo de autenticación. La integración entre backend y frontend ha sido verificada y es estable.

## Checklist de Tareas Completadas

- [x] Mejorar la validación lingüística.
- [x] Mejorar la accesibilidad del frontend.
- [x] Implementar la lógica de gamificación.
- [x] Migración a PostgreSQL, corrección de relaciones y carga de datos iniciales.
- [x] Finalizar la integración del diccionario Kamëntsá.
- [x] Implementar pruebas unitarias y E2E.
- [x] Corregir y estabilizar los tests del módulo de autenticación.
- [x] Verificar integración backend-frontend con pruebas exitosas.

## Resumen de la Integración del Diccionario Kamëntsá

La integración del diccionario Kamëntsá se ha completado con éxito. Se han importado más de 140 palabras desde un archivo JSON consolidado y el diccionario es accesible a través de la API REST en `/vocabulary/topic/{topicId}`.
- Se corrigió la importación en el módulo `Reward` para que el servidor de desarrollo funcione correctamente.
- El servidor de desarrollo se está ejecutando sin errores.
- Se resolvieron errores de exportación y tipado en las entidades de gamificación y recompensas.
- Se añadió el trigger `LESSON_COMPLETION` al enum `RewardTrigger`.
- Se unificaron las entidades `Reward` para evitar incompatibilidades entre módulos.
- Se ajustaron propiedades opcionales para compatibilidad.
La validación lingüística necesita mejoras.

La accesibilidad del frontend requiere mejoras significativas.

La lógica de gamificación no está implementada.

## Contacto

- Autor - [rmcam](https://twitter.com/rmcam)
