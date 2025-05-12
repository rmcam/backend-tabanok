import { Module } from '@nestjs/common';
import { SeedCommand } from './seed'; // Importar SeedCommand

@Module({
  imports: [
    // Ya no es necesario importar entidades aquí, el DataSource se inicializa en seed.ts con dataSourceOptions
  ],
  providers: [SeedCommand], // Registrar SeedCommand como proveedor
  exports: [SeedCommand], // Exportar SeedCommand si es necesario (aunque CommandFactory lo descubre)
})
export class SeedModule {}
