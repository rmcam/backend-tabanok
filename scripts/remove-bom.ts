import * as fs from 'fs';
import * as path from 'path';

const filePath = process.argv[2];

if (!filePath) {
  console.error('Uso: pnpm exec ts-node scripts/remove-bom.ts <ruta_del_archivo>');
  process.exit(1);
}

const fullPath = path.resolve(filePath);

fs.readFile(fullPath, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error al leer el archivo ${fullPath}:`, err);
    process.exit(1);
  }

  // Check for BOM (Byte Order Mark) at the beginning of the file
  // BOM for UTF-8 is 0xEF, 0xBB, 0xBF
  const bom = '\uFEFF';
  let cleanedData = data;

  if (data.startsWith(bom)) {
    console.log(`BOM encontrado en ${fullPath}. Eliminando...`);
    cleanedData = data.substring(bom.length);
  } else {
    console.log(`No se encontró BOM en ${fullPath}.`);
  }

  fs.writeFile(fullPath, cleanedData, 'utf8', (err) => {
    if (err) {
      console.error(`Error al escribir el archivo ${fullPath}:`, err);
      process.exit(1);
    }
    console.log(`Archivo ${fullPath} procesado exitosamente.`);
  });
});
