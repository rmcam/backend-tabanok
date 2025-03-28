# Procesador de PDF a JSON

Esta herramienta convierte documentos PDF a formato JSON estructurado, especialmente diseñada para procesar documentos relacionados con el proyecto Tabanok.

## Características

- Extracción de texto completo de PDFs
- Detección automática de idioma
- Identificación de secciones basada en títulos
- Estadísticas del documento (páginas, palabras, etc.)
- Procesamiento por lotes de múltiples PDFs
- Soporte para caracteres especiales y múltiples idiomas

## Requisitos

```bash
pip install -r requirements.txt
```

## Uso

1. Coloca los archivos PDF que deseas procesar en la carpeta `../recursos`
2. Ejecuta el script:

```bash
python pdf_to_json.py
```

3. Los archivos JSON resultantes se guardarán en la carpeta `output/`

## Estructura del JSON generado

```json
{
    "metadata": {
        "filename": "nombre_archivo.pdf",
        "processed_date": "2024-03-28T...",
        "file_size": 12345
    },
    "content": [
        {
            "page_number": 1,
            "text": "contenido de la página",
            "sentences": ["oración 1", "oración 2"],
            "words": 150
        }
    ],
    "sections": [
        {
            "title": "Título de la sección",
            "content": "contenido...",
            "page_start": 1
        }
    ],
    "detected_language": "es",
    "statistics": {
        "total_pages": 10,
        "total_paragraphs": 50,
        "total_words": 5000
    }
}
```

## Notas

- La herramienta está optimizada para documentos académicos y técnicos
- Soporta documentos en español y otros idiomas
- Los archivos de salida mantienen la codificación UTF-8 para caracteres especiales 