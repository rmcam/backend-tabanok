const fs = require('fs');
const path = require('path');

const jsonFilesDir = path.join(__dirname, 'src', 'database', 'files', 'json');
const outputFilePath = path.join(jsonFilesDir, 'consolidated_dictionary.json');

const filesToConsolidate = [
  'Alfabeto.json',
  'ApiRoutes.json',
  'ArticulacionDetallada.json',
  'ClasificadoresNominales.json',
  'CombinacionesSonoras.json',
  'Consonantes.json',
  'Diccionario.json',
  'ErrorResponses.json',
  'Fonetica.json',
  'Generalidades.json',
  'Gramatica.json',
  'Introduccion.json',
  'Metadata.json',
  'Numero.json',
  'PatronesAcentuacion.json',
  'Pronombres.json',
  'Pronunciacion.json',
  'Recursos.json',
  'SearchConfig.json',
  'Sustantivos.json',
  'VariacionesDialectales.json',
  'Verbos.json',
  'Vocales.json',
];

const consolidatedData = {
  sections: {},
  clasificadores_nominales: {
    content: []
  }
};

filesToConsolidate.forEach(fileName => {
  const filePath = path.join(jsonFilesDir, fileName);
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent);

    const sectionName = fileName.replace('.json', '');

    // Special handling for 'ClasificadoresNominales.json'
    if (sectionName === 'ClasificadoresNominales') {
      if (jsonData.content) {
        consolidatedData.clasificadores_nominales.content = jsonData.content;
      }
    } else {
      // General handling for other sections
      consolidatedData.sections[sectionName] = {
        metadata: {
          title: jsonData.titulo || jsonData.title || sectionName,
          description: jsonData.descripcion || jsonData.description || ''
        },
        content: jsonData
      };
    }

    console.log(`Processed ${fileName}`);
  } catch (error) {
    console.error(`Error processing ${fileName}: ${error.message}`);
  }
});

try {
  fs.writeFileSync(outputFilePath, JSON.stringify(consolidatedData, null, 2), 'utf-8');
  console.log(`Successfully consolidated JSON files to ${outputFilePath}`);
} catch (error) {
  console.error(`Error writing consolidated file: ${error.message}`);
}
