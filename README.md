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

## Hoja de Ruta

Próximos Pasos (Q1 2025): Finalizar la integración del diccionario Kamëntsá, avanzar en la implementación de pruebas unitarias y E2E (se han corregido errores en LeaderboardRepository), y mejorar la accesibilidad del frontend.

Metas a Mediano Plazo (Q2-Q3 2025): Desarrollar la API para la gestión de contenido cultural y realizar una auditoría de accesibilidad WCAG 2.1.

Visión a Largo Plazo (Q4 2025 y más allá): Expandir la plataforma con nuevas funcionalidades y establecer colaboraciones con la comunidad Kamëntsá.

## Issues Conocidos

La validación lingüística necesita mejoras.

La accesibilidad del frontend requiere mejoras significativas.

La lógica de gamificación no está implementada.

## Contacto

- Autor - [rmcam](https://twitter.com/rmcam)
