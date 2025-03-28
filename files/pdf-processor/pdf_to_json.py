import os
import json
import pdfplumber
from typing import Dict, List, Any
from datetime import datetime
from langdetect import detect
import nltk
from nltk.tokenize import sent_tokenize

# Descargar recursos necesarios de NLTK
nltk.download('punkt')

class PDFProcessor:
    def __init__(self, input_dir: str, output_dir: str):
        self.input_dir = input_dir
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def process_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """Procesa un archivo PDF y extrae su contenido estructurado."""
        print(f"Procesando: {pdf_path}")
        
        document_data = {
            "metadata": {
                "filename": os.path.basename(pdf_path),
                "processed_date": datetime.now().isoformat(),
                "file_size": os.path.getsize(pdf_path)
            },
            "content": [],
            "sections": [],
            "detected_language": None,
            "statistics": {
                "total_pages": 0,
                "total_paragraphs": 0,
                "total_words": 0
            }
        }

        try:
            with pdfplumber.open(pdf_path) as pdf:
                document_data["statistics"]["total_pages"] = len(pdf.pages)
                all_text = ""
                
                for page_num, page in enumerate(pdf.pages, 1):
                    text = page.extract_text()
                    if text:
                        all_text += text
                        sentences = sent_tokenize(text)
                        
                        page_content = {
                            "page_number": page_num,
                            "text": text,
                            "sentences": sentences,
                            "words": len(text.split())
                        }
                        
                        document_data["content"].append(page_content)
                        document_data["statistics"]["total_words"] += page_content["words"]

                # Detectar idioma
                if all_text.strip():
                    try:
                        document_data["detected_language"] = detect(all_text)
                    except:
                        document_data["detected_language"] = "unknown"

                # Identificar secciones basadas en títulos comunes
                current_section = None
                for page_content in document_data["content"]:
                    lines = page_content["text"].split('\n')
                    for line in lines:
                        line = line.strip()
                        if line.isupper() or any(keyword in line.lower() for keyword in 
                            ["capítulo", "sección", "introducción", "conclusión", "resumen"]):
                            if current_section:
                                document_data["sections"].append(current_section)
                            current_section = {
                                "title": line,
                                "content": "",
                                "page_start": page_content["page_number"]
                            }
                        elif current_section:
                            current_section["content"] += line + "\n"
                
                if current_section:
                    document_data["sections"].append(current_section)

        except Exception as e:
            document_data["error"] = str(e)
            print(f"Error procesando {pdf_path}: {e}")

        return document_data

    def process_directory(self):
        """Procesa todos los PDFs en el directorio de entrada."""
        for filename in os.listdir(self.input_dir):
            if filename.lower().endswith('.pdf'):
                pdf_path = os.path.join(self.input_dir, filename)
                output_filename = os.path.splitext(filename)[0] + '.json'
                output_path = os.path.join(self.output_dir, output_filename)
                
                # Procesar PDF
                document_data = self.process_pdf(pdf_path)
                
                # Guardar resultado
                with open(output_path, 'w', encoding='utf-8') as f:
                    json.dump(document_data, f, ensure_ascii=False, indent=2)
                print(f"JSON generado: {output_path}")

def main():
    # Configurar directorios
    base_dir = os.path.dirname(os.path.abspath(__file__))
    input_dir = os.path.join(os.path.dirname(base_dir), 'recursos')
    output_dir = os.path.join(base_dir, 'output')
    
    # Crear procesador
    processor = PDFProcessor(input_dir, output_dir)
    
    # Procesar PDFs
    processor.process_directory()
    print("Procesamiento completado.")

if __name__ == "__main__":
    main() 